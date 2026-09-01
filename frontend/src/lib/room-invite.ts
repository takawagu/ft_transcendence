/**
 * ルーム招待の共通処理（docs/room-invite-requirements.md セクション3・4）。
 * トースト（invite-toast.tsx）と /messages の招待カードの両方から使う。
 */
import type { useRouter } from 'next/navigation';

/**
 * 招待を「期限切れ」と見なすまでの時間。1ゲームが終わる程度の時間から取った目安で、
 * **サーバーは一切参照しない**。見た目を落ち着かせるためだけの値。
 */
export const ROOM_INVITE_TTL_MS = 30 * 60 * 1000;

export function isInviteExpired(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > ROOM_INVITE_TTL_MS;
}

/**
 * 招待からルームへ参加する。手順はホーム画面の handleJoinRoom と同じ。
 *
 * かつてここは `ito_room_session` を消してから遷移していた。ルームページが
 * 「参加済みかどうか」をクライアント側の記録で判定していた頃の名残で、
 * その判定自体が誤り（記録の有無で復帰/新規参加を当てにいくと必ずどちらかを
 * 取り逃す）だったため廃止した。今はルームページが常に ito:rejoin を送り、
 * 席を持っているサーバ側が復帰か新規参加かを決める。
 *
 * 期限内でもルームが既に消えていることはある。その場合は参加後に既存の
 * ito:error「ルームが見つかりません」が出る（これを正規の失敗経路とする）。
 */
export function joinInvitedRoom(
  roomCode: string,
  username: string,
  router: ReturnType<typeof useRouter>,
) {
  sessionStorage.setItem('ito_player_name', username);
  router.push(`/ito/room/${roomCode}`);
}
