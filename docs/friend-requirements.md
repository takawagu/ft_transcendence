# フレンド機能 要件・設計定義

ft_transcendence subject の以下の要件に対応するための定義書。

- **Users モジュール（Major: Standard user management and authentication）**
  > Users can add other users as friends and see their online status.
- **Web モジュール（Major: Allow users to interact with other users）**
  > A friends system (add/remove friends, see friends list).

現状の実装（[schema.prisma](backend/prisma/schema.prisma) / [friends.controller.ts](backend/src/friends/friends.controller.ts) / [page.tsx](frontend/src/app/page.tsx)）:
- `Friendship` / `Block` テーブル、フレンドAPI 10エンドポイント（申請・承認・拒否・削除・ブロック3件・一覧2件・候補検索）は実装済み
- オンライン状態と申請通知を配信する `/presence` WebSocket 名前空間（[presence/](backend/src/presence/)）も実装済み
- ホーム画面のフレンドパネル（一覧 / 申請待ち / ブロック中タブ、フレンド詳細ウィンドウ、追加フォーム）も実装済み
- マイグレーション [20260824050813_add_block](backend/prisma/migrations/20260824050813_add_block/) 適用済み
- **本書に記載した内容はすべて実装・実機検証済み**

本書のスコープ: **フレンド機能 + オンライン状態表示 + ブロック機能**。
ブロックは subject の要件には無いが、拒否後の再申請を止める手段として本書で採用を決定した（セクション3）。
スコープ外（セクション7参照）: DM・プロフィール閲覧。

---

## 1. データモデル

status: 実装済み

