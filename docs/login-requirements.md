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

## 7. 登録直後のUXフィードバック

status: 実装済み

- 登録成功時に「🎉 登録が完了しました！」を約900ms表示してからホーム画面に自動遷移するよう実装（[page.tsx](frontend/src/app/page.tsx)の`handleAuthSubmit`register分岐、`registerSuccessMsg`）
- ブラウザ実機で表示・遷移を確認済み

---

## 関連ドキュメント

- [friend-requirements.md](docs/friend-requirements.md) — フレンド機能とオンライン状態表示。subject Usersモジュールの「Users can add other users as friends and see their online status」に対応する部分はそちらで定義している
