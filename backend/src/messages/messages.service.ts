import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { PresenceService } from '../presence/presence.service';
import { PRESENCE_EVENTS } from '../presence/presence.events';

/** 履歴取得の既定件数と上限（上限は HistoryQueryDto の @Max と揃える） */
const DEFAULT_HISTORY_LIMIT = 50;

/** 会話一覧に載せる本文の抜粋長 */
const PREVIEW_LENGTH = 100;

interface ConversationRow {
  partner: number;
  id: number;
  content: string;
  createdAt: Date;
  senderId: number;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friends: FriendsService,
    private readonly presence: PresenceService,
  ) {}

  /**
   * 相手ごとの最新1件を返す。
   * フレンドごとに findFirst を回すとN+1になるため、DISTINCT ON で1本のクエリにまとめる。
   */
  async getConversations(myId: number) {
    const rows = await this.prisma.$queryRaw<ConversationRow[]>`
      SELECT DISTINCT ON (partner)
             partner, id, content, "createdAt", "senderId"
      FROM (
        SELECT CASE WHEN "senderId" = ${myId} THEN "receiverId" ELSE "senderId" END AS partner,
               id, content, "createdAt", "senderId"
        FROM "DirectMessage"
        WHERE "senderId" = ${myId} OR "receiverId" = ${myId}
      ) t
      ORDER BY partner, "createdAt" DESC, id DESC
    `;

    return rows
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => ({
        userId: r.partner,
        content: r.content.slice(0, PREVIEW_LENGTH),
        createdAt: r.createdAt,
        senderId: r.senderId,
      }));
  }

  /**
   * 特定の相手との履歴。表示順（古い順）で返す。
   * フレンドでない相手の履歴は見せない（フレンド解除・ブロック後は403）。
   */
  async getHistory(
    myId: number,
    userId: number,
    before?: number,
    limit = DEFAULT_HISTORY_LIMIT,
  ) {
    await this.assertFriends(myId, userId);

    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
        ...(before !== undefined ? { id: { lt: before } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit,
    });

    // 新しい順で取ってから反転する（古い順にtakeすると最新が取れない）
    return messages.reverse();
  }

  async sendMessage(myId: number, receiverId: number, content: string) {
    if (receiverId === myId) {
      throw new BadRequestException('自分自身にはメッセージを送れません');
    }

    await this.assertFriends(myId, receiverId);

    const message = await this.prisma.directMessage.create({
      data: { senderId: myId, receiverId, content },
    });

    // 受信者だけでなく送信者にも配信する。同じアカウントで開いている別タブを同期させるため
    const [me, other] = await Promise.all([
      this.friends.getPublicUserById(myId),
      this.friends.getPublicUserById(receiverId),
    ]);
    this.presence.emitToUser(receiverId, PRESENCE_EVENTS.DM_RECEIVED, {
      message,
      user: me,
    });
    this.presence.emitToUser(myId, PRESENCE_EVENTS.DM_RECEIVED, {
      message,
      user: other,
    });

    return message;
  }

  /**
   * フレンド限定。ブロック時に Friendship が全削除される仕様のおかげで、
   * ここを通すだけでブロック相手との送受信も遮断される。
   */
  private async assertFriends(myId: number, otherId: number) {
    if (!(await this.friends.areFriends(myId, otherId))) {
      throw new ForbiddenException(
        'フレンドではないユーザーとはやり取りできません',
      );
    }
  }
}
