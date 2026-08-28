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
 * 招待からルームへ参加する。手順はホーム画面の handleJoinRoom に揃えたうえで、
 * 古いルームセッションの削除を1手加えている。
 *
 * `ito_room_session` を消すのは、直前に別のルームに居た場合にルームページの
 * 再接続分岐へ紛れ込むのを防ぐため。現状は roomCode の比較で弾かれるものの、
 * 招待でルームを渡り歩く導線ができる以上、明示的に捨ててから遷移する。
 *
 * 期限内でもルームが既に消えていることはある。その場合は参加後に既存の
 * ito:error「ルームが見つかりません」が出る（これを正規の失敗経路とする）。
 */
export function joinInvitedRoom(
  roomCode: string,
  username: string,
  router: ReturnType<typeof useRouter>,
) {
  sessionStorage.removeItem('ito_room_session');
  sessionStorage.setItem('ito_player_name', username);
  router.push(`/ito/room/${roomCode}`);
}
