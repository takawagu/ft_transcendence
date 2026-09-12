import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { PresenceService } from '../presence/presence.service';
import {
  PRESENCE_EVENTS,
  type DmReceivedPayload,
} from '../presence/presence.events';
import { RoomStore } from '../ito/service/room.store';
import { ROOM_INVITE_CONTENT } from './dto/messages.dto';

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

interface UnreadRow {
  partner: number;
  /** Postgres の count() は bigint で返るため、Prisma 側では BigInt になる */
  unread: bigint;
}

/** `dm:received` に載せるメッセージ行。DirectMessage の全カラム */
interface BroadcastableMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
  type: string;
  roomCode: string | null;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friends: FriendsService,
    private readonly presence: PresenceService,
    private readonly rooms: RoomStore,
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
   * 相手ごとの未読件数。
   * 既読カーソル（ConversationRead）より新しい受信メッセージを数える。
   * カーソルが無い相手は1件も読んでいないので COALESCE で 0 として扱う。
   * ブロックされた相手やフレンド解除された相手の未読は出さないよう、
   * 現在フレンド（Friendship.status = 'ACCEPTED'）の相手のみに絞る。
   */
  async getUnreadCounts(myId: number) {
    const rows = await this.prisma.$queryRaw<UnreadRow[]>`
      SELECT dm."senderId" AS partner, count(*) AS unread
      FROM "DirectMessage" dm
      INNER JOIN "Friendship" f
        ON f.status = 'ACCEPTED'
       AND ((f."applicantId" = ${myId} AND f."approverId" = dm."senderId")
         OR (f."applicantId" = dm."senderId" AND f."approverId" = ${myId}))
      LEFT JOIN "ConversationRead" cr
        ON cr."userId" = ${myId} AND cr."partnerId" = dm."senderId"
      WHERE dm."receiverId" = ${myId}
        AND dm.id > COALESCE(cr."lastReadMessageId", 0)
      GROUP BY dm."senderId"
    `;

    return rows.map((r) => ({ userId: r.partner, count: Number(r.unread) }));
  }

  /**
   * その相手との会話を lastMessageId まで読んだことにする。
   * カーソルは後退させない。別タブで過去を遡っている間に巻き戻ると、
   * 読んだはずのメッセージが未読に戻ってしまうため。
   */
  async markRead(myId: number, partnerId: number, lastMessageId: number) {
    if (partnerId === myId) {
      throw new BadRequestException('自分自身との会話はありません');
    }

    const current = await this.prisma.conversationRead.findUnique({
      where: { userId_partnerId: { userId: myId, partnerId } },
      select: { lastReadMessageId: true },
    });

    const lastReadMessageId = Math.max(
      current?.lastReadMessageId ?? 0,
      lastMessageId,
    );

    await this.prisma.conversationRead.upsert({
      where: { userId_partnerId: { userId: myId, partnerId } },
      create: { userId: myId, partnerId, lastReadMessageId },
      update: { lastReadMessageId },
    });

    // 同じアカウントで開いている別タブのバッジを揃える
    this.presence.emitToUser(myId, PRESENCE_EVENTS.DM_READ, {
      userId: partnerId,
      lastReadMessageId,
    });

    // 相手（メッセージ送信者）へも既読をリアルタイムに通知
    this.presence.emitToUser(partnerId, PRESENCE_EVENTS.DM_READ_RECEIPT, {
      userId: myId,
      lastReadMessageId,
    });

    return { userId: partnerId, lastReadMessageId };
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

    // 相手がこちらのメッセージをどこまで読んだかのカーソルを取得
    const partnerCursor = await this.prisma.conversationRead.findUnique({
      where: { userId_partnerId: { userId, partnerId: myId } },
      select: { lastReadMessageId: true },
    });

    // 新しい順で取ってから反転する（古い順にtakeすると最新が取れない）
    return {
      messages: messages.reverse(),
      partnerLastReadMessageId: partnerCursor?.lastReadMessageId ?? 0,
    };
  }

  async sendMessage(myId: number, receiverId: number, content: string) {
    if (receiverId === myId) {
      throw new BadRequestException('自分自身にはメッセージを送れません');
    }

    await this.assertFriends(myId, receiverId);

    const message = await this.prisma.directMessage.create({
      data: { senderId: myId, receiverId, content },
    });

    await this.broadcastMessage(message);

    return message;
  }

  /**
   * ホストが待機中のitoルームへフレンドを招待する。
   *
   * 招待は「参加ボタンが付いたルームコードの通知」でしかなく、承認/拒否も失効管理も持たない
   * （docs/room-invite-requirements.md セクション0）。参加時の検証は既存の joinRoom が担う。
   */
  async sendRoomInvite(myId: number, receiverId: number, roomCode: string) {
    if (receiverId === myId) {
      throw new BadRequestException('自分自身には招待を送れません');
    }

    await this.assertFriends(myId, receiverId);

    const room = this.rooms.getRoomByCode(roomCode);
    if (!room) {
      throw new NotFoundException('ルームが見つかりません');
    }
    if (room.roomPhase !== 'WAITING') {
      throw new BadRequestException('ゲームはすでに開始されています');
    }
    // playerId は userId を文字列にしたもの（ItoPlayer.playerId）
    if (room.players.find((p) => p.isRoomOwner)?.playerId !== String(myId)) {
      throw new ForbiddenException('ルームのホストのみが招待を送れます');
    }
    if (room.players.some((p) => p.playerId === String(receiverId))) {
      throw new BadRequestException('その相手はすでにルームに参加しています');
    }

    /*
     * 同じ相手・同じルームへの招待は積み上げない。
     * ホストが二度押した場合や再送された場合に、スレッドが招待で埋まるのを防ぐ。
     * 既存行は受信者側で未読済みなので、この経路では配信し直さない
     * （再送すると同じ招待で未読が二重に増える）。
     */
    const existing = await this.prisma.directMessage.findFirst({
      where: { senderId: myId, receiverId, type: 'ROOM_INVITE', roomCode },
    });
    if (existing) return existing;

    const message = await this.prisma.directMessage.create({
      data: {
        senderId: myId,
        receiverId,
        content: ROOM_INVITE_CONTENT,
        type: 'ROOM_INVITE',
        roomCode,
      },
    });

    await this.broadcastMessage(message);

    return message;
  }

  /**
   * 受信者だけでなく送信者にも配信する。同じアカウントで開いている別タブを同期させるため。
   * user には「会話の相手」が入る（受信者には送信者、送信者には受信者）。
   */
  private async broadcastMessage(message: BroadcastableMessage) {
    const [sender, receiver] = await Promise.all([
      this.friends.getPublicUserById(message.senderId),
      this.friends.getPublicUserById(message.receiverId),
    ]);
    this.presence.emitToUser(message.receiverId, PRESENCE_EVENTS.DM_RECEIVED, {
      message,
      user: sender,
    } satisfies DmReceivedPayload);
    this.presence.emitToUser(message.senderId, PRESENCE_EVENTS.DM_RECEIVED, {
      message,
      user: receiver,
    } satisfies DmReceivedPayload);
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