`Friendship`（[schema.prisma:39-51](backend/prisma/schema.prisma#L39-L51)）:

| カラム | 意味 |
|---|---|
| `applicantId` | 申請を送った側のユーザーID |
| `approverId` | 申請を受けた側（承認する側）のユーザーID |
| `status` | `PENDING` または `ACCEPTED` |
| `createdAt` | 申請日時 |

- **1つのフレンド関係につき1行**。承認後も `applicantId` / `approverId` はそのまま残り、「どちらから申請したか」の記録として機能する。フレンドかどうかの判定は方向を問わず `OR` で両方を見る（[friends.service.ts:45-51](backend/src/friends/friends.service.ts#L45-L51)）
- `@@unique([applicantId, approverId])` は**方向ありの一意制約**。DB制約だけでは A→B と B→A の2行が同時に存在しうるため、重複はアプリ層の `findFirst` + `OR` 検索で防いでいる（[friends.service.ts:104-113](backend/src/friends/friends.service.ts#L104-L113)）。DB側で完全に防ぐには `LEAST/GREATEST` を使った関数インデックスが必要だが、Prismaで表現できないため**アプリ層でのガードを正とする**

### 決定: `status` は `PENDING` / `ACCEPTED` の2値とする

- スキーマコメントには `REJECTED` が書かれている（[schema.prisma:43](backend/prisma/schema.prisma#L43)）が、拒否時は行を `delete` するため（[friends.service.ts:195](backend/src/friends/friends.service.ts#L195)）この値は**永久に到達しない**
- **拒否 = 行削除で統一する。** `REJECTED` はスキーマコメントから削除した（実装済み）
- これに伴い、既存行の `status` が `PENDING` でも `ACCEPTED` でもない場合に再申請として行を再利用する分岐は**到達不能なデッドコードなので削除した**（実装済み）

### 決定: ブロックは `Block` テーブルを新設する

`Friendship.status` に `BLOCKED` を足す案は採らない。「誰が誰をブロックしたか」という方向の情報が `applicantId` / `approverId`（＝どちらから申請したか）の意味と衝突し、さらに「フレンドではないが片方がブロックしている」状態を `Friendship` の行で表すことになって意味が破綻するため。独立したテーブルとする。

```prisma
model Block {
  id        Int      @id @default(autoincrement())
  blockerId Int
  blockedId Int
  createdAt DateTime @default(now())

  blocker   User     @relation("Blocker", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked   User     @relation("Blocked", fields: [blockedId], references: [id], onDelete: Cascade)

  @@unique([blockerId, blockedId])
  @@index([blockedId])
}
```

- **方向あり。** A→B のブロックと B→A のブロックは別の行。`Friendship` と違いここは意図的に片方向で、`@@unique` も方向ありのままでよい
- `@@index([blockedId])` は「自分がブロックされているか」を引く検索（申請時に毎回走る）のために必要
- `User` 側に `blocksMade Block[] @relation("Blocker")` と `blocksReceived Block[] @relation("Blocked")` を追加する
- マイグレーション [20260824050813_add_block](backend/prisma/migrations/20260824050813_add_block/) を追加・適用済み
- ブロック数の上限も 1000 件とする（理由はセクション3のフレンド上限と同じ）

---

## 2. API 仕様

status: 実装済み（10エンドポイント）

全エンドポイントが `AuthGuard`（[auth.guard.ts](backend/src/auth/auth.guard.ts)）必須。`Authorization: Bearer <JWT>` を要求し、`req.user.id` を「自分」として扱う。ベースパスは `/api/friends`（グローバルプレフィックス `api` は [main.ts:8](backend/src/main.ts#L8)）。

| エンドポイント | 状態 |
|---|---|
| `GET /api/friends` | 実装済み（`email` を除外済み） |
| `GET /api/friends/requests` | 実装済み（`email` を除外済み） |
| `POST /api/friends/request` | 実装済み（email検索廃止・ブロック判定・上限を反映済み） |
| `POST /api/friends/accept` | 実装済み（双方の上限判定を反映済み） |
| `POST /api/friends/reject` | 実装済み（変更なし） |
| `POST /api/friends/remove` | 実装済み（変更なし） |
| `GET /api/friends/blocks` | 実装済み（新規） |
| `GET /api/friends/search` | 実装済み（新規、部分一致の候補検索） |
| `POST /api/friends/block` | 実装済み（新規） |
| `POST /api/friends/unblock` | 実装済み（新規） |

### `GET /api/friends`

フレンド一覧を返す。

- レスポンス: `{ id, username, bio, profileImage }` の配列
- `status: 'ACCEPTED'` の関係だけを対象とし、自分ではない側のユーザーを返す
- **実装済み**: `email` を select から外した。UIで使っておらず、フレンド全員のメールアドレスを配ることになるため。`GET /api/friends/requests` も同じ `USER_SELECT` を共有している（[friends.service.ts:23-28](backend/src/friends/friends.service.ts#L23-L28)）
- ページングは導入しない。代わりにフレンド数を1000件で上限管理する（セクション3）

### `GET /api/friends/requests`

保留中の申請を送受信の両方向で返す。

```ts
{
  incoming: { id: number; user: User }[],  // 自分が承認する側
  outgoing: { id: number; user: User }[]   // 自分が申請した側
}
```

`id` は **`Friendship.id`**（ユーザーIDではない）。承認・拒否APIにはこの値を渡す。

### `POST /api/friends/request`

フレンド申請を送る。

- リクエスト: `{ query: string }` — 相手の **username の完全一致**（email 検索は廃止、セクション3）
- レスポンス: `{ success: true }`
- エラー:

| 条件 | ステータス | メッセージ | 備考 |
|---|---|---|---|
| `query` が空 | 400 | `Username is required` | メッセージから "or email" を削除 |
| 該当ユーザーなし | 404 | `User not found` | |
| **相手が自分をブロックしている** | **404** | **`User not found`** | **追加。ブロックの存在を隠すため「存在しない」と同じ応答にする** |
| 自分自身を指定 | 400 | `You cannot add yourself as a friend` | |
| **自分が相手をブロックしている** | **400** | **`ブロック中のユーザーです。解除してください`** | **追加** |
| すでにフレンド | 400 | `Already friends` | |
| すでに申請中（向き問わず） | 400 | `Friend request is already pending` | |
| **フレンド数が上限（1000件）** | **400** | — | **追加、セクション3** |
| **送信中の申請が上限（100件）** | **400** | — | **追加、セクション3** |

**「相手が自分をブロックしている」の404は、「すでにフレンド」「すでに申請中」より先に評価する。** ブロック時に既存の関係と申請を削除する仕様（セクション3）が守られていれば両者が同時に成立することは無いはずだが、判定を先に置いておけばその不変条件に依存せずにブロックを隠せる。順序の入れ替えだけでコストは無いので先に置く。

### `POST /api/friends/accept`

- リクエスト: `{ friendshipId: number }`
- **自分が `approverId` である `PENDING` 行のみ**承認できる。そうでなければ 400 `Friend request not found or not for you`
- 成功時は `status` を `ACCEPTED` に更新
- **追加**: 承認時に**承認者と申請者の双方**のフレンド数（1000件）を検証する。申請時のチェックだけでは、申請を溜めてから一斉に承認されると上限を超えられるため（セクション3）

### `POST /api/friends/reject`

- リクエスト: `{ friendshipId: number }`
- 該当行を**削除**する
- **受信申請の「拒否」と、送信申請の「キャンセル」を1つのエンドポイントで兼ねる。** `approverId` / `applicantId` のどちらかが自分であれば許可する（[friends.service.ts:188-191](backend/src/friends/friends.service.ts#L188-L191)）
- **決定: この兼用を仕様として追認する。** エンドポイントを `cancel` に分割はしない。フロント側はUI上「拒否」「キャンセル」と出し分けているため利用者に混乱はなく、実処理（行削除）が完全に同一であるため

### `POST /api/friends/remove`

- リクエスト: `{ friendId: number }` — **`Friendship.id` ではなく相手の userId** を渡す点が accept/reject と非対称。呼び出し側の実装ミスを招きやすいため本書に明記する
- `ACCEPTED` の関係を向き問わず検索して削除。無ければ 400 `Friendship not found`

### `GET /api/friends/blocks`（新規）

自分がブロックしているユーザーの一覧を返す。

- レスポンス: `{ id, username, profileImage }` の配列（`bio` / `email` は不要なので返さない）
- 自分が**ブロックされている**相手は当然返さない（本人に知らせないため）

### `POST /api/friends/block`（新規）

- リクエスト: `{ userId: number }` — **相手の userId**（`remove` に合わせる）
- 処理は**トランザクションで**次の3つを行う:
  1. その相手との `Friendship` 行を向き・`status` 問わず全削除
  2. `Block` 行を作成
  3. presence 上でオンライン状態を相互に見せないようにする（セクション4）
- 冪等にする。既にブロック済みなら何もせず `{ success: true }`（`@@unique` 違反の 500 を避ける）
- エラー: 自分自身を指定 → 400 / 該当ユーザーなし → 404 / ブロック数が上限（1000件） → 400

### `POST /api/friends/unblock`（新規）

- リクエスト: `{ userId: number }`
- `Block` 行を削除するだけ。**削除されたフレンド関係は復活しない**（セクション3）
- ブロックしていない相手を指定した場合も `{ success: true }`（冪等）

### service層への切り出し（実装済み）

`FriendsController` は service 層を持たず `PrismaService` を直接叩いていたが、[friends.service.ts](backend/src/friends/friends.service.ts) を新設して Prisma アクセスとビジネスロジックをすべて移した。コントローラは10エンドポイントの受け口だけになっている。上限値（`FRIEND_LIMIT` / `PENDING_LIMIT` / `BLOCK_LIMIT`）もこのファイル冒頭の定数に集約した。

---

## 3. ユーザー検索と申請フロー

status: 実装済み

### 決定: 申請時の解決は username の完全一致のみ

- `POST /api/friends/request` の `query` は **username の完全一致**でのみ解決する
- **email での検索は廃止する。** 以前は `OR: [{ username: query }, { email: query }]` で両方を見ていたが、`username` 単独の `findUnique` に変更した（実装済み、[friends.service.ts:80-82](backend/src/friends/friends.service.ts#L80-L82)）
- 相手の username を知っている前提の設計とする。フレンド追加を username で行うのは一般的な UX であり、email 検索の廃止による損失は小さいと判断した

理由は次項のユーザー列挙対策を兼ねる。

### 決定（変更）: 部分一致の候補検索を追加する

**当初は「部分一致のユーザー検索APIは作らない」と決定していたが、これを撤回した。** フレンド追加フォームで入力中に候補を出す UX を優先する。

撤回にあたって影響を再評価した結果、**当初の懸念のうち本質的な部分は既に別の手段で解消済み**だった。

- 守りたかったのは主に **email の列挙**であり、それは前項の「username 限定検索」で解消している。**検索対象は username のみ**なので、部分一致を許しても email は一切漏れない
- username の列挙が容易になるのは事実だが、本書は前項で既に「username はユーザー同士が教え合う前提の公開識別子なので（存在有無が分かることを）許容する」と決めている。**その決定と矛盾しない**

そのうえで、総当たりを助けすぎないよう次の制約を課す。

| 制約 | 値 | 理由 |
|---|---|---|
| 最小文字数 | **2文字** | 1文字だと総当たりの起点になりやすい。`SearchUsersDto` の `@MinLength(2)` で強制 |
| 返却件数 | **3件** | 一覧的に舐められないよう少数に絞る（`SEARCH_LIMIT`） |
| 認証 | 必須 | 他のフレンドAPIと同じく `AuthGuard` |

### `GET /api/friends/search?q=`（新規）

- クエリ: `q` — username の**部分一致**（大文字小文字は区別しない、`mode: 'insensitive'`）
- レスポンス: `{ id, username, bio, profileImage, relation }` の配列（最大3件、username 昇順）
- `relation` は自分から見た関係: `'friend'` / `'pending'` / `'none'`
- **ブロック関係にある相手は向きを問わず結果に含めない。** 相手が自分をブロックしている場合も、自分が相手をブロックしている場合も除外する
- **既にフレンド・申請中の相手は除外せず `relation` を付けて返す。** 除外すると「名前を入力したのに何も出ない」状態になり、利用者が理由を判断できないため。UI 側でボタンを出さずラベル（「フレンド済み」「申請中」）を表示する

### 決定: ユーザー列挙は email 検索の廃止で緩和する

存在しないユーザーには 404 `User not found`、存在すれば別のレスポンスを返すため、現状は**任意のメールアドレスが登録済みかどうかを判定できてしまう**。email はユーザーが選んで公開するものではないため、username より秘匿性が高い。

- **決定: 前項のとおり email 検索を廃止する。** これで「メールアドレスの登録有無」は本エンドポイントからは判定できなくなる
- username の存在有無は引き続き 404 で判別できるが、username はユーザー同士が教え合う前提の公開識別子なので許容する

**残る課題（本書のスコープ外）**: `GET /api/auth/check-username` / `check-email`（[auth.controller.ts:24-34](backend/src/auth/auth.controller.ts#L24-L34)）は**認証不要**で同じ情報をより直接的に返しており、そちらを塞がない限り email の列挙自体は防げない。ただしこれは登録時のリアルタイム重複チェック UX のために意図的に公開しているもので（[login-requirements.md](docs/login-requirements.md) セクション3）、廃止すると登録体験が落ちる。**フレンド機能側の判断としては email 検索を廃止するに留め、`check-email` の扱いは認証まわりの課題として [login-requirements.md](docs/login-requirements.md) 側に委ねる。**

### 決定: 拒否後の再申請はブロック機能で止める

拒否は行削除なので、拒否された側は**即座に何度でも再申請できる**。この穴を塞ぐため、**ブロック機能を本書のスコープに入れる**（セクション1のデータモデル、セクション2のAPI、セクション6のUIを参照）。

採らなかった案:
- **許容する**: 実装コスト0だが、嫌がらせの余地が残ったままになる
- **クールダウン**: 拒否から一定時間だけ再申請を禁じる案。`Friendship` の行を残して `REJECTED` + `createdAt` で判定する必要があり、**セクション1の「`status` は2値」決定を巻き戻すことになる**。また「何分待てば送れるか」という運用上の恣意的なパラメータが増える

ブロックなら「拒否 = 1回断る」「ブロック = 今後一切受け取らない」と意図が分離でき、`Friendship` のモデルにも手を入れずに済む。

#### ブロックの振る舞い

- **ブロック実行時、その相手との既存のフレンド関係と保留中の申請（向き問わず）をすべて削除する。** `Block` 行の作成と併せてトランザクションで行う
- **ブロックされている側からの申請は 404 `User not found` を返す。** 「ブロックされています」とは伝えず、**ブロックの存在自体を隠す**。前項で email 検索を廃止したことで、404 に寄せても情報が漏れない形になっている
- **ブロックしている側からの申請は 400** で「ブロック中のユーザーです。解除してください」を返す。自分のブロックは自分に見えているので明示してよい
- ブロックは**片方向**。A が B をブロックしても B は A をブロックしていない。ただし申請の遮断は結果的に双方向に効く（どちらから送っても上記のいずれかで弾かれる）
- **解除しても、削除されたフレンド関係は復活しない。** 改めて申請し直す必要がある
- 相手への通知は行わない（`reject` / `remove` を通知しないのと同じ方針、セクション5）

#### 隠しきれない点（既知の制約）

ブロックすると相手のフレンド一覧から自分が消えるため、**元々フレンドだった相手にはブロックされたことが推測できる**。これは「フレンド解除」と区別がつかない状態なので、ブロック特有の情報が漏れるわけではない。仕様として許容する。

### 決定: フレンド数の上限は 1000 件

現状は無制限。**バグ・リソース枯渇を防ぐガードレール**として上限を設ける。パフォーマンス目標ではなく、実運用でこの値に到達することは想定していない。

- **フレンド数（`ACCEPTED`）の上限: 1000 件**
- **送信中の申請（自分が `applicantId` の `PENDING`）の上限: 100 件**
- 超過時は 400 を返す

#### なぜ 1000 なら安全か

行数そのものは問題にならない。Prisma の `findMany` で 1000 行 + 2 つの `include` は Postgres にとって誤差の範囲。効いてくるのは**レスポンスサイズ**と**フロントの描画**の2点で、下記の前提条件を満たせばどちらも 1000 で破綻しない。

| bio の上限 | 1件あたり | 1000件のJSON |
|---|---|---|
| 200文字（日本語 = 約600B） | 約 700B | **約 700KB** |
| 500文字 | 約 1.6KB | 約 1.6MB |

#### 前提条件（上限を入れるだけでは安全にならない）

1. **`bio` / `profileImage` に長さ上限を追加する。** 現状どこにも制限が無い:
   - `bio String?`（[schema.prisma:21](backend/prisma/schema.prisma#L21)）は Postgres の `text` に落ちるため事実上無制限
   - `RegisterDto` の `bio` に `@MaxLength` が無い（[register.dto.ts:17](backend/src/auth/dto/register.dto.ts#L17)）
   - **`PUT /api/users/me` は `@Body() body: any` で DTO を通していないため、グローバル `ValidationPipe`（[main.ts:9](backend/src/main.ts#L9)）が一切効いていない**（[users.controller.ts:31](backend/src/users/users.controller.ts#L31)）
   - `profileImage` は `<img src>` にそのまま渡される（[page.tsx:405-414](frontend/src/app/page.tsx#L405-L414)）ため data: URI を入れられる

   → **`username` 30文字 / `bio` 500文字 / `profileImage` 512文字**を上限とし、`UpdateMeDto` を新設して `PUT /api/users/me` に適用する。これが無いと「1000件 × 無制限」でレスポンスサイズが青天井になる（実装済み: [update-me.dto.ts](backend/src/users/dto/update-me.dto.ts)）

   **上限値を 200 ではなく 500 にした理由**: 上限導入前に登録されたアカウントに長い `bio` / `username` が既に入っている可能性がある。プロフィール更新は編集していない項目も含めて全フィールドを送る実装（[page.tsx:373-378](frontend/src/app/page.tsx#L373-L378)）なので、上限を厳しくしすぎると**該当ユーザーがプロフィールを一切保存できなくなる**。500文字なら1000件で約1.6MBに収まり、無制限とは桁が違うのでガードレールとしては十分機能する。

   同じ理由で、`POST /api/friends/request` の `query` には `@MaxLength` を付けない。付けると上限導入前の長い username のユーザーが検索できなくなるため（[friends.dto.ts](backend/src/friends/dto/friends.dto.ts)）。`username` は `@unique` インデックス付きの完全一致検索なので、長さ制限が無くても危険はない。

2. **`GET /api/friends` の select から `email` を外す。** フレンド一覧に相手のメールアドレスを載せる必要が無く（UIでも使っていない）、サイズも約30KB/1000件減る。`GET /api/friends/requests` も同様

3. **`PENDING` にも上限をかける。** `ACCEPTED` だけを数えると、申請中の行が上限チェックの対象外になり **5000件申請を送っておいて後から承認させる**という迂回ができる。受信側は「同一相手からは1件まで」が既に効いている（[friends.service.ts:104-120](backend/src/friends/friends.service.ts#L104-L120)）ためアカウント数以上には増えず、送信側だけを 100 件で抑えれば足りる

4. **チェック箇所は2つ。** `POST /api/friends/request` で申請者の `ACCEPTED` 数と `PENDING` 数を、`POST /api/friends/accept` で**承認者と申請者の双方**の `ACCEPTED` 数を検証する。承認時に見落とすと上限を超えられる

#### フロント側の劣化点

一覧は仮想化していないため、1000 行 = 約 1000 個の div + SVG を描画することになる。加えて `presence:changed` のたびに `friends.map` 全体が再描画される（セクション4）。**体感の劣化は数百件から始まる**が、上限1000はあくまでガードレールであり実際に到達しない想定なので、対策は行を独立コンポーネントに切り出して `React.memo` で包む程度に留める。ページング・仮想化は導入しない。

---

## 4. オンライン状態（presence）

status: 実装済み（サーバー: [presence/](backend/src/presence/) ／ フロント: [presence.tsx](frontend/src/lib/presence.tsx)）

subject の「see their online status」を満たすための設計。着手前は [page.tsx](frontend/src/app/page.tsx) の緑ドットが**全フレンドに対して常時点灯**しており、要件を満たしていないのに満たしているように見える状態だった。

### 方式: 専用 WebSocket 名前空間 `/presence` を新設する

比較した代替案:
- **既存 `/ito` 名前空間の接続状況を流用**: 新設不要だがゲーム画面にいる間しかオンライン判定できず、ホーム画面にいるフレンドがオフライン表示になる → 却下
- **`User.lastSeenAt` + RESTポーリング**: 実装は単純だがリアルタイム性が落ち、DBへの書き込みが定期的に発生する → 却下

### サーバー側

`backend/src/presence/` に以下を新設する。

- **`PresenceGateway`**: `@WebSocketGateway({ namespace: '/presence', cors: { origin: '*' } })`。[ito.gateway.ts:29](backend/src/ito/ito.gateway.ts#L29) と同じ形
  - 接続時に `client.handshake.auth.token` の JWT を `AuthService.verifyToken`（[auth.service.ts:98](backend/src/auth/auth.service.ts#L98)）で検証して `userId` を解決する。失敗したら `client.disconnect()`
  - `AuthModule` / `PrismaModule` はどちらも `@Global`（[auth.module.ts](backend/src/auth/auth.module.ts) / [prisma.module.ts](backend/src/prisma/prisma.module.ts)）なので、`PresenceModule` 側で import せずに注入できる
- **`PresenceService`**: インメモリの `Map<userId, Set<socketId>>` で在席を管理する
  - 同一ユーザーの複数タブに対応するため値は `Set`。DBは使わない。ito の [room.store.ts](backend/src/ito/service/room.store.ts) と同じくプロセス内メモリ方式で統一する
  - **状態遷移した時だけ**（Setが 空→1 でオンライン、1→空 でオフライン）ブロードキャストする。タブの開閉ごとに通知が飛ばないようにする
  - 通知先は「その `userId` の `ACCEPTED` フレンドのうち、現在接続しているソケット」に限定する
- **`presence.events.ts`**: イベント名とペイロード型を集約する（[ito.events.ts](backend/src/ito/ito.events.ts) と同じ形式）

### イベント定義

| 方向 | イベント | ペイロード | タイミング |
|---|---|---|---|
| S→C | `presence:snapshot` | `{ onlineFriendIds: number[] }` | 接続認証の直後に1回 |
| S→C | `presence:changed` | `{ userId: number, online: boolean }` | フレンドの在席が変化した時 |
| S→C | `friend:requestReceived` | `{ friendshipId: number, user: User }` | セクション5 |
| S→C | `friend:accepted` | `{ user: User }` | セクション5 |

C→S のイベントは無い。クライアントは接続を維持するだけでよい。

#### 実装時に判明: 承認直後にも `presence:changed` が要る

`presence:snapshot` は接続時点のフレンドしか含まない。申請が承認されて**新たにフレンドになった相手**は、双方のスナップショットのどちらにも入っていないため、何もしないと**リロードするまで新しいフレンドが常にオフライン表示**になる。

`POST /api/friends/accept` の成功時に、`friend:accepted` とは別に**双方へ相手の現在の在席を `presence:changed` で送る**（`PresenceService.notifyNewFriendship`）。ブロック時の即時オフライン化（`notifyBlocked`）と対になる処理。

### ブロックとの関係

ブロックすると `Friendship` 行が削除される（セクション3）ため、**presence 側では特別な処理をしなくても自動的に相手が通知対象から外れる**。「`ACCEPTED` フレンドにのみ配信する」というルールがそのままブロックの遮断として働く。

ただし1点だけ明示的な対応が要る。**ブロック実行の瞬間に、双方の接続中クライアントへ相手を即座にオフライン化させる**必要がある。何もしないと、`onlineFriendIds` に残ったまま画面をリロードするまで相手がオンライン表示され続ける。`POST /api/friends/block` の中で双方へ `presence:changed { userId, online: false }` を送る。

### フロント側

接続は [presence.tsx](frontend/src/lib/presence.tsx) の `PresenceProvider` が持ち、[layout.tsx](frontend/src/app/layout.tsx) に配置している（後述）。

- ログイン済み（`token` あり）の間、`io(`${WS_URL}/presence`, { auth: { token } })` で接続する。`WS_URL` は ito ルームと同じ `NEXT_PUBLIC_WS_URL`（[page.tsx:18](frontend/src/app/ito/room/[roomCode]/page.tsx#L18)）を使う
- `onlineFriendIds: Set<number>` を Provider の state に持ち、`presence:snapshot` で初期化、`presence:changed` で差分更新する。各ページは `usePresence()` で読むだけ
- サーバーイベントは Provider が `subscribe(event, handler)` で中継する。何に反応するかはページ側が決める（ホーム画面はフレンド通知を受けて `fetchFriendsData()` を呼ぶ）
- 緑ドット（[page.tsx](frontend/src/app/page.tsx)）を**オンライン時のみ緑・オフライン時はグレー**に切り替える。ダミーの常時 `animate-pulse` は廃止した
- ログアウト時（`token` が null になった時）に `socket.disconnect()`

### 解消済みの制約: ゲーム中もオンライン表示になる

当初は presence 接続をホーム画面コンポーネントで張っていたため、ito ルームへ遷移するとホーム画面がアンマウントされて切断され、**ゲームをプレイ中のフレンドがオフラインと表示されていた。**

DM 実装（[dm-requirements.md](docs/dm-requirements.md) セクション4）で `/messages` を新設するにあたり、同じ接続コードを複数ページに書くことになるため、**接続を layout の Provider へ持ち上げて解消した**。ログイン中は全ページで接続を1本だけ維持する。ito ルームの `/ito` と presence の2本のソケットが並存するが、名前空間が違うので競合しない。

あわせて、ログイン状態（`token` / `user`）と `apiCall` も [session.tsx](frontend/src/lib/session.tsx) の `SessionProvider` へ移した。presence の接続条件が `token` であり、ページ単位で持っていると遷移のたびに認証状態が作り直されるため。

### インフラ

- **nginx の設定変更は不要。** [nginx.conf:26](nginx/nginx.conf#L26) の `location /socket.io/` が socket.io を一括でプロキシしており、socket.io の名前空間は同一の `/socket.io/` パス上を通るため、`/presence` も既存設定でそのまま通る
- DBカラム（`lastSeenAt` 等）は追加しない。**バックエンドプロセスの再起動で全員がオフライン扱いに戻る**が、クライアントが socket.io の自動再接続で復帰するため実害は小さいものとして許容する

---

## 5. リアルタイム反映と通知

status: 実装済み（サーバー: [friends.service.ts](backend/src/friends/friends.service.ts) ／ フロント: [page.tsx](frontend/src/app/page.tsx)）

### 現状の問題

`fetchFriendsData()` は `token` の変化時にしか実行されない（[page.tsx:147-151](frontend/src/app/page.tsx#L147-L151)）。そのため:
- フレンド申請が届いても「申請待ち」バッジが増えない
- 自分の申請が承認されてもフレンド一覧に現れない
- 画面をリロードするか再ログインするまで気づけない

### 決定: `/presence` 接続を通知経路として共用する

presence 用に張ったソケットをそのまま通知チャネルに使う。専用の通知基盤やポーリングは導入しない。

- `POST /api/friends/request` 成功時、サーバーが**相手**の presence ソケットへ `friend:requestReceived` を emit
- `POST /api/friends/accept` 成功時、サーバーが**申請者**の presence ソケットへ `friend:accepted` を emit
- 相手が未接続なら emit は単に何も起きない（次回接続時に `GET /api/friends/requests` で拾われる）
- フロントはこれらを受信したら **`fetchFriendsData()` を呼び直すだけ**にする。ペイロードから差分適用はしない（状態の二重管理を避けるため）

### 実装上の依存

`FriendsController` → `PresenceService` の参照が必要になるため、セクション2の「`FriendsService` への切り出し」とセットで実施する。`PresenceModule` から `PresenceService` を `exports` し、`FriendsModule` で import する。

`reject` / `remove` については通知しない（相手に「拒否された」「削除された」と即座に知らせる必要がなく、むしろ知らせない方がよい）。

---

## 6. 画面仕様

status: 実装済み

ホーム画面のフレンドパネル（[page.tsx:772-960](frontend/src/app/page.tsx#L772-L960)）。ログイン済みの時のみ表示される。

### タブ

- **「フレンド (n)」**: n は現在のフレンド数
- **「申請待ち」**: 受信申請がある時のみ件数バッジを表示
- **「ブロック中」（新規）**: ブロック中のユーザーが1件以上ある時のみタブを表示する。常設すると普段使わないタブが場所を取るため

### フレンド一覧タブ

- 1件ごとに アバター・username・bio（1行省略）・オンラインインジケータ・**info ボタン**
- 0件のときは「フレンドはいません」の空状態を表示

#### 決定: 削除ボタンを info ボタンに置き換える

現状は行に削除ボタン（ゴミ箱アイコン）が直接置かれている（[page.tsx](frontend/src/app/page.tsx)）。ここにブロックボタンを足すと行が窮屈になり、かつ**破壊的な操作が2つ、1クリックで届く場所に並ぶ**ことになる。

代わりに **info ボタン（ⓘ）1つに集約し、押すとフレンド詳細ウィンドウを開く**。削除もブロックもその中から行う。

```
┌──────────────────────┐
│   🦊  kawaguchi      │
│   ● オンライン        │
│                      │
│ itoやってます。よろしく  │
│ お願いします。         │
│                      │
│ [フレンド削除] [ブロック]│
│            [閉じる]  │
└──────────────────────┘
```

#### フレンド詳細ウィンドウの内容

**表示する情報は `GET /api/friends` が既に返しているものだけに限定する。新規APIは作らない。**

- アバター（大きめ）・username
- オンライン状態（`onlineFriendIds` から判定、セクション4）
- **bio の全文**。一覧では `truncate` で1行に省略されているため、ここで全文が読めること自体がこのウィンドウの情報価値になる
- **戦績（`ItoGameRecord`）は表示しない。** 表示するには `GET /api/users/:id` の新設が必要で、セクション7の「プロフィール閲覧」がスコープに入ってしまう。そちらを実装する時に、このウィンドウを拡張する形で対応する

#### ウィンドウ内の操作

- **「フレンド削除」** → `POST /api/friends/remove`。ウィンドウ自体が確認の役割を果たすので、`confirm()` の二重確認はしない
- **「ブロック」** → **ウィンドウ内で確認ステップを1つ挟む**。「ブロックするとフレンド関係が解除され、相手からの申請も届かなくなります。解除してもフレンド関係は元に戻りません。」を表示してから `POST /api/friends/block`
  - 削除より影響が大きく（関係の削除 + 今後の遮断）、かつ解除しても元に戻らないため、削除と同じ1クリックにはしない
- どちらも成功したらウィンドウを閉じて `fetchFriendsData()` で再取得する
- 既存の `confirm()`（[page.tsx](frontend/src/app/page.tsx)）は廃止する

### 申請待ちタブ

- **受信した申請**: アバター・username と「承認」「拒否」ボタン
- **送信した申請**: アバター・username（薄く表示）と「キャンセル」ボタン
- どちらも0件のときは「〜はありません」を表示

#### 決定: ブロックは拒否後の2段階で出す

受信申請の行に「承認」「拒否」「ブロック」の3ボタンを並べるとパネル幅（`max-h-[300px]` のサイドパネル）に対して窮屈で、**大半のケースで使わないブロックが、承認・拒否と同じ重みで常に見えてしまう**。

**「拒否」を押した時点で拒否は実行し、その直後にブロックの選択肢を提示する**方式にする。

```
【受信した申請】
┌─────────────────────────┐
│ ✓ spam_user の申請を拒否し│
│   ました                 │
│   今後この人からの申請を  │
│   受け取らないようにでき  │
│   ます。                 │
│        [ブロック] [閉じる]│
└─────────────────────────┘
┌─────────────────────────┐
│ 🐱 other_user  [承認][拒否]│
└─────────────────────────┘
```

- **提示は拒否した行があった位置にインラインで残す。** トーストのように数秒で自動的に消すことはしない。見逃すと二度と出せない導線になるため
- 消えるのは「閉じる」を押した時、タブを切り替えた時、ブロックを実行した時の3つ
- **拒否は既に実行済み**。ここで「閉じる」を押しても拒否は取り消されない。文言を過去形（「拒否しました」）にして、この提示が追加の選択肢であって確認ダイアログではないことを明確にする
- **実装上の注意**: 拒否すると `Friendship` 行が消えるので、`POST /api/friends/block` に渡す `userId` はサーバーから取り直せない。**拒否を実行する前に、その行の `user` オブジェクトをフロント側の state に退避しておく**必要がある（`incomingRequests` の要素は `{ id, user }` 形式、[page.tsx:13-16](frontend/src/app/page.tsx#L13-L16)）
- ブロック実行時の確認ステップは不要。**この提示自体が既に2段階目**であり、文言でブロックの効果を説明済みのため

### ブロック中タブ（新規）

- 1件ごとに アバター・username と「解除」ボタン → `POST /api/friends/unblock`
- 解除時は `confirm()` で「解除してもフレンド関係は元に戻りません」と明示する（セクション3の仕様）
- オンラインインジケータは**表示しない**（ブロック相手の在席は配信されないため）

### 追加フォーム（フッター固定）

- **username を**入力して送信 → `POST /api/friends/request`
- **2文字以上入力すると候補が最大3件表示される**（400msデバウンス、`GET /api/friends/search`）。候補の「申請」ボタンから直接申請でき、既にフレンド・申請中の相手はボタンの代わりにラベルを出す
- 成功時「フレンド申請を送信しました！」、失敗時はサーバーのエラーメッセージを表示
- **変更**: プレースホルダと説明文から「メールアドレス」の記述を削除する（セクション3で email 検索を廃止したため）

### 変更予定

1. オンラインインジケータをダミーから実データに切り替える（セクション4）
2. `friend:requestReceived` / `friend:accepted` 受信時に自動リフレッシュする（セクション5）
3. **削除ボタンを info ボタンに置き換え、フレンド詳細ウィンドウを新設する**（削除・ブロックはその中へ移動）
4. **受信申請の拒否後に、インラインでブロックの提示を出す**
5. 「ブロック中」タブと解除の導線を追加する
6. 追加フォームの文言から email を外す（セクション3）
5. 一覧の行を独立コンポーネントに切り出して `React.memo` で包む（セクション3、`presence:changed` ごとの全行再描画を避けるため）

---

## 7. スコープ外

status: 未着手

### DM（ダイレクトメッセージ）

`DirectMessage` モデル（[schema.prisma:70-79](backend/prisma/schema.prisma#L70-L79)）は定義だけあり、API・UIともに未実装。subject の Web モジュール Major「A basic chat system (send/receive messages between users)」に対応するため、**[dm-requirements.md](docs/dm-requirements.md) に切り出して定義済み**。

本書で決めた次の仕様が、DM 側の設計の前提になっている。
- **ブロック時に `Friendship` を全削除する**（セクション3）ため、DM 側はブロック判定を持たずに「フレンド限定」だけで遮断が成立する
- **`/presence` 名前空間**（セクション4）に `dm:received` を相乗りさせる

### プロフィール閲覧

フレンドをクリックして相手のプロフィールや戦績（`ItoGameRecord`）を見る導線が無い。現状 `GET /api/users/me`（[users.controller.ts:11](backend/src/users/users.controller.ts#L11)）は自分の情報しか返さない。subject の「A profile system (view user information)」対応として別途検討する。実装時は**ブロック関係にある相手のプロフィールを見せない**判定が必要になる。

### `check-email` の認証要否

`GET /api/auth/check-email` が認証不要でメールアドレスの登録有無を返す件（セクション3）。フレンド機能側は email 検索の廃止で対応済みで、これ以上は認証まわりの判断になるため [login-requirements.md](docs/login-requirements.md) に委ねる。

---

> **注**: ブロック機能は当初スコープ外としていたが、セクション3の「拒否後の再申請」への対応として**スコープ内に変更した**。

---

## 関連ドキュメント

- [login-requirements.md](docs/login-requirements.md) — 認証・ユーザー管理全般
- [dm-requirements.md](docs/dm-requirements.md) — DM。本書のブロック仕様と `/presence` の上に乗る
- [room-invite-requirements.md](docs/room-invite-requirements.md) — ito ルームへの招待。フレンド限定・ブロック遮断を本書の仕様に依存する
- [reconnect-design.md](docs/reconnect-design.md) — WebSocket 切断・再接続の扱い（presence 実装時の参考）
