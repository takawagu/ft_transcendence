# DM（ダイレクトメッセージ）機能 要件・設計定義

ft_transcendence subject の以下の要件に対応するための定義書。

- **Web モジュール（Major: Allow users to interact with other users）**
  > The minimum requirements are:
  > ◦ A basic chat system (send/receive messages between users).
  > ◦ A profile system (view user information).
  > ◦ A friends system (add/remove friends, see friends list).

**この Major は3つセットで1モジュール（2点）**であり、DM 単体では点にならない。3項目の現状は次のとおり。

| 要件 | 状況 |
|---|---|
| A basic chat system | 実装済み（本書） |
| A profile system (view user information) | フレンド詳細ウィンドウが該当し得る（[friend-requirements.md](docs/friend-requirements.md) セクション6）。判定が弱いと考えるなら戦績表示の追加を検討 |
| A friends system | 実装済み（[friend-requirements.md](docs/friend-requirements.md)） |

現状の実装:
- `DirectMessage` モデル（[schema.prisma:70-79](backend/prisma/schema.prisma#L70-L79)）は着手前は**定義だけあり、API・UI ともに未実装**だった。バックエンドから参照している箇所もゼロだった
- API（[messages/](backend/src/messages/)）・UI（[messages/page.tsx](frontend/src/app/messages/page.tsx)）ともに実装済み
- リアルタイム配信は既存の `/presence` WebSocket 名前空間（[presence/](backend/src/presence/)）に相乗りしている
- マイグレーション [20260825051312_add_dm_indexes](backend/prisma/migrations/20260825051312_add_dm_indexes/) 適用済み

本書のスコープ: **フレンド間の1対1テキストメッセージの送受信・履歴表示**。
スコープ外（セクション6参照）: グループチャット、メッセージの編集/削除、既読管理、添付ファイル。

---

## 1. データモデル

status: 実装済み（マイグレーション適用済み）

`DirectMessage`（[schema.prisma:70-79](backend/prisma/schema.prisma#L70-L79)）は既に定義されており、**カラム構成は変更しない**。

| カラム | 意味 |
|---|---|
| `senderId` | 送信者のユーザーID |
| `receiverId` | 受信者のユーザーID |
| `content` | 本文 |
| `createdAt` | 送信日時 |

### 決定: インデックスを2本追加する

会話履歴は「AとBの間のメッセージを時系列で取得する」形になるため、`senderId` / `receiverId` を**両方向**で引く。

```prisma
@@index([senderId, receiverId, createdAt])
@@index([receiverId, senderId, createdAt])
```

1本では `OR` の片側しか使われず、もう片側がフルスキャンになる。マイグレーションが1本必要（[migrations/](backend/prisma/migrations/) に追加）。

### 決定: 既読管理のカラムは追加しない

`readAt` 等は持たせない。subject の basic chat 要件は「send/receive messages」までであり、**既読表示（read receipts）は上位の「Advanced chat features」モジュール側に明記された機能**のため。そちらを取る段階で改めて設計する。

セッション中の未読通知については セクション4 を参照。

### 要修正: `content` の長さが無制限

`content String` は `@db.VarChar` が無いため Postgres の `text`（事実上1GB）。`PUT /api/users/me` と同じ穴（#63）なので、**DTO で 1000文字上限**をかける。DB 側のカラム型は変更しない。

---

## 2. API 仕様

status: 実装済み

[backend/src/messages/](backend/src/messages/) に `MessagesModule` / `MessagesController` / `MessagesService` を新設した。フレンド判定のため `FriendsModule` を import する（`FriendsService` は既に `exports` 済み）。

全エンドポイントが `AuthGuard` 必須。ベースパスは `/api/messages`。

| エンドポイント | 内容 |
|---|---|
| `GET /api/messages/conversations` | 会話一覧（相手ごとの最新メッセージ） |
| `GET /api/messages/:userId` | 特定の相手との履歴（ページング） |
| `POST /api/messages` | 送信 |

### `GET /api/messages/conversations`

左ペインの会話一覧に使う。

- レスポンス: `{ userId, content, createdAt, senderId }[]`（`content` は一覧用に先頭100文字へ切り詰め）
- **相手ごとの最新1件のみ**を返す。Postgres の `DISTINCT ON` を使った生クエリ1本で引く（フレンドごとに `findFirst` を回すと N+1 になるため）
- 新しい会話順（`createdAt` 降順）
- フロントは `GET /api/friends` の結果とこれを突き合わせて一覧を描く。**メッセージが1件も無いフレンドも一覧に出す**（そこから会話を始められるようにするため）

### `GET /api/messages/:userId`

- クエリ: `before`（省略可、`DirectMessage.id`）/ `limit`（省略時50、最大100）
- レスポンス: `{ id, senderId, receiverId, content, createdAt }[]` を **`createdAt` 昇順**（画面表示順）で返す
- 内部では `id` 降順で `limit` 件取得してから反転する。`before` 指定時は `id < before` を追加する（カーソルページング。`createdAt` ではなく `id` を使うのは同時刻の取りこぼしを避けるため）
- **相手が現在フレンドでなければ 403 を返し、履歴を見せない**（セクション3）

### `POST /api/messages`

- リクエスト: `{ receiverId: number, content: string }`
- レスポンス: 作成されたメッセージ
- エラー:

| 条件 | ステータス | 備考 |
|---|---|---|
| `content` が空 / 空白のみ / 1000文字超 | 400 | DTO で検証。**検証前に `@Transform` で trim する**ため、空白だけの本文も「空」として弾かれる（保存される本文も trim 済み） |
| `receiverId` が自分自身 | 400 | |
| **相手がフレンドでない** | **403** | ブロック・フレンド解除もここで弾かれる（セクション3） |

送信成功時に `/presence` 経由で相手と自分へ配信する（セクション4）。

---

## 3. フレンド・ブロックとの関係

status: 決定済み

### 決定: 送信も履歴取得もフレンド限定

`Friendship` が `ACCEPTED` の相手とのみ、送受信・履歴取得ができる。

この方針の利点は、**ブロックのための判定を DM 側に一切書かなくて済む**ことにある。ブロック実行時に該当ペアの `Friendship` 行を全削除する仕様（[friend-requirements.md](docs/friend-requirements.md) セクション3）があるため、次が自動的に成立する。

- ブロックした相手からの DM は届かない（フレンドではなくなるため）
- ブロックした相手へ DM を送れない（同上）
- ブロックは片方向だが、`Friendship` の削除は双方向に効くので、遮断も双方向になる

### 決定: 履歴は削除しないが、見えなくする

フレンド解除・ブロックをしても `DirectMessage` の行は**削除しない**。

- 削除すると、片方の操作で相手の履歴まで消えることになる。ブロックは片方向の意思表示なので、相手の記録まで奪うのは行き過ぎ
- ただし**フレンドでない相手との履歴は取得できない**（`GET /api/messages/:userId` が 403）。再びフレンドになれば過去の履歴がそのまま見える

「再フレンド時に過去の会話が復活する」のは意図した挙動として記録する。

---

## 4. リアルタイム配信

status: 実装済み

### 決定: `/presence` 名前空間に相乗りする

DM 専用の名前空間は新設しない。既にオンライン状態とフレンド申請通知を運んでいる接続（[presence.gateway.ts](backend/src/presence/presence.gateway.ts)）にイベントを追加する。JWT 認証・在席管理・フロントの接続管理をもう一度書かずに済むため。

| 方向 | イベント | ペイロード | タイミング |
|---|---|---|---|
| S→C | `dm:received` | `{ message, user }` | メッセージが作成された時 |

- `message` は作成された `DirectMessage`、`user` は**相手**の公開情報（`{ id, username, bio, profileImage }`）
- **受信者と送信者の両方へ送る。** 送信者にも送るのは、同じアカウントで開いている別タブの画面を同期させるため（`PresenceService.emitToUser` は該当ユーザーの全ソケットへ配信する）
- C→S のイベントは追加しない。送信は `POST /api/messages` で行い、WebSocket は配信専用に保つ

### 決定: `/presence` 接続を layout の Provider へ持ち上げる（実装済み）

`/presence` 接続はホーム画面のコンポーネントで張っていたため、ページ遷移で切断されていた（[friend-requirements.md](docs/friend-requirements.md) セクション4の既知の制約）。`/messages` を新設すると、同じ接続コードを2ページに書き、**行き来のたびに接続し直す**ことになる。

そこで **[layout.tsx](frontend/src/app/layout.tsx) に Context/Provider を新設し、ログイン中は全ページで接続を1本維持する**方式へ移行した。

- ホーム画面と `/messages` が同じ `onlineFriendIds` と `dm:received` を共有する
- **ito ルーム滞在中もオンライン扱いになる。** friend-requirements.md セクション4の「ゲーム中のフレンドはオフライン表示になる」既知の制約が同時に解消された
- ito ルームの WebSocket（`/ito`）とは名前空間が異なるため、2本が並存しても競合しない

#### 構成

| ファイル | 役割 |
|---|---|
| [session.tsx](frontend/src/lib/session.tsx) | `SessionProvider` / `useSession`。`token` `user` `login` `logout` `updateUser` `apiCall` と、起動待ちバナーの表示 |
| [presence.tsx](frontend/src/lib/presence.tsx) | `PresenceProvider` / `usePresence`。`/presence` 接続、`onlineFriendIds`、`unreadCounts`、`subscribe` |
| [avatar.tsx](frontend/src/lib/avatar.tsx) | `renderAvatar`。ホーム画面と `/messages` で共有 |

`PresenceProvider` は `SessionProvider` の内側に置く（接続条件が `token` のため）。

- **ログイン状態も一緒に持ち上げた。** presence の接続条件が `token` であり、`token` をページ側に残すと遷移のたびに認証状態が作り直されて接続も切れるため
- **`apiCall` も Provider へ移した。** `/messages` からも同じリトライ・401ログアウトの挙動が要るため。起動待ちバナー（`apiWaiting`）は Provider が1箇所で描画するので、ページ側に置く必要がなくなった
- **イベントは `subscribe(event, handler)` で中継する。** Provider が保持するのは `onlineFriendIds` と未読だけにとどめ、`dm:received` などに何をするかはページ側の判断に委ねる。購読者一覧は接続とは別に ref で持つため、再接続しても購読は外れない

### セッション中のみの未読表示

`readAt` を持たないため永続的な未読管理はできない（セクション1）。代わりに、`dm:received` を受け取ったらヘッダーのメッセージ導線にバッジを出す。**リロードすると消える**ことを制約として明記する。

未読の判定は `PresenceProvider` が行い、**`unreadCounts: Map<相手のID, 件数>`** として保持する。有無ではなく件数で持つのは、**誰から何件見逃しているか**を会話一覧で出すため。

- `dm:received` は送信者本人にも届くため、**`message.senderId` が `user.id`（＝会話の相手）と一致する時だけ**未読にする。一致しなければ自分が送ったメッセージの echo なので無視する
- Provider 内のハンドラは購読者への中継より先に登録してあるので、その会話を開いている `/messages` が直後に `markConversationRead(userId)` を呼んで取り消せる
- 会話を選択した時と、開いている会話にメッセージが届いた時に既読扱いにする（その相手のキーごと削除する）
- ホームのヘッダーには**総件数**、`/messages` の会話一覧には**相手ごとの件数**を出す。3桁以上は `99+` に丸める

---

## 5. 画面仕様

status: 実装済み（[messages/page.tsx](frontend/src/app/messages/page.tsx)）

### 決定: 専用ページ `/messages` を新設する

[messages/page.tsx](frontend/src/app/messages/page.tsx)。左に会話一覧、右にメッセージという2ペイン構成。

```
/messages
┌───────┬────────────────┐
│ Dev2  │ Dev2           │
│ test  │                │
│       │  こんにちは     │
│       │      やあ      │
│       │                │
│       │ [____][送信]   │
└───────┴────────────────┘
```

フレンドパネル内のタブにしなかった理由: パネルは `max-h-[300px]` のサイドカラムで、チャット履歴のスクロール領域として狭すぎるため。

### 左ペイン: 会話一覧

- `GET /api/friends` と `GET /api/messages/conversations` を突き合わせて表示
- 1件ごとに アバター・username・**オンライン状態**（`presence:snapshot` / `presence:changed` から、フレンドパネルと同じ扱い）・最新メッセージの抜粋・**未読件数バッジ**（セクション4）
- 未読がある行は username を白の太字、抜粋を明るめにして、バッジ以外でも気づけるようにする
- メッセージのある会話を上に、未送信のフレンドをその下に置く
- フレンドが0件のときは「フレンドがいません」＋ホームへの導線
- **`conversations` に含まれていても、現在フレンドでない相手は一覧から除く。** フレンド解除・ブロック後の会話がここに残るが、履歴取得が403になるので開けないため（セクション3）

### 右ペイン: メッセージ

- 自分の発言は右寄せ、相手は左寄せ
- **アバターと発言者名を吹き出しのすぐ隣に置く。** 左右の寄せだけでは、スクロール中にどちらの発言か追いにくいため
- **同じ人の連投は1つのまとまりとして扱い、アバターと名前は先頭の1件にだけ出す。** 毎行に出すと縦に間延びして、かえって読みにくくなる。2件目以降もアバター幅の余白は空けて吹き出しの端を揃える
- 上方向スクロールで `before` を使って過去を追加読み込み（セクション2）
- 送信フォームは下部固定。Enter で送信、Shift+Enter で改行。**IME変換確定のEnterで誤送信しないよう `isComposing` を見る**
- 送信中は入力欄を無効化しない（連投できるようにする）が、`content` が空なら送信ボタンを無効化
- 送信は `POST` の応答でその場に描き、届いた `dm:received` は `id` で重複を弾く。WebSocketの往復を待たないため、接続が一時的に切れていても自分の発言は表示される
- 狭い画面では2ペインを同時に出さず、会話を開いている間は一覧を隠す（戻るボタンを置く）

#### 配色の方針

背景 `zinc-950` に対して境界線を `zinc-900` にすると、両者の差が小さすぎて線が見えない。**境界を線1本に頼らせず、面で分ける**。

- 左ペインは `bg-zinc-900/60`、メッセージ領域は `bg-zinc-950` と、面の明るさを変える
- 会話ヘッダーと入力エリアも `bg-zinc-900/50` を敷き、メッセージ領域と区別する
- 構造的な境界線は `zinc-700`、一覧の行区切りは `zinc-700/60`
- 一覧のホバーは `zinc-800/60`（面が明るくなった分、`zinc-900` 系では反応が見えない）
- 入力欄は明るくなった台座に沈まないよう `bg-zinc-950` + `border-zinc-700` と明暗を反転させる

#### スクロール制御

チャットで最も壊れやすい部分なので方針を明記する。

- **末尾のメッセージIDが変わった時だけ**最下部へ追従する。「メッセージが増えたら追従」にすると、上へ読み足した瞬間に最下部へ飛ばされて過去が読めなくなる
- 過去の読み足しでは `useLayoutEffect` で `scrollHeight` の増分だけ下へずらし、見えている位置を保つ

### ホーム画面からの導線

- ヘッダーに「メッセージ」ボタンを追加し `/messages` へ遷移。未読があればバッジを重ねる（セクション4）
- フレンド詳細ウィンドウにも「メッセージ」ボタンを置き、`/messages?to=<userId>` でその相手を開いた状態にする
- **会話を自動で開くのは `?to=` がある時だけ。** ヘッダーからの遷移では何も選択せず一覧を見せる（直近の会話を勝手に開くと、狭い画面ではその会話画面に着地してしまうため）
- `useSearchParams` はプリレンダリング時に Suspense 境界を要求するため、ページ本体を `<Suspense>` で包んでいる

### アバター描画の共通化

`renderAvatar` はホーム画面のローカル関数だったが、`/messages` でも同じ見た目が要るので [avatar.tsx](frontend/src/lib/avatar.tsx) へ切り出した。

### 入力の上限

`content` の入力欄に `maxLength={1000}` を付ける（セクション1の DTO と揃える）。**残り100文字を切ったら残量を表示し、0で赤字に変える。** `maxLength` は上限に達すると無言で入力を受け付けなくなるため、打ち止めの理由が分かるようにする。
サーバー任せにすると、超過時に英語のバリデーションメッセージ（`content must be shorter than or equal to 1000 characters`）がそのまま出るため。

`maxLength` も `@MaxLength` も UTF-16 のコード単位で数えるので、両者の数え方はずれない（BMP外の絵文字は双方で2文字扱い）。

---

## 6. スコープ外・既知の制約

status: 未着手

- **グループチャット**: 1対1のみ。`DirectMessage` は `senderId`/`receiverId` の2者構造なので、対応するならモデルから作り直しになる
- **メッセージの編集・削除**: 実装しない
- **永続的な既読管理**: セクション1のとおり Advanced chat features 側の課題
- **添付ファイル**: 実装しない。subject では別 Minor モジュール（File upload）扱い
- **通知の永続化**: セッション中のバッジのみ（セクション4）

### 将来: Advanced chat features（Minor 1点）との関係

このモジュールは basic chat の実装が前提。要求される機能のうち、**既に別機能として実装済みのものがある**。

| 要求機能 | 現状 |
|---|---|
| Ability to block users from messaging you | ✅ ブロック機能で実現済み（セクション3） |
| Access to user profiles from chat interface | ⏳ フレンド詳細ウィンドウを `/messages` から開けるようにすれば満たせる |
| Chat history persistence | ✅ 本書の実装で満たす |
| Invite users to play games directly from chat | ❌ ito ルームへの招待導線が必要 |
| Game/tournament notifications in chat | ❌ 未着手 |
| Typing indicators and read receipts | ❌ 未着手 |

前半3つは本書の実装でほぼ揃うため、**追加1点の獲得は残り3項目の実装次第**になる。

---

## 関連ドキュメント

- [friend-requirements.md](docs/friend-requirements.md) — フレンド機能・ブロック・`/presence` の設計
- [login-requirements.md](docs/login-requirements.md) — 認証とバリデーション方針
