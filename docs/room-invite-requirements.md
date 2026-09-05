# ルーム招待機能 要件・設計定義

ft_transcendence subject の以下の要件に対応するための定義書。

- **Web モジュール（Minor: Advanced chat features）**
  > ◦ Ability to block users from messaging you.
  > ◦ **Invite users to play games directly from chat.**
  > ◦ Game/tournament notifications in chat.
  > ◦ Access to user profiles from chat interface.
  > ◦ Chat history persistence.
  > ◦ Typing indicators and read receipts.

**この Minor は basic chat の実装が前提**であり、6項目のうち何点が満たせているかで判定される。本書はそのうち `Invite users to play games directly from chat` を担当する。他項目の現状は [dm-requirements.md](docs/dm-requirements.md) セクション6の対応表を参照。

現状の実装:
- ito ルームは [`RoomStore`](backend/src/ito/service/room.store.ts) 上の**プロセス内メモリ管理**。DBには一切載っていない
- ルームへの参加手段は「ルームコードを外部で伝える」しかない。ホーム画面のコード入力欄（[page.tsx:262-267](frontend/src/app/page.tsx#L262-L267)）が唯一の導線
- フレンド・DM・オンライン状態は実装済み（[friend-requirements.md](docs/friend-requirements.md) / [dm-requirements.md](docs/dm-requirements.md)）
- **本書の内容は実装済み**（セクション6のスコープ外項目を除く）

本書のスコープ: **ホストが待機画面からフレンドを ito ルームへ招待し、受け取った側が1クリックで参加できるようにすること**。
スコープ外（セクション6参照）: フレンド以外への招待、招待の承認/拒否フロー、トーナメント通知、ルーム作成時の自動一斉送信。

---

## 0. 前提となる設計判断

status: 決定済み

### 決定: 招待は「ルームコードの配達」以上の権限を持たない

ito の `joinRoom`（[room.service.ts:63-99](backend/src/ito/service/room.service.ts#L63-L99)）は、**ルームコードさえ知っていれば誰でも入れる**。招待されたかどうかは一切見ていない。この既存設計を変えない。

したがって `ROOM_INVITE` は「参加ボタンが付いたコード通知」でしかなく、承認/拒否のステートマシンを持たせない。この判断から次が導かれる。

- 招待の消費・失効をサーバーで管理する必要がない
- 参加時の検証（ルーム不在 / 開始済み / 満員 / 二重参加）は**既存の `joinRoom` がそのまま担う**。新しい失敗経路を作らない
- 専用テーブルも専用 WebSocket イベントも要らない

逆に言えば、**招待を送ることは「このコードを教える」以上の意味を持たない**。招待していない相手がコードを知って入ってくることは、本書の実装後も防げない。

**追記（ブロック相手だけは例外）**: 上の一文をそのまま残すと、ブロックした相手がコードを知っているだけで同席できてしまう。招待の送信は `assertFriends` で止まるが、参加そのものは止まらないため。この1点だけは後から `joinRoom` に判定を足して塞いだ（[friend-requirements.md](docs/friend-requirements.md) セクション3の「ito ルームへの参加」）。それ以外の「招待していない相手の飛び入り」は引き続き防がない。

### 決定: 送信契機は「待機画面でホストが選んで送る」

「ルーム作成と同時に全フレンドへ自動送信」は採らない。

- 作成は `/ito/room/new` へ遷移した瞬間に走る（[page.tsx:255-260](frontend/src/app/page.tsx#L255-L260) → [room.service.ts:24-61](backend/src/ito/service/room.service.ts#L24-L61)）。**ユーザーが「作る」と決める前に通知が飛ぶ**設計になってしまう
- 部屋は最大6人。フレンドが20人いれば14通は確実に無駄になる
- 誤爆した招待を取り消す手段が無い（セクション0の決定により、招待は送った時点で有効なコード通知になる）

ホストが明示的に相手を選ぶ形にする。

---

## 1. データモデル

status: 実装済み（マイグレーション `add_room_invite` 適用済み）

`DirectMessage`（[schema.prisma:72-86](backend/prisma/schema.prisma#L72-L86)）に2カラム追加する。マイグレーション名は `add_room_invite`。

```prisma
model DirectMessage {
  // ...既存のカラム
  /// TEXT | ROOM_INVITE。ROOM_INVITE のとき roomCode が非nullになる
  type       String   @default("TEXT")
  roomCode   String?
}
```

| カラム | 意味 |
|---|---|
| `type` | `TEXT`（通常のDM）または `ROOM_INVITE`（ルーム招待） |
| `roomCode` | 招待先のルームコード。`type = 'TEXT'` のときは `null` |

- **不変条件**: `type = 'ROOM_INVITE'` ⟺ `roomCode !== null`
- 既存行は `@default("TEXT")` で埋まるため、データ移行は不要
- インデックスは追加しない。招待だけを検索する画面が無く、常に会話履歴の一部として引かれるため

### 決定: 専用テーブルではなく `DirectMessage` に相乗りさせる

subject の文言が `Invite users to play games directly **from chat**` であり、招待がチャットの中に存在すること自体が要件の一部。専用の `RoomInvite` テーブルに切り出すと、DM とは別系統のデータを `/messages` の画面上で時系列マージする羽目になる。

相乗りにすることで、以下が**すべて無改修で成立する**。

| 機能 | 理由 |
|---|---|
| 会話一覧のプレビュー | `content` を持つので [messages.service.ts:60](backend/src/messages/messages.service.ts#L60) の切り詰めがそのまま効く |
| 未読件数 | `ConversationRead` の `lastReadMessageId` は `DirectMessage.id` を見ているだけ |
| 履歴のページング | `id` 昇降順で引く既存クエリに乗る |
| リアルタイム配信 | `dm:received` のペイロードがメッセージ行そのもの |
| ブロック時に見えなくなる | フレンド判定に依存する既存の遮断がそのまま効く |

### 決定: `content` には固定文言を入れる

`content` を空にすると、会話一覧のプレビューが空欄になる。招待には次の固定文言を入れる。

```
ゲームルームに招待しました
```

これで一覧側（[page.tsx:380](frontend/src/app/messages/page.tsx#L380)）は無改修のまま「あなた: ゲームルームに招待しました」と表示される。スレッド内では `content` を使わず招待カードを描くため（セクション4-c）、文言が二重に出ることはない。

---

## 2. API 仕様

status: 実装済み

`POST /api/messages/invite` を [MessagesController](backend/src/messages/messages.controller.ts) に追加する。`AuthGuard` は Controller 単位で効いているため個別指定は不要。

**ルートの宣言順**: 既存の `@Get(':userId')`（[messages.controller.ts:45](backend/src/messages/messages.controller.ts#L45)）は GET なので `POST /invite` と食い合わない。ただし将来 `GET /invite` を足すなら `:userId` より前に置くこと。

| エンドポイント | 内容 |
|---|---|
| `POST /api/messages/invite` | ルーム招待を送る |

### `POST /api/messages/invite`

- リクエスト: `{ receiverId: number, roomCode: string }`
- レスポンス: 作成された `DirectMessage`（`type` / `roomCode` を含む）

DTO は [messages.dto.ts](backend/src/messages/dto/messages.dto.ts) に `SendRoomInviteDto` として追加する。

```ts
export class SendRoomInviteDto {
  @IsInt()
  receiverId: number;

  /** 生成側の charset と揃える（room.store.ts:71）。I/O/0/1 は含まない */
  @Matches(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
  roomCode: string;
}
```

`MessagesService.sendRoomInvite(myId, receiverId, roomCode)` の検証は**この順序で**行う。

| # | 条件 | ステータス | 備考 |
|---|---|---|---|
| 1 | `receiverId` が自分自身 | 400 | |
| 2 | 相手がフレンドでない | 403 | 既存 private `assertFriends`（[messages.service.ts:180-186](backend/src/messages/messages.service.ts#L180-L186)）を再利用。**ブロックは Friendship 削除で表現されるため、これだけで遮断が成立する**（[friend-requirements.md](docs/friend-requirements.md) セクション3） |
| 3 | `roomStore.getRoomByCode(roomCode)` が空 | 404 | |
| 4 | `room.roomPhase !== 'WAITING'` | 400 | 開始済みの部屋には誰も入れない |
| 5 | 送信者がそのルームのホストでない | 403 | `room.players.find(p => p.isRoomOwner)?.playerId !== String(myId)` |
| 6 | 受信者が既にそのルームに居る | 400 | `room.players.some(p => p.playerId === String(receiverId))` |
| 7 | 同一 (sender, receiver, roomCode) の招待が既にある | — | **新規作成せず既存行を返す**（冪等） |

**#5 が必須である理由**: これが無いと、任意のユーザーが任意のルームコードを添えてフレンドへ招待を送れる。ホスト以外は招待できないという当たり前の制約を、サーバー側で担保する。

**#7 の理由**: ホストが待機画面で同じ相手を2回押した場合や、通信が不安定で再送された場合に、同じ招待がスレッドに積み上がるのを防ぐ。UI 側でも「招待済み」表示にするが（セクション4-a）、その state はページを離れると消えるので、サーバー側にも置く。

配信は既存の [`sendMessage`](backend/src/messages/messages.service.ts) と同じく、**受信者と送信者の両方**へ `PRESENCE_EVENTS.DM_RECEIVED` を emit する（同じアカウントの別タブを同期させるため）。この2件の emit は `sendMessage` と共通なので、private `broadcastMessage` に切り出して両者から呼ぶ。

ただし **#7（既存行を返す経路）では emit しない**。その招待は受信者側で既に1件として数えられており、再送すると同じ招待で未読が二重に増えるため。

### 決定: 新しい presence イベントは追加しない

`ito:inviteReceived` のような専用イベントは作らない。招待は `DirectMessage` の行なので、既存の `dm:received`（[presence.events.ts:32](backend/src/presence/presence.events.ts#L32)）のペイロードに `type` / `roomCode` が乗るだけで判別できる。

専用イベントにすると、未読カウント（[presence.tsx:218-225](frontend/src/lib/presence.tsx#L218-L225)）と `/messages` のスレッド追記の両方に**同じ内容の分岐を二重に**書くことになる。

### モジュール配線

招待の検証にルームの実体が要るため、`MessagesService` から `RoomStore` を参照する。

- [ito.module.ts](backend/src/ito/ito.module.ts) に `exports: [RoomStore]` を追加
- [messages.module.ts](backend/src/messages/messages.module.ts) の `imports` に `ItoModule` を追加

`ItoModule` は `MessagesModule` を参照しないので循環参照にはならない。`RoomStore` は状態を持つ純粋なストアで、gateway やソケットに依存していないため、HTTP 側から読んでも副作用がない。

---

## 3. 有効期限と失効

status: 実装済み（TTLは `frontend/src/lib/room-invite.ts` の `ROOM_INVITE_TTL_MS`）

招待先のルームは**メモリ上にしか存在せず**、ホストの解散・全員切断・バックエンド再起動のいずれでも消える。DBに残った招待行は、その時点で宛先を失う。

### 決定: サーバー側の失効管理は持たない

セクション0の決定により、招待は権限を持たないただのコード通知なので、「失効した招待」という状態を管理する価値がない。代わりに次の2段構えにする。

1. **フロント側の見た目**: `createdAt` から **30分**を過ぎた招待は「期限切れ」表示にし、`参加` ボタンを無効化する
2. **実際の失敗**: 期限内でもルームが消えていれば、`参加` 後に既存の `ito:error`「ルームが見つかりません」が出る（[room.service.ts:65-68](backend/src/ito/service/room.service.ts#L65-L68)）。**これを正規の失敗経路とする**

30分という値は「1ゲームが終わる程度の時間」から取った目安であり、サーバーは一切参照しない。フロントの定数として1箇所に置く。

### 既知の制約: ルームコードの再利用

`generateRoomCode`（[room.store.ts:70-80](backend/src/ito/service/room.store.ts#L70-L80)）は**生存中のルームとの衝突しか避けない**。したがって理論上、古い招待が「同じコードを引き当てた別人の新しいルーム」を指すことがありうる。

- 空間は 32⁶ ≈ **10.7億通り**。同時に存在するルームが数十程度である限り、実質的に起こらない
- 30分のTTLで窓をさらに狭める
- 完全に潰すには招待に `room.id`（`ito_<timestamp>`）も持たせて参加時に突き合わせる必要があるが、`joinRoom` のペイロードとサーバー側の検証を増やす対価に見合わないため**採らない**

### 既知の制約: `/ito` に認証が無い

`/ito` 名前空間は JWT を検証しておらず、`playerId` はクライアントの申告値（[page.tsx:84](frontend/src/app/ito/room/[roomCode]/page.tsx#L84) → [ito.gateway.ts:55-61](backend/src/ito/ito.gateway.ts#L55-L61)）。つまり他人の `userId` を名乗ってルームのホストになりすますこと自体は可能。

ただし**招待の送信は JWT 認証された REST を通る**ため、なりすまし側が招待を送るには被害者の JWT が別途必要になる。本書の機能はこの穴を拡大しない。`/ito` の認証は別途 [reconnect-design.md](docs/reconnect-design.md) 側の課題として扱う。

---

## 4. 画面仕様

status: 実装済み

### (a) 待機画面の招待パネル

[WaitingRoom.tsx](frontend/src/app/ito/room/[roomCode]/_phases/WaitingRoom.tsx) に、**ホストにのみ**「フレンドを招待」ボタンを追加する。押すとオーバーレイパネル（`_phases/InvitePanel.tsx`）を開く。「招待済み」の state は WaitingRoom 側が持つ（パネル内に置くと開き直すたびに表示が退行するため）。

ルームページは 1024×720（縦向き時 480×800）の仮想解像度をスケールして表示している（[page.tsx:303-315](frontend/src/app/ito/room/[roomCode]/page.tsx#L303-L315)）ため、**パネルはこの枠の内側**に置く。`fixed` で画面全体に張るとスケールの外に出て見た目が壊れる。

- 一覧は開いた時に `useSession().apiCall('/api/friends')` で取得する。在席は `usePresence().onlineFriendIds`
  - `SessionProvider` / `PresenceProvider` は root layout にある（[layout.tsx:34-36](frontend/src/app/layout.tsx#L34-L36)）ので、ルームページ配下からも `use...` フックで参照できる
- 並び順: **オンラインを上**、オフラインは下にグレー表示
- **オフラインのフレンドにも送れる。** DMとして残るので後から気づける。これが専用テーブルではなく DM に相乗りさせたことの実利
- 各行の状態:

| 状態 | 判定 | 表示 |
|---|---|---|
| 未招待 | 上記いずれでもない | `招待` ボタン |
| 招待済み | 送信成功したIDをローカル state に持つ | `招待済み`（ボタン無効） |
| 参加中 | `state.players` に同じ id が居る | `参加中`（ボタン無効） |

- `state.players.length >= 6` のときは「フレンドを招待」ボタン自体を無効化する（満員。上限は [room.service.ts:73](backend/src/ito/service/room.service.ts#L73)）
- 送信失敗時は既存の `ito:error` トーストではなくパネル内にメッセージを出す（REST の失敗であり ito のイベントではないため）
- アバターは既存の [`renderAvatar`](frontend/src/lib/avatar.tsx) を使う

### (b) 受信トースト（全画面共通）

新規 `frontend/src/lib/invite-toast.tsx` に `<RoomInviteToast />` を作り、[layout.tsx](frontend/src/app/layout.tsx) の `PresenceProvider` の内側に置く。

- `usePresence().subscribe('dm:received')` を購読し、`type === 'ROOM_INVITE'` かつ**自分が受信者**のものだけ拾う
  - `dm:received` は送信者にも届く（別タブ同期のため）。`message.senderId === user.id` は無視する
- 表示: 送信者のアバター＋「〇〇さんがルームに招待しました」＋ルームコード＋`参加` / `閉じる`
- 約20秒で自動的に消える。複数届いたら縦に積む
- **`/ito/room/` 配下に居る間は表示しない**（`usePathname` で判定）。プレイ中の画面に「別の部屋へ移動する」導線を出すのは事故のもと。招待自体は `/messages` に残るので失われない

### 決定: `参加` の遷移手順を1箇所に揃える

トースト（b）とスレッド内カード（c）の両方から参加できるため、遷移処理を共通のヘルパー関数（`frontend/src/lib/room-invite.ts` の `joinInvitedRoom`。30分TTLの `ROOM_INVITE_TTL_MS` / `isInviteExpired` も同居）にまとめる。手順は既存の `handleJoinRoom`（[page.tsx:262-267](frontend/src/app/page.tsx#L262-L267)）に揃えたうえで、**古いルームセッションの削除を1手加える**。

```
sessionStorage.removeItem('ito_room_session');   // 追加
sessionStorage.setItem('ito_player_name', user.username);
router.push(`/ito/room/${roomCode}`);
```

`ito_room_session` を消す理由: 直前に別のルームに居た場合、この値が残っているとルームページの再接続分岐（[page.tsx:98-100](frontend/src/app/ito/room/[roomCode]/page.tsx#L98-L100)）に紛れ込む。現状は `savedSession.roomCode === routeRoomCode` の比較で弾かれるものの、招待経由でルームを渡り歩く導線ができる以上、**明示的に捨ててから遷移する**のが安全。

### (c) `/messages` スレッド内カード

[messages/page.tsx:447-492](frontend/src/app/messages/page.tsx#L447-L492) のメッセージ描画に分岐を追加し、`type === 'ROOM_INVITE'` のときは吹き出しの代わりに招待カードを出す。

- カードの内容: 🎮 アイコン＋「ゲームルームへの招待」＋ルームコード（等幅・トラッキング広め）＋`参加` ボタン
- **自分が送った招待も同じカードで描く**。ただし自分は既にその部屋に居るので `参加` は出さず、`招待を送信しました` とだけ表示する
- 30分経過した招待は「期限切れ」表示にし、`参加` を無効化する（セクション3）
- 連投グルーピング（`startsGroup`）とタイムスタンプの扱いは通常メッセージと同じにする

### 型定義

[presence.tsx](frontend/src/lib/presence.tsx#L18-L24) の `DirectMessage` に追加する。バックエンドの Prisma モデルと対応させる。

```ts
export interface DirectMessage {
  // ...既存
  type: 'TEXT' | 'ROOM_INVITE';
  /** ROOM_INVITE のときのみ入る */
  roomCode?: string | null;
}
```

---

## 5. リアルタイム反映のまとめ

status: 実装済み（新しい配線は無し）

新しい配線は無い。既存の `/presence` 経路（[dm-requirements.md](docs/dm-requirements.md) セクション4）に完全に乗る。

| 出来事 | 経路 | 影響を受ける画面 |
|---|---|---|
| ホストが招待を送る | `POST /api/messages/invite` → `PresenceService.emitToUser` × 2 | — |
| 受信者に届く | `dm:received` | トースト（b） / `/messages` を開いていればスレッドに追記 / 未読バッジ +1 |
| 送信者の別タブ | `dm:received` | `/messages` のスレッドに追記（自分側のカード） |
| 受信者が `/messages` で読む | 既存の `POST /api/messages/read` | 未読バッジが消える |

---

## 6. スコープ外・今後

status: 未着手

- **フレンド以外への招待**: 送らない。DM がフレンド限定である以上、招待も同じ制約に従う
- **招待の承認/拒否フロー**: 持たない（セクション0）。`参加` を押さなければ何も起きない
- **招待の取り消し**: 実装しない。招待はコードの通知でしかなく、取り消してもコードを知られた事実は消せないため意味がない
- **ルーム作成時の自動一斉送信**: 採らない（セクション0）
- **Game/tournament notifications in chat**: Advanced chat features の別項目。本書では扱わない
- **Typing indicators**: 同上。既読カーソルは実装済みだが UI が無い（[dm-requirements.md](docs/dm-requirements.md) セクション6）

### subject 対応表の更新

本書の実装完了時に [dm-requirements.md](docs/dm-requirements.md) セクション6の Advanced chat features 対応表を更新する。

| 要求機能 | 本書実装後 |
|---|---|
| Ability to block users from messaging you | ✅ 実装済み |
| Invite users to play games directly from chat | ✅ **本書で実現** |
| Chat history persistence | ✅ 実装済み |
| Access to user profiles from chat interface | ✅ 本書とは別途実装済み（[dm-requirements.md](docs/dm-requirements.md) セクション5「会話相手のプロフィール」） |
| Game/tournament notifications in chat | ❌ 未着手 |
| Typing indicators and read receipts | ⏳ カーソルは実装済み、UI と typing が未着手 |

---

## 関連ドキュメント

- [dm-requirements.md](docs/dm-requirements.md) — DM の設計。本書はこの上に乗る
- [friend-requirements.md](docs/friend-requirements.md) — フレンド・ブロック・`/presence` の設計
- [reconnect-design.md](docs/reconnect-design.md) — ito の WebSocket 切断・再接続の扱い
- [game-rule.md](docs/game-rule.md) — ito のゲームルール
