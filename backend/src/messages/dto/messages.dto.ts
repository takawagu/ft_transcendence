import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** DM本文の上限。フロントの maxLength と揃えること */
export const MESSAGE_MAX_LENGTH = 1000;

export class SendMessageDto {
  @IsInt()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MESSAGE_MAX_LENGTH)
  content: string;
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
