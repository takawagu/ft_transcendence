# ito 切断時の人数・配列変化に起因するバグ一覧

> **ステータス: 全件修正済み（2026-07-31）**
> 下記1〜4に加え、調査中に判明した5〜10も含めて対応済み。
> 新しい状態モデルと修正内容は [docs/disconnect-playerid-architecture.md](disconnect-playerid-architecture.md) を参照。
> このファイルは「何が壊れていたか」の記録として残す。

[reconnect-design.md](reconnect-design.md) の再接続/除外フローは実装済みだが、
「切断によって `room.players` / `turnOrder` / `boardOrder` などの配列や人数が変化する」
という一点を軸にコードを再点検したところ、下記の不整合が見つかった。
いずれも**単独プレイヤーの単発切断**では表面化しにくく、
**同時多重切断**や**複数ラウンドをまたぐ状態遷移**で顕在化する。

---

## 1. 【重大】`pausedPlayerId` が単一値のため、多重切断で先の切断者が除外フローから漏れる

- 該当箇所: [room.service.ts:148-194](backend/src/ito/service/room.service.ts#L148-L194)（`handleDisconnect`）

`ItoRoom.pausedPlayerId` は `string` 1つだけで、切断のたびに無条件で上書きされる。

```ts
player.connected = false;
...
room.paused = true;
room.pausedPlayerId = player.playerId;  // ← 既にpaused中でも無条件で上書き
```

`handleDisconnect` の先頭に `room.paused` が既に true かどうかのチェックが無い。

### 再現手順
1. A(host)/B/C/D の4人プレイでゲーム進行中。
2. B が切断 → `paused=true`, `pausedPlayerId=B` で `ito:gamePaused` がブロードキャストされる。
3. ホストが対応を選ぶ前に、C も切断 → `handleDisconnect` が再度走り、`pausedPlayerId` が `C` に上書きされる。
4. ホストの `PauseOverlay` には C の情報しか出ないため、「除外して続行」を押しても **C だけが除外され、B は `connected:false` のまま `room.players` に残り続ける**。

### 影響
- `excludePlayer` の除外判定・`turnOrder`/カード再集計は全て `!p.excluded` でしかフィルタしておらず、`connected` は一切見ていない
  （[room.service.ts:277](backend/src/ito/service/room.service.ts#L277) の `activePlayerCount`、
  [game.service.ts:335](backend/src/ito/service/game.service.ts#L335) の `buildTurnOrder`）。
- そのため B は「切断済みだが除外されていない」幽霊プレイヤーとして
  カード配布・`turnOrder`・進捗カウントの分母に永久に残る。
- B は二度とプロンプト送信もカード配置もできないため、
  `INPUT_GENERATING`/`SPEAKING` フェーズの完了条件（後述バグ3）を満たせなくなり、**その場でゲームが進行不能（フリーズ）になる**。
- 元々 reconnect-design.md 冒頭で挙げられていた「turnOrderに削除済みプレイヤーが残りフリーズしうる」という課題が、除外フローの穴から再発している形。

### 副次バグ
- [PauseOverlay.tsx:38-43](frontend/src/app/ito/room/%5BroomCode%5D/_phases/PauseOverlay.tsx#L38-L43) は
  `targetReconnected`（[PauseOverlay.tsx:9](frontend/src/app/ito/room/%5BroomCode%5D/_phases/PauseOverlay.tsx#L9)）が true でも
  「除外して続行」ボタンを非表示/無効化しない。
- サーバー側の `excludePlayer`（[room.service.ts:223-294](backend/src/ito/service/room.service.ts#L223-L294)）も
  `target.connected` を確認せずに除外処理を進めてしまう。
- そのため、**既に再接続して復帰済みのプレイヤーを誤って除外できてしまう**。

---

## 2. 【重大】「配置後」除外された `excluded` プレイヤーが次ラウンド以降も `room.players` に残り、カード配布・集計対象になる

- 該当箇所:
  - 除外処理: [room.service.ts:240-248](backend/src/ito/service/room.service.ts#L240-L248)
  - ラウンドリセット: [game.service.ts:285-311](backend/src/ito/service/game.service.ts#L285-L311)（`nextRound`）
  - 次ラウンド開始: [game.service.ts:25-66](backend/src/ito/service/game.service.ts#L25-L66)（`startGame`）

「配置後（カードが場に公開済み）」に切断されたプレイヤーは、正解判定にカード情報が必要なため
`room.players` から削除せず `excluded: true` フラグのみを立てる設計になっている
（[reconnect-design.md §4](reconnect-design.md)）。これ自体は妥当だが、
**そのラウンドが終わって次ラウンドに進む際に、この `excluded` フラグ付きプレイヤーを取り除く処理がどこにも無い**。

`nextRound()` は `room.players` の全員（除外済みも含む）に対して無条件でリセットをかける:

```ts
room.players.forEach((p) => {
  p.cardNumber = undefined;
  p.playerPhase = 'INPUT';       // ← excludedなプレイヤーも'INPUT'に戻る
  p.hasSubmittedPrompt = false;
  ...
});
```

`excluded` フラグ自体もリセットされず、`room.players` からの削除もされない。

### 再現手順
1. A/B/C の3人でプレイ、全ラウンド制3ラウンド設定。
2. ラウンド1の `SPEAKING` で C がカードを場に置いた**後**に切断 → ホストが「除外して続行」を選択。
   `boardOrder.includes(C)` が true なので `target.excluded = true` のみが立ち、`room.players` に C は残ったまま。
3. ラウンド1は A/B/C の結果でそのまま完了（C のカードも場に残っているので正解判定は正しい）。
4. ホストが「次のラウンドへ進む」を押す → `nextRound()` → `startGame()`。
   - `room.players.length` は 3 のまま（C を含む）。
   - `dealCards(3)` で C にも新しいカード番号が配られる。
   - `DEALT_CARD` が C の（既に無効な）`socketId` 宛に送られる。
   - `buildTurnOrder` は `!p.excluded` でフィルタするので `turnOrder` には C は入らない ⇒ **turnOrder側は正しい**。
   - しかし `INPUT_GENERATING` の完了判定（[game.service.ts:259](backend/src/ito/service/game.service.ts#L259)）は
     `generatedCount === room.players.length`（= 3）で見ており、C を除外していない。
5. C は切断済みでプロンプトを送信できないため `generatedCount` は永遠に 2 のまま 3 に到達せず、
   **ラウンド2の `INPUT_GENERATING` がフリーズしたまま進まなくなる**。

### 影響
- 一度でも「配置後」除外が発生すると、**その回以降の全ラウンドが実質詰む**。
- `confirmOrder` の `correctOrder`（[game.service.ts:141-143](backend/src/ito/service/game.service.ts#L141-L143)）も
  `room.players` を無フィルタで参照しているため、万一 SPEAKING まで進めてしまった場合でも
  正解判定・`revealedCards` に幽霊プレイヤーの新カードが混入する。
- UI 側の分母表示（`プロンプト送信 X / totalCount`、`場 (X / players.length)` = [Speaking.tsx:146](frontend/src/app/ito/room/%5BroomCode%5D/_phases/Speaking.tsx#L146)）
  もすべて `room.players.length` ベースなので、ユーザーには「なぜか2/3のまま進まない」という形で見える。

---

## 3. 【中】進捗カウント（`PROMPT_SUBMITTED` / `IMAGE_GENERATED`）の分母が `room.players.length` で、除外済みプレイヤーを引いていない

- 該当箇所:
  - [game.service.ts:81-87](backend/src/ito/service/game.service.ts#L81-L87)（`submitPrompt` の `totalCount`）
  - [game.service.ts:246-257](backend/src/ito/service/game.service.ts#L246-L257)（`stubGenerateImage` の `totalCount`）

`checkProgressAfterExclusion`（[game.service.ts:193-212](backend/src/ito/service/game.service.ts#L193-L212)）は
除外「直後」に一度だけ再判定を行うが、それ以外の通常の `submitPrompt`/`stubGenerateImage` の完了判定・カウント表示は
一貫して `room.players.length`（除外・切断を問わず全員）を分母にしている。

バグ1・2と組み合わさることで、この分母は「本来ゲームに参加できないプレイヤー」を含んだまま**永久に**ずれ続け、
単なる表示上のズレ（次のイベントで自然に直る一時的なもの）ではなく、**恒久的なフリーズの直接原因**になる。

---

## 4. 【中】`leaveRoom` にフェーズガードが無く、ゲーム進行中に呼ばれると `turnOrder`/`boardOrder`/`roundHostId` を更新せずに配列だけ変化させてしまう

- 該当箇所: [room.service.ts:111-130](backend/src/ito/service/room.service.ts#L111-L130)

他のハンドラ（`startGame`, `placeCard`, `reorderCards`, `confirmOrder`, `sendChat` など）は
軒並み `room.roomPhase !== 'X'` のガードを持つが、`leaveRoom` にはフェーズチェックが一切無い。

```ts
leaveRoom(client: Socket) {
  const room = this.store.getRoomBySocketId(client.id);
  if (!room) return;
  room.players = room.players.filter((p) => p.socketId !== client.id);
  ...
}
```

現状フロントエンドは `ito:leaveRoom` を `WaitingRoom.tsx` の「退室する」ボタンからしか送っておらず、
UI上は WAITING フェーズでのみ到達可能に見える。しかし **サーバー側には歯止めが無いため**、
ゲーム進行中に何らかの経路（別クライアント実装・タイミングバグ・将来の機能追加）でこのイベントが飛んだ場合、
`turnOrder`/`boardOrder`/`roundHostId` を一切調整せずに `room.players` だけが変化し、
バグ2と同種の「配列参照先が消えた選手を指したまま」というフリーズ状態を再現してしまう。
切断由来の除外にはある `turnOrder`/`boardOrder`/`currentTurnIndex`/`roundHostId` の再計算
（[room.service.ts:249-272](backend/src/ito/service/room.service.ts#L249-L272)）が、こちらには一切無い。

---

## まとめ・優先度

| # | 内容 | 深刻度 | トリガー条件 |
|---|------|--------|--------------|
| 1 | 多重切断で `pausedPlayerId` が上書きされ、先の切断者が除外されずゲームが人数不整合のまま固まる | 重大 | 短時間に2人以上が切断 |
| 2 | 「配置後」除外されたプレイヤーが次ラウンド以降も `room.players` に残り、カード配布・完了判定の分母に混入し続ける | 重大 | 一度でも配置後の除外が発生し、次ラウンドに進む |
| 3 | 進捗カウントの分母が除外・切断を反映しない | 中（1・2の症状を悪化させる） | 上記1・2と同時 |
| 4 | `leaveRoom` にフェーズガードが無く、ゲーム進行中の退室で配列不整合を起こしうる | 中（現状UI経路は無いが穴として残る） | ゲーム進行中に `ito:leaveRoom` が発火した場合 |

### 修正の方向性（メモ）
- 1: `pausedPlayerId` を単一値ではなくキュー（切断中プレイヤーIDの配列）にするか、
  切断のたびに `pausedPlayerId` を上書きするのではなく「現在切断中の全プレイヤー」をホストに提示し、個別に除外できるようにする。
  あわせて `excludePlayer` 側で `target.connected` を確認し、既に再接続済みなら除外を拒否する。
- 2: `nextRound()`（または `excludePlayer` の時点）で `excluded: true` のプレイヤーを `room.players` から完全に削除する。
  ただし直前ラウンドの結果表示（`RevealResult`）がまだ `room.players` を参照している場合は、
  「結果表示が終わってから（`nextRound` 呼び出し時に）削除する」など削除タイミングの整理が必要。
- 3: `room.players.length` を使っている箇所を軒並み `room.players.filter(p => !p.excluded).length` に置き換える。
  ついでに `connected` も考慮するかは1の直し方次第。
- 4: `leaveRoom` にも他ハンドラと同様の除外ロジック（`turnOrder`/`boardOrder`/`currentTurnIndex`/`roundHostId` の再計算）を通す、
  もしくは WAITING フェーズ以外では `ito:leaveRoom` を拒否する明示ガードを追加する。
