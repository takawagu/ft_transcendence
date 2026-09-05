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
- マイグレーション [20260825051312_add_dm_indexes](backend/prisma/migrations/20260825051312_add_dm_indexes/) / [20260825063000_add_conversation_read](backend/prisma/migrations/20260825063000_add_conversation_read/) 適用済み

本書のスコープ: **フレンド間の1対1テキストメッセージの送受信・履歴表示**。
スコープ外（セクション6参照）: グループチャット、メッセージの編集/削除、**相手への既読表示（read receipts）**、添付ファイル。
未読件数の永続化は本書の範囲内（セクション1）。

---

## 1. データモデル

status: 実装済み（マイグレーション適用済み）

`DirectMessage`（[schema.prisma:70-79](backend/prisma/schema.prisma#L70-L79)）は既に定義されており、**本書の範囲ではカラム構成を変更しない**。
（後続の [room-invite-requirements.md](docs/room-invite-requirements.md) で、ルーム招待のために `type` / `roomCode` の2列を追加する。既存の送受信・履歴・未読の仕様はそのまま維持される。）

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

### 決定: 既読は「会話ごとのカーソル」で持つ（`ConversationRead`）

当初は既読管理を持たず、未読はセッション中のみの表示にしていた。しかし**リロードで未読が消えると「誰からのメッセージを見逃しているか」が分からなくなる**ため、永続化した。

`DirectMessage` に `readAt` を足す案は採らない。既読にするたびに該当メッセージを**全行 UPDATE** することになるため。会話ごとに1行のカーソルを持てば、既読化は1回の UPDATE で済み、得られる情報は変わらない。

```prisma
model ConversationRead {
  id                Int      @id @default(autoincrement())
  userId            Int      // 読んだ人
  partnerId         Int      // 会話の相手
  lastReadMessageId Int
  updatedAt         DateTime @updatedAt

  @@unique([userId, partnerId])
}
```

- マイグレーション [20260825063000_add_conversation_read](backend/prisma/migrations/20260825063000_add_conversation_read/) 適用済み
- **カーソルは後退させない。** 別タブで過去を遡っている間に巻き戻ると、読んだはずのメッセージが未読へ戻ってしまう。`Math.max(現在値, 受け取ったid)` で更新する
- `createdAt` ではなく `id` を基準にするのは、履歴のページングと同じ理由（同時刻の取りこぼしを避ける）
- **read receipts（相手に既読を見せる機能）はまだ実装しない**が、このカーソルは相手のぶんも引けるので、「自分のメッセージが読まれたか」の判定材料としてそのまま使える。Advanced chat features を取る段階で UI だけ足せばよい

未読の表示については セクション4 を参照。

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
| `GET /api/messages/unread` | 相手ごとの未読件数 |
| `GET /api/messages/:userId` | 特定の相手との履歴（ページング） |
| `POST /api/messages` | 送信 |
| `POST /api/messages/read` | そこまで読んだことにする |

**ルートの宣言順に注意。** `unread` / `read` は `:userId` より先に宣言する。後ろに置くと `/messages/unread` が `:userId` に吸われる。

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

### `GET /api/messages/unread`

- レスポンス: `{ userId: number, count: number }[]`（未読0の相手は含めない）
- 既読カーソルより新しい受信メッセージを `LEFT JOIN` + `GROUP BY` で数える。カーソルが無い相手は `COALESCE(..., 0)` で「1件も読んでいない」として扱う
- 会話一覧に混ぜず独立させたのは、**全ページで動く `PresenceProvider` がこれだけを引く**ため。ヘッダーのバッジのために会話一覧まるごとを毎回取りにいく必要はない

### `POST /api/messages/read`

- リクエスト: `{ userId: number, lastMessageId: number }`
- レスポンス: `{ userId, lastReadMessageId }`（後退防止の結果、送った値より大きくなることがある）
- エラー: `userId` が自分自身 → 400 / `lastMessageId` が1未満・型不正 → 400
- 成功時に**自分の全ソケットへ** `dm:read` を送り、別タブのバッジを揃える

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
| S→C | `dm:read` | `{ userId, lastReadMessageId }` | 会話を既読にした時（**本人の全タブへのみ**） |

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

### 未読表示

未読は `ConversationRead`（セクション1）で永続化してあるため、**リロードしても残る**。

- 初期値は `PresenceProvider` が `GET /api/messages/unread` から取得する（ログイン時・再ログイン時）
- 以降は `dm:received` で加算し、会話を開いたら `POST /api/messages/read` で消す
- バッジはサーバーの応答を待たずに先に消す。往復を待つと操作の手応えが鈍るため。記録に失敗しても次回の取得でサーバーの値に戻るだけなので、エラーは握りつぶす
- **初期取得と既読POSTの競合に注意。** `/messages` を直接開くと「未読の初期取得」と「履歴取得→既読POST」が同時に走る。初期取得の応答で素直に上書きすると、**既読にしたばかりの相手の未読が復活する**。取得中に既読にした相手を覚えておき、応答から取り除くことで防ぐ

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

### 会話相手のプロフィール

subject の Advanced chat features「Access to user profiles from chat interface」に対応する（セクション6）。

- 会話ヘッダーの右端に ⓘ ボタンを置き、押すと相手のプロフィールウィンドウ（アバター・自己紹介・在席・フレンド削除・ブロック）を開く
- ウィンドウはホーム画面のフレンド一覧の「詳細」と**同じ実体**。ホームのインラインJSXを [friend-info.tsx](frontend/src/lib/friend-info.tsx) の `FriendInfoWindow` へ切り出し、両方から使う。ブロックの確認ステップはウィンドウ内部の state に閉じ込めた（呼び出し側が知る必要がないため）
- `/messages` では「メッセージ」ボタンを出さない（今まさにその会話を開いているため）。`onMessage` を渡さないと消える
- フレンド削除・ブロックが成功したら相手はフレンドでなくなるので、一覧から取り除いて**会話も閉じる**。開いたままにすると履歴取得が403になる（セクション3）

### 入力の上限

`content` の入力欄に `maxLength={1000}` を付ける（セクション1の DTO と揃える）。**残り100文字を切ったら残量を表示し、0で赤字に変える。** `maxLength` は上限に達すると無言で入力を受け付けなくなるため、打ち止めの理由が分かるようにする。
サーバー任せにすると、超過時に英語のバリデーションメッセージ（`content must be shorter than or equal to 1000 characters`）がそのまま出るため。

`maxLength` も `@MaxLength` も UTF-16 のコード単位で数えるので、両者の数え方はずれない（BMP外の絵文字は双方で2文字扱い）。

---

## 6. スコープ外・既知の制約

status: 未着手

- **グループチャット**: 1対1のみ。`DirectMessage` は `senderId`/`receiverId` の2者構造なので、対応するならモデルから作り直しになる
- **メッセージの編集・削除**: 実装しない
- **相手への既読表示（read receipts）**: 判定に必要なカーソルはセクション1で用意済みだが、UIは出さない。Advanced chat features 側の課題
- **添付ファイル**: 実装しない。subject では別 Minor モジュール（File upload）扱い
- **通知の永続化**: 未読件数はDBで永続化済み（セクション1）。それ以外の通知（フレンド申請など）はセッション中の表示のみ

### 将来: Advanced chat features（Minor 1点）との関係

このモジュールは basic chat の実装が前提。要求される機能のうち、**既に別機能として実装済みのものがある**。

| 要求機能 | 現状 |
|---|---|
| Ability to block users from messaging you | ✅ ブロック機能で実現済み（セクション3） |
| Access to user profiles from chat interface | ✅ 会話ヘッダーの ⓘ からプロフィールウィンドウを開ける（セクション5） |
| Chat history persistence | ✅ 本書の実装で満たす |
| Invite users to play games directly from chat | ✅ [room-invite-requirements.md](docs/room-invite-requirements.md) の実装で実現済み（`DirectMessage` に `type` / `roomCode` を足して相乗りさせた） |
| Game/tournament notifications in chat | ❌ 未着手 |
| Typing indicators and read receipts | ⏳ 既読カーソル（`ConversationRead`）は実装済み。UIとtyping通知が未着手 |

6項目のうち5項目が実装済みになった。**残るは Game/tournament notifications（❌）と typing indicators（⏳。既読カーソルはあるがUIが無い）の2つ**。
「Invite users to play games directly from chat」は [room-invite-requirements.md](docs/room-invite-requirements.md) の実装で満たした。本書のセクション1で決めた `DirectMessage` のカラム構成に `type` / `roomCode` の2列が加わっている。

---

## 関連ドキュメント

- [friend-requirements.md](docs/friend-requirements.md) — フレンド機能・ブロック・`/presence` の設計
- [room-invite-requirements.md](docs/room-invite-requirements.md) — ito ルームへの招待。`DirectMessage` に相乗りする
- [login-requirements.md](docs/login-requirements.md) — 認証とバリデーション方針
