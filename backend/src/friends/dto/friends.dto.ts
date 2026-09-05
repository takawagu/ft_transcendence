import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * ユーザー検索（部分一致）。
 * 1文字での総当たりを避けるため最低2文字を要求する。
 */
export class SearchUsersDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  q: string;
}

/**
 * フレンド申請の送信。usernameの完全一致のみ（email検索は廃止）。
 * 上限導入前に登録された長いusernameのユーザーを検索不能にしないため、ここに @MaxLength は付けない。
 */
export class SendFriendRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  query: string;
}

/** 承認・拒否。Friendship.id を指す */
export class FriendshipIdDto {
  @IsInt()
  friendshipId: number;
}

/** フレンド削除。Friendship.id ではなく相手のuserId を指す */
export class FriendIdDto {
  @IsInt()
  friendId: number;
}

/** ブロック・ブロック解除。相手のuserId を指す */
export class UserIdDto {
  @IsInt()
  userId: number;
}
