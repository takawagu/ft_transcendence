import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PresenceService } from '../presence/presence.service';
import {
  PRESENCE_EVENTS,
  FriendAcceptedPayload,
  FriendRequestReceivedPayload,
} from '../presence/presence.events';

/**
 * 上限値。バグ・リソース枯渇を防ぐガードレールであり、実運用で到達することは想定していない。
 * 詳細は docs/friend-requirements.md セクション3。
 */
const FRIEND_LIMIT = 1000;
const PENDING_LIMIT = 100;
const BLOCK_LIMIT = 1000;

/** 検索候補の表示件数。列挙を助けないよう少数に絞る */
const SEARCH_LIMIT = 3;

/** 一覧・申請で返すユーザー情報。emailは含めない（フレンド全員に配ることになるため） */
const USER_SELECT = {
  id: true,
  username: true,
  bio: true,
  profileImage: true,
} as const;

/** ブロック一覧はbioも不要 */
const BLOCKED_USER_SELECT = {
  id: true,
  username: true,
  profileImage: true,
} as const;

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  async getFriends(myId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ applicantId: myId }, { approverId: myId }],
        status: 'ACCEPTED',
      },
      include: {
        applicant: { select: USER_SELECT },
        approver: { select: USER_SELECT },
      },
    });

    return friendships.map((f) =>
      f.applicantId === myId ? f.approver : f.applicant,
    );
  }

  async getRequests(myId: number) {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.friendship.findMany({
        where: { approverId: myId, status: 'PENDING' },
        include: { applicant: { select: USER_SELECT } },
      }),
      this.prisma.friendship.findMany({
        where: { applicantId: myId, status: 'PENDING' },
        include: { approver: { select: USER_SELECT } },
      }),
    ]);

    return {
      incoming: incoming.map((f) => ({ id: f.id, user: f.applicant })),
      outgoing: outgoing.map((f) => ({ id: f.id, user: f.approver })),
    };
  }

  /**
   * usernameの部分一致でフレンド候補を返す。
   * ブロック関係にある相手（どちらの向きでも）は結果に含めない。
   * 既にフレント/申請中の相手は除外せず relation を付けて返す。
   * 除外すると「入力したのに何も出ない」状態になり、理由が分からないため。
   */
  async searchUsers(myId: number, q: string) {
    const users = await this.prisma.user.findMany({
      where: {
        username: { contains: q, mode: 'insensitive' },
        id: { not: myId },
        // 相手が自分をブロックしている / 自分が相手をブロックしている
        blocksMade: { none: { blockedId: myId } },
        blocksReceived: { none: { blockerId: myId } },
      },
      select: USER_SELECT,
      orderBy: { username: 'asc' },
      take: SEARCH_LIMIT,
    });

    if (users.length === 0) return [];

    const ids = users.map((u) => u.id);
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { applicantId: myId, approverId: { in: ids } },
          { applicantId: { in: ids }, approverId: myId },
        ],
      },
      select: { applicantId: true, approverId: true, status: true },
    });

    const relationOf = new Map<number, 'friend' | 'pending'>();
    for (const f of friendships) {
      const otherId = f.applicantId === myId ? f.approverId : f.applicantId;
      relationOf.set(otherId, f.status === 'ACCEPTED' ? 'friend' : 'pending');
    }

    return users.map((u) => ({
      ...u,
      relation: relationOf.get(u.id) ?? ('none' as const),
    }));
  }

  async sendRequest(myId: number, query: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: query },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === myId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    // 「相手にブロックされている」判定は既存関係の判定より先に行う。
    // ブロック時に関係は全削除される想定だが、その不変条件に依存せずブロックを隠すため。
    if (await this.isBlockedBy(targetUser.id, myId)) {
      throw new NotFoundException('User not found');
    }

    if (await this.isBlockedBy(myId, targetUser.id)) {
      throw new BadRequestException(
        'ブロック中のユーザーです。解除してください',
      );
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { applicantId: myId, approverId: targetUser.id },
          { applicantId: targetUser.id, approverId: myId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Already friends');
      }
      throw new BadRequestException('Friend request is already pending');
    }

    await this.assertFriendLimit(myId);

    const pendingCount = await this.prisma.friendship.count({
      where: { applicantId: myId, status: 'PENDING' },
    });
    if (pendingCount >= PENDING_LIMIT) {
      throw new BadRequestException(
        `送信中の申請が上限（${PENDING_LIMIT}件）に達しています`,
      );
    }

    const friendship = await this.prisma.friendship.create({
      data: { applicantId: myId, approverId: targetUser.id, status: 'PENDING' },
    });

    // 相手が未接続なら何も起きない。次回接続時に GET /api/friends/requests で拾われる
    this.presence.emitToUser(
      targetUser.id,
      PRESENCE_EVENTS.FRIEND_REQUEST_RECEIVED,
      {
        friendshipId: friendship.id,
        user: await this.getPublicUser(myId),
      } satisfies FriendRequestReceivedPayload,
    );

    return { success: true };
  }

  async acceptRequest(myId: number, friendshipId: number) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      friendship.approverId !== myId ||
      friendship.status !== 'PENDING'
    ) {
      throw new BadRequestException('Friend request not found or not for you');
    }

    // 申請時のチェックだけでは、申請を溜めてから一斉に承認されると上限を超えられる
    await this.assertFriendLimit(myId);
    await this.assertFriendLimit(friendship.applicantId);

    await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    this.presence.emitToUser(
      friendship.applicantId,
      PRESENCE_EVENTS.FRIEND_ACCEPTED,
      { user: await this.getPublicUser(myId) } satisfies FriendAcceptedPayload,
    );

    // 承認した瞬間から相手が「フレンド」になるので、双方の現在の在席を伝える
    this.presence.notifyNewFriendship(myId, friendship.applicantId);

    return { success: true };
  }

  /** 受信申請の「拒否」と送信申請の「キャンセル」を兼ねる（実処理は同一の行削除） */
  async rejectRequest(myId: number, friendshipId: number) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      (friendship.approverId !== myId && friendship.applicantId !== myId)
    ) {
      throw new BadRequestException('Friend request not found');
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } });

    return { success: true };
  }

  async removeFriend(myId: number, friendId: number) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { applicantId: myId, approverId: friendId },
          { applicantId: friendId, approverId: myId },
        ],
        status: 'ACCEPTED',
      },
    });

    if (!friendship) {
      throw new BadRequestException('Friendship not found');
    }

    await this.prisma.friendship.delete({ where: { id: friendship.id } });

    return { success: true };
  }

  async getBlocks(myId: number) {
    const blocks = await this.prisma.block.findMany({
      where: { blockerId: myId },
      include: { blocked: { select: BLOCKED_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    return blocks.map((b) => b.blocked);
  }

  async blockUser(myId: number, userId: number) {
    if (userId === myId) {
      throw new BadRequestException('You cannot block yourself');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // 冪等。@@unique違反で500になるのを避ける
    if (await this.isBlockedBy(myId, userId)) {
      return { success: true };
    }

    const blockCount = await this.prisma.block.count({
      where: { blockerId: myId },
    });
    if (blockCount >= BLOCK_LIMIT) {
      throw new BadRequestException(
        `ブロックが上限（${BLOCK_LIMIT}件）に達しています`,
      );
    }

    // フレンド関係・保留中の申請の削除とBlock行の作成は不可分に行う
    await this.prisma.$transaction([
      this.prisma.friendship.deleteMany({
        where: {
          OR: [
            { applicantId: myId, approverId: userId },
            { applicantId: userId, approverId: myId },
          ],
        },
      }),
      this.prisma.block.create({
        data: { blockerId: myId, blockedId: userId },
      }),
    ]);

    // Friendship行の削除だけでは、接続中クライアントの onlineFriendIds に相手が
    // 残ったままになる。双方の画面から即座にオフライン化させる
    this.presence.notifyBlocked(myId, userId);

    return { success: true };
  }

  /** 解除してもフレンド関係は復活しない（改めて申請し直す必要がある） */
  async unblockUser(myId: number, userId: number) {
    await this.prisma.block.deleteMany({
      where: { blockerId: myId, blockedId: userId },
    });

    return { success: true };
  }

  /**
   * 2人が現在フレンドかどうか。DM の送信・履歴取得の可否判定に使う。
   * ブロック時に Friendship を全削除する仕様のため、これが false ならブロック相手も含めて遮断される。
   */
  async areFriends(userIdA: number, userIdB: number): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { applicantId: userIdA, approverId: userIdB },
          { applicantId: userIdB, approverId: userIdA },
        ],
        status: 'ACCEPTED',
      },
      select: { id: true },
    });
    return friendship !== null;
  }

  /** 他モジュールから相手の公開情報を引くための入口 */
  async getPublicUserById(userId: number) {
    return this.getPublicUser(userId);
  }

  /** 通知ペイロードに載せる自分の公開情報 */
  private async getPublicUser(userId: number) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: USER_SELECT,
    });
  }

  /** blockerId が blockedId をブロックしているか */
  private async isBlockedBy(
    blockerId: number,
    blockedId: number,
  ): Promise<boolean> {
    const block = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      select: { id: true },
    });
    return block !== null;
  }

  private async assertFriendLimit(userId: number) {
    const count = await this.prisma.friendship.count({
      where: {
        OR: [{ applicantId: userId }, { approverId: userId }],
        status: 'ACCEPTED',
      },
    });
    if (count >= FRIEND_LIMIT) {
      throw new BadRequestException(
        `フレンド数が上限（${FRIEND_LIMIT}件）に達しています`,
      );
    }
  }
}
