import { ItoPlayer, ItoRoom } from '../types';

/**
 * ゲームに数えられるプレイヤー（除外されていない全員）。
 * turnOrderの構築・カード配布枚数・進捗の分子/分母は全てこれを基準にする。
 * 切断中(DISCONNECTED)の人も席を保持しているため含まれる。
 */
export function activePlayers(room: ItoRoom): ItoPlayer[] {
  return room.players.filter((p) => p.status !== 'EXCLUDED');
}

export function activeCount(room: ItoRoom): number {
  return activePlayers(room).length;
}

/** 今まさに接続しているプレイヤー。部屋の存続判定とホスト移譲先の選定に使う */
export function connectedPlayers(room: ItoRoom): ItoPlayer[] {
  return room.players.filter((p) => p.status === 'ACTIVE');
}

/** 切断中でホストの対応を待っているプレイヤー。ポーズの継続条件そのもの */
export function awolPlayers(room: ItoRoom): ItoPlayer[] {
  return room.players.filter((p) => p.status === 'DISCONNECTED');
}

/**
 * 除外済みプレイヤーをroom.playersから物理削除する（冪等）。
 * ラウンド境界でのみ呼ぶこと。ラウンド中に呼ぶと、場に出ているカードの
 * 番号・名前・画像が失われて正解判定と結果画面が壊れる。
 */
export function purgeExcluded(room: ItoRoom): void {
  room.players = room.players.filter((p) => p.status !== 'EXCLUDED');
}
