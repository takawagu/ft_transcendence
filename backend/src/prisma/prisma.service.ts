import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static pool: Pool;
  private static adapter: PrismaPg;

  constructor() {
    if (!PrismaService.pool) {
      const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ft_transcendence';
      PrismaService.pool = new Pool({ connectionString });
      PrismaService.adapter = new PrismaPg(PrismaService.pool);
    }
    super({
      adapter: PrismaService.adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.seedDevUsers();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedDevUsers() {
    try {
      const dev1Email = 'dev1@example.com';
      const dev2Email = 'dev2@example.com';

      let dev1 = await this.user.findUnique({ where: { email: dev1Email } });
      let dev2 = await this.user.findUnique({ where: { email: dev2Email } });

      const hashedPassword = await bcrypt.hash('password123', 10);

      if (!dev1) {
        dev1 = await this.user.create({
          data: {
            email: dev1Email,
            password: hashedPassword,
            username: 'Dev1',
            bio: '開発者アカウント1です。',
            profileImage: '🚀',
          },
        });
        console.log('Seed: Created Dev1 user');
      }

      if (!dev2) {
        dev2 = await this.user.create({
          data: {
            email: dev2Email,
            password: hashedPassword,
            username: 'Dev2',
            bio: '開発者アカウント2です。',
            profileImage: '👾',
          },
        });
        console.log('Seed: Created Dev2 user');
      }

      const friendship = await this.friendship.findFirst({
        where: {
          OR: [
            { applicantId: dev1.id, approverId: dev2.id },
            { applicantId: dev2.id, approverId: dev1.id }
          ]
        }
      });

      if (!friendship) {
        await this.friendship.create({
          data: {
            applicantId: dev1.id,
            approverId: dev2.id,
            status: 'ACCEPTED'
          }
        });
        console.log('Seed: Created Friendship between Dev1 and Dev2');
      }
    } catch (error) {
      console.error('Failed to seed dev users:', error);
    }
  }
}
