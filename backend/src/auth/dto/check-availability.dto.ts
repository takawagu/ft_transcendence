import { IsEmail, IsString, MinLength } from 'class-validator';

export class CheckUsernameDto {
  @IsString()
  @MinLength(1)
  username: string;
}

export class CheckEmailDto {
  @IsEmail()
  email: string;
}
