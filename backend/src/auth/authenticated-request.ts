import type { Request } from 'express';

/**
 * AuthGuard がトークン検証後に request.user へ載せるユーザー情報。
 * auth.guard.ts の select しているフィールドと一致させること。
 */
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  profileImage: string | null;
}

/**
 * AuthGuard を通過したあとのリクエスト。
 * コントローラの `@Request()` に付けると、req.user が any ではなくなる。
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
