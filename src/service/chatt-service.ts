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
    });

    console.log(conversations);

    return {
      code: 200,
      data: null,
      message: "Successfully get conversations!",
      status: "success",
    };
  }
}
