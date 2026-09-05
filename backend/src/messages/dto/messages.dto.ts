import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** DM本文の上限。フロントの maxLength と揃えること */
export const MESSAGE_MAX_LENGTH = 1000;

/**
 * ルーム招待の本文。
 * 空にすると会話一覧のプレビューが空欄になるため固定文言を入れる。
 * スレッド内では content ではなく招待カードを描くので、二重に出ることはない
 * （docs/room-invite-requirements.md セクション1）。
 */
export const ROOM_INVITE_CONTENT = 'ゲームルームに招待しました';

export class SendMessageDto {
  @IsInt()
  receiverId: number;

  /**
   * 検証の前に trim する。空白だけの本文は `@IsNotEmpty` を素通りしてしまうため、
   * 「空なら400」を空白だけの入力にも効かせる。保存される本文も trim 済みになる。
   */
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  @MaxLength(MESSAGE_MAX_LENGTH)
  content: string;
}

export class SendRoomInviteDto {
  @IsInt()
  receiverId: number;

  /**
   * 生成側の charset と揃える（RoomStore.generateRoomCode）。
   * 紛らわしい I/O/0/1 は含まない6文字。
   */
  @Matches(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/, {
    message: 'roomCode の形式が不正です',
  })
  roomCode: string;
}

export class MarkReadDto {
  /** 会話の相手 */
  @IsInt()
  userId: number;

  /** ここまで読んだ、というメッセージID */
  @IsInt()
  @Min(1)
  lastMessageId: number;
}

/**
 * 会話履歴のカーソルページング。
 * クエリ文字列は文字列で届くため、@Type で数値へ変換してから検証する
 * （グローバルValidationPipeは enableImplicitConversion を有効にしていない）。
 */
export class HistoryQueryDto {
  /** このID未満のメッセージを取得する。createdAtではなくidを使い同時刻の取りこぼしを防ぐ */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  before?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
