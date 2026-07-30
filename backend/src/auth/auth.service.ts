import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'secret';

  constructor(private readonly prisma: PrismaService) {}

  async register(body: any) {
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

  async login(body: any) {
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
}
