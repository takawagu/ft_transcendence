import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * プロフィール更新の入力。
 * `@Body() body: any` だとmetatypeが `Object` になりグローバルValidationPipeがスキップされるため、
 * DTOを明示して検証を効かせる。上限値は RegisterDto と揃えること。
 */
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000000)
  profileImage?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
