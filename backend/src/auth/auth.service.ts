import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PresenceService } from '../presence/presence.service';

/**
 * 署名鍵はデフォルト値を持たせない。
 * 鍵が未設定でも動くようにしてしまうと、公開されている既知の鍵で署名した状態のまま
 * アプリが正常に動作してしまい（DBのパスワードと違い接続エラーで気づけない）、
 * 誰でも任意のuserIdのトークンを自作できてしまう。
 */
function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET が設定されていません。.env に `openssl rand -base64 48` で生成した値を入れてください。',
    );
  }

  return secret;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = requireJwtSecret();

  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  async register(body: RegisterDto) {
    const { email, password, username, bio, profileImage } = body;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('Email or Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        bio: bio || '',
        profileImage: profileImage || '',
      },
    });

    const token = this.generateToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
      },
      token,
    };
  }

  async login(body: LoginDto) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    /*
     * 多重ログインは先勝ちで禁止する（docs/login-requirements.md セクション7）。
     * ログイン中かどうかは presence の WebSocket 接続の有無で判定する。
     * パスワード検証の後に置くこと。先に置くと、パスワードを知らない第三者に
     * 「そのアカウントが今オンラインか」を教えてしまう。
     */
    if (this.presence.isOnline(user.id)) {
      throw new ConflictException(
        'このアカウントは既に別の端末またはブラウザでログイン中です。そちらでログアウトしてから、もう一度お試しください。',
      );
    }

    const token = this.generateToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
      },
      token,
    };
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { username } });
    return !!user;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  generateToken(userId: number): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * WebSocketハンドシェイクのトークンからuserIdだけを取り出す。
   * 接続時は「通ったか通らなかったか」しか要らないので、
   * 未指定・不正・期限切れのいずれも例外ではなくundefinedで返す。
   */
  userIdFromToken(token: unknown): number | undefined {
    if (typeof token !== 'string') return undefined;

    try {
      const payload = jwt.verify(token, this.jwtSecret) as { userId?: unknown };
      return typeof payload?.userId === 'number' ? payload.userId : undefined;
    } catch {
      return undefined;
    }
  }
}
