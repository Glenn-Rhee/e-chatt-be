import type z from "zod";
import type { ResponsePayload } from "../types/index.js";
import type ChattValidation from "../validation/chatt-validation.js";
import { prisma } from "../lib/prisma.js";
import ResponseError from "../error/Response-Error.js";

export default class ChattService {
  static async sendMessage(
    data: z.infer<typeof ChattValidation.MESSAGE>,
    emailSender: string,
  ): Promise<ResponsePayload> {
    const userSender = await prisma.user.findUnique({
      where: { email: emailSender },
      select: { id: true },
    });

    if (!userSender) {
      throw new ResponseError(404, "User sender is not found!");
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        users: {
          every: {
            id: { in: [userSender.id, data.targetId] },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: userSender.id }, { id: data.targetId }],
          },
        },
      });
    }

    await prisma.message.create({
      data: {
        content: data.message,
        senderId: userSender.id,
        conversationId: conversation.id,
      },
    });

    return {
      status: "success",
      code: 201,
      data: null,
      message: "Successfully create message",
    };
  }

  static async getChatts(email: string): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new ResponseError(404, "User is not found!");
    }

    const conversations = await prisma.conversation.findMany({
      where: { users: { some: { id: user.id } } },
      select: {
        id: true,
        users: {
          where: {
            id: { not: user.id },
          },
          select: {
            id: true,
            username: true,
            email: true,
            userDetail: {
              select: {
                image_url: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
      },
    });

    const data = conversations.map((conv) => ({
      convId: conv.id,
      userFrom: conv.users[0],
      message: conv.messages[0],
    }));

    return {
      code: 200,
      data,
      message: "Successfully get conversations!",
      status: "success",
    };
  }

  static async createConversation(
    email: string,
    idUserTarget: string,
  ): Promise<ResponsePayload> {
    const userData = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    const userDataTarget = await prisma.user.findUnique({
      where: { id: idUserTarget },
      select: { id: true },
    });

    if (!userData || !userDataTarget) {
      throw new ResponseError(404, "User sender or receiver is not found!");
    }

    const friendShip = await prisma.friendShip.findFirst({
      where: {
        OR: [
          {
            userIdA: userData.id,
            userIdB: userDataTarget.id,
          },
          {
            userIdA: userDataTarget.id,
            userIdB: userData.id,
          },
        ],
      },
      select: { id: true },
    });

    if (!friendShip) {
      throw new ResponseError(400, "Oops user is not have a friendship!");
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        users: {
          every: {
            id: { in: [userData.id, userDataTarget.id] },
          },
        },
      },
      select: { id: true },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: userData.id }, { id: userDataTarget.id }],
          },
        },
        select: { id: true },
      });
    }

    const dataMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
    });

    return {
      status: "success",
      code: 201,
      data: dataMessages,
      message: "Successfully!",
    };
  }
}
