# ログイン機能 要件整理

ft_transcendence subject の Users モジュール（標準ユーザー管理・認証）およびログイン関連要件を満たすための整理メモ。

現状の実装（[auth.service.ts](backend/src/auth/auth.service.ts) / [auth.guard.ts](backend/src/auth/auth.guard.ts) / [users.controller.ts](backend/src/users/users.controller.ts)）:
- メールアドレス + パスワードによる登録・ログイン（bcryptハッシュ化）
- ログイン成功時にJWTを発行、`Authorization: Bearer`ヘッダーで以後の認証を行う（`AuthGuard`）
- プロフィール編集（username/bio/profileImage/password）は実装済み
- `.env`に`FORTYTWO_CLIENT_ID`等はあるが、42 OAuth自体のコードはまだ無い

---

## 1. 認証方式のスコープ

status: 決定済み

- メール/パスワード認証のみとする。42 OAuthは対応しない
- `.env`の`FORTYTWO_CLIENT_ID`等は未使用のまま残る（将来対応する場合に備えて削除はしない）

---

## 2. トークンの有効期限・扱い

status: 要検討

- 現状JWTの有効期限は`7d`固定（[auth.service.ts:81](backend/src/auth/auth.service.ts#L81)）。リフレッシュトークンは無し
- 有効期限切れ・改ざん時は`AuthGuard`が401を返すのみ。フロント側の自動ログアウト処理は[page.tsx](frontend/src/app/page.tsx)の`apiCall`内で401検知時に実施済み
- トークン漏洩時の失効手段（ブラックリスト等）は無し。必要か？
- セクション7の多重ログイン禁止は**トークンの失効ではなく接続の有無**で判定している。発行済みトークンは7日間有効なままなので、漏洩対策にはならない点に注意

---

## 3. 登録時のバリデーション

status: 実装済み

- `class-validator` + `RegisterDto`/`LoginDto` + グローバル`ValidationPipe`導入済み（[register.dto.ts](backend/src/auth/dto/register.dto.ts) / [main.ts](backend/src/main.ts)）。email形式・必須項目・パスワード8文字以上をバックエンドで検証
- パスワード強度基準は**8文字以上のみ**（文字種の制約は無し）。フロントでリアルタイム判定 + バックエンドでもチェック（両方実装済み、[page.tsx](frontend/src/app/page.tsx)）
- username/emailの重複チェックは**入力中（リアルタイム）**に実施
  - `GET /api/auth/check-username` / `GET /api/auth/check-email`を新規実装、フロントは400msデバウンスして叩く
  - 使用済みなら「そのユーザー名はすでに使われています」等を即座に表示し、登録ボタンを無効化。未使用なら「使用可能です」を表示
  - 送信時の最終チェック（既存の409 `ConflictException`）も引き続き有効（レース条件対策）
- `schema.prisma`の`username`に`@unique`を追加し、マイグレーション`20260730092155_add_username_unique`で反映済み
- ブラウザ実機で一連の流れ（短いパスワード拒否・重複ユーザー名拒否・正常登録）を確認済み
- **プロフィール更新のバリデーション（対応済み、#63）**: `PUT /api/users/me` は`@Body() body: any`でDTOを通しておらず、metatypeが`Object`になるためグローバル`ValidationPipe`が**スキップされていた**。登録時の`@MinLength(8)`を回避して1文字パスワードに変更できる状態だった
  - [update-me.dto.ts](backend/src/users/dto/update-me.dto.ts)を新設し、`username` 30文字 / `bio` 500文字 / `profileImage` 512文字 / `password` 8文字以上を検証するようにした。[register.dto.ts](backend/src/auth/dto/register.dto.ts)にも同じ`@MaxLength`を追加して登録側と揃えている
  - `if (username && ...)`と`if (username !== undefined)`の条件ズレ（空文字が重複チェックをすり抜けて保存される）も`!== undefined`に統一して修正
  - レース条件で`@unique`に衝突した場合の`P2002`を`ConflictException`（409）に変換。以前は捕捉されず500になっていた
  - 上限値の根拠は[friend-requirements.md](docs/friend-requirements.md)セクション3を参照

---

## 4. 重複・エラーハンドリング

status: 実装済み（簡易）

- email/username重複時は`ConflictException`（409）
- ログイン失敗時は`UnauthorizedException`（401、email/passwordどちらが誤りかは区別しない設計）

---

## 5. 2要素認証（2FA）

status: 未着手

- subjectのMajorモジュール候補。対応するかどうか要検討

---

## 6. セッション/ログイン状態とゲーム機能との連携

status: 決定済み（実装済み）

- 決定: itoの再接続は`playerId`をDBの`userId`に依存させる
- 確認したところ既に実装済み: [page.tsx:53-55](frontend/src/app/ito/room/[roomCode]/page.tsx#L53-L55)で`playerId = String(userObj.id)`となっており、ゲストUUID方式ではなくログインユーザーのDB userIdをそのまま使っている
- ルーム画面自体、未ログイン（`ft_token`/`ft_user`が無い）の場合はトップへリダイレクトされるため、ito機能全体がログイン必須になっている（[page.tsx:48-51](frontend/src/app/ito/room/[roomCode]/page.tsx#L48-L51)）
- 副次効果: `reconnect-design.md`セクション1の「未確定: 別デバイス/別ブラウザからの復帰」も解消される。userIdベースなので同じアカウントでログインすればどの端末からでも復帰可能
- 要更新: `reconnect-design.md`セクション1がまだ「ログイン機能なし・ゲストUUID方式」という古い前提のまま → 本ファイル更新と合わせて修正する

---

## 7. 多重ログインの禁止（先勝ち）

status: 実装済み

### 背景

同一アカウントに、既にログイン中のブラウザとは別のブラウザ／別の機器からログインしようとすると、送信ボタンが「通信中...」のまま戻らない不具合があった。原因は2つ:

1. `login()` に重複ログインのチェックが無く、サーバーが「今このユーザーはログイン中か」を答えられる仕組みがログインフローに繋がっていなかった
2. `apiCall` の `fetch` にタイムアウトが無く、応答も失敗も返らないまま止まると `await apiCall(...)` が永久に返らない（締め切り判定はループ先頭でしか行われないため、60秒の締め切りも効かない）

### 決定

- 多重ログインは**先勝ち**で禁止する。既にログイン中の端末を保護し、2台目のログイン試行は409で拒否する
- 「ログイン中か」の判定は**presenceのWebSocket接続の有無**を実体とする（[presence.service.ts](backend/src/presence/presence.service.ts)の`isOnline`）。Sessionテーブルは作らない
  - 理由: ブラウザを閉じれば接続が切れて自動的に解放されるため、ログアウトし忘れによる恒久ロックアウトが起きない。DBに持たせると明示的なログアウトが無い限り解放されず、後始末の仕組みが別途必要になる
  - `friend-requirements.md`セクション4の「オンライン状態はプロセス内メモリで持つ」という既存方針とも一貫する
- 判定は**パスワード検証の後**に行う。前に置くと、パスワードを知らない第三者に「そのアカウントが今オンラインか」を教えてしまう
- `register()`には入れない。新規アカウントがオンラインであることはあり得ない

### 実装

- [auth.service.ts](backend/src/auth/auth.service.ts)の`login()`で`PresenceService.isOnline(user.id)`を見て、真なら`ConflictException`（409）。`AuthModule`が`PresenceModule`をimportする
  - モジュールの依存は`AuthModule → PresenceModule`の一方向のみ。`PresenceModule`は`imports`が空で、`PresenceGateway`は`@Global`な`AuthModule`から`AuthService`を受け取っているため循環しない
- [presence.gateway.ts](backend/src/presence/presence.gateway.ts)の`pingInterval`/`pingTimeout`を10s/8s（既定は25s/20s）に短縮。ブラウザのクラッシュや回線断でFINが届かない場合の解放待ちを最大約45秒から約18秒に縮めた
  - これ以上短くすると不安定な回線でフレンドのオンライン表示がちらつきやすくなる
  - engine.ioのインスタンスは全ゲートウェイで1つのため、この設定は`/ito`名前空間にも効く。itoの切断検知（＝ゲームの一時停止）も同じだけ速くなる。名前空間ごとには分けられない
- [session.tsx](frontend/src/lib/session.tsx)の`apiCall`に`AbortController`で15秒のリクエストタイムアウトを追加。タイムアウトでの中断はサーバーに届いている可能性があるためリトライせず即エラーにする（`make up`直後の502/503リトライはそのまま残す）
- フロントのエラー表示は変更不要。`handleAuthSubmit`のcatchが`err.message`を`authError`に入れるため、409のメッセージがそのまま画面に出る

### 解放条件

- 該当端末でログアウトする（presenceソケットが即座に切断される）
- タブ／ブラウザを閉じる（正常クローズならTCP FINで即座に検知）
- ブラウザのクラッシュ・回線断の場合は最大約18秒待つ

### 2026-09-04 の改訂: 判定をログインから接続へ移した

既知の制約として挙げていた**「同一アカウントの複数タブは影響を受けない」を解消した**。

ログイン処理だけを見張っても、`localStorage`にトークンが残っている端末は
[session.tsx](frontend/src/lib/session.tsx)がログインAPIを通さずセッションを復元するため素通りする。
トークンは7日有効なので、「前にログインしたことがある別ブラウザ」からいつでも同時接続できていた。
itoの戦績集計（`recordRoundResults`）が同一ユーザー行へ同時に走りうるため、これを塞ぐ。

- 判定を**presenceの接続時**にも置いた。[presence.gateway.ts](backend/src/presence/presence.gateway.ts)の
  `afterInit`でsocket.ioのミドルウェアを張り、`isOnline(userId)`が真なら`DUPLICATE_SESSION`で拒否する
  - `handleConnection`での`disconnect()`ではなく**ミドルウェア**にしたのは、拒否の理由をクライアントへ確実に渡すため。
    emitした直後にcloseすると取りこぼす。ミドルウェアが`Error`を返せば`connect_error`の`message`として届き、
    socket.ioのクライアントはミドルウェア起因のエラーでは自動再接続しないのでリトライで殴り続けることもない
  - 認証（トークン検証）も同じミドルウェアへ移し、接続の可否を1箇所にまとめた
- フロントは[presence.tsx](frontend/src/lib/presence.tsx)で`connect_error`を受け、全画面ブロックを出す。
  Providerは`layout`直下なのでitoルームを含むどの画面にも被さる。「再読み込み」と「ログアウト」を置いている
- itoルーム側の`BroadcastChannel`ガードは**残す**。presenceを拒否されたタブでも`/ito`への接続は別途走るため、
  これが無いとブロック画面を出しながら先のタブの席を奪ってしまう（[reconnect-design.md](reconnect-design.md)参照）
- 解放条件は従来と同じ。リロードやタブを閉じる操作は即座に検知されるので影響せず、
  異常切断（クラッシュ・回線断・スリープ）の後だけ最大約18秒繋ぎ直せない

### 既知の制約

- **フェイルオープン**。presenceのWSが繋がらない環境では`isOnline`が常にfalseになり判定が素通りする。誰もログインできなくなる方向には壊れない
- 異常切断の直後は最大約18秒、同じアカウントで繋ぎ直せない（`pingTimeout`でフラグが下りるまで）
- バックエンドを複数プロセスへ水平スケールすると、Mapがプロセスローカルなため判定が壊れる（presence機能自体の既存の制約と同じ）
- バックエンドを複数プロセスへ水平スケールすると、Mapがプロセスローカルなため判定が壊れる（presence機能自体の既存の制約と同じ）

---

## 8. 登録直後のUXフィードバック

status: 実装済み

- 登録成功時に「🎉 登録が完了しました！」を約900ms表示してからホーム画面に自動遷移するよう実装（[page.tsx](frontend/src/app/page.tsx)の`handleAuthSubmit`register分岐、`registerSuccessMsg`）
- ブラウザ実機で表示・遷移を確認済み

---

## 関連ドキュメント

- [friend-requirements.md](docs/friend-requirements.md) — フレンド機能とオンライン状態表示。subject Usersモジュールの「Users can add other users as friends and see their online status」に対応する部分はそちらで定義している
