import type { ResponsePayload } from "../types/index.js";
import { prisma } from "../lib/prisma.js";
import ResponseError from "../error/Response-Error.js";
import type { FriendStatus } from "../../generated/prisma/enums.js";
import type z from "zod";
import type FriendValidation from "../validation/friend-validation.js";

export default class FriendService {
  static async findUser(
    username: string,
    email: string,
  ): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (!user) {
      throw new ResponseError(404, "User is not found!");
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: username.toLowerCase().trim() },
        AND: { id: { not: user.id } },
      },
      select: {
        userDetail: { select: { image_url: true } },
        id: true,
        email: true,
        username: true,
      },
    });

    const relations = await prisma.friendRequest.findMany({
      where: {
        requesterId: user.id,
      },
      select: {
        requesterId: true,
        receiverId: true,
        status: true,
      },
    });

    const relationMap = new Map<string, { status: FriendStatus }>();
    for (const relation of relations) {
      const otherUserId =
        relation.requesterId === user.id
          ? relation.receiverId
          : relation.requesterId;

      relationMap.set(otherUserId, { status: relation.status });
    }

    const result = users.map((user) => {
      const relation = relationMap.get(user.id);
      return {
        ...user,
        isFriend: relation?.status === "ACCEPTED",
        isPending: relation?.status === "PENDING",
      };
    });

    return {
      status: "success",
      code: 200,
      data: result,
      message: "Successfully get users!",
    };
  }

  static async addFriend(
    receiverId: string,
    emailSender: string,
  ): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { email: emailSender },
      select: { id: true },
    });

    if (!user) {
      throw new ResponseError(404, "User is not found!");
    }

    const friend = await prisma.friendRequest.findFirst({
      where: { receiverId, requesterId: user.id },
    });

    let msgResponse = "";
    let code = 200;

    if (friend) {
      if (friend.status === "ACCEPTED") {
        await prisma.friendRequest.delete({
          where: { id: friend.id },
        });

        msgResponse = "Successfully delete friend!";
        code = 204;
      } else if (friend.status === "PENDING") {
        throw new ResponseError(400, "Please wait until accepted!");
      }
    } else {
      await prisma.friendRequest.create({
        data: {
          requesterId: user.id,
          receiverId,
        },
      });
      msgResponse = "Successfully add friend!";
      code = 201;
    }

    return {
      status: "success",
      code,
      data: null,
      message: msgResponse,
    };
  }

  static async actionFriend(
    data: z.infer<typeof FriendValidation.ACTIONFRIEND>,
    email: string,
  ): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new ResponseError(404, "User is not found!");
    }

    const relation = await prisma.friendRequest.findFirst({
      where: {
        requesterId: data.userIdTarget,
        receiverId: user.id,
      },
      select: { id: true },
    });

    if (!relation) {
      throw new ResponseError(404, "Oops request friend is not found!");
    }

    await prisma.friendRequest.update({
      where: {
        id: relation?.id,
      },
      data: {
        status: data.accept ? "ACCEPTED" : "REJECTED",
      },
    });

    return {
      status: "success",
      code: 200,
      data: null,
      message: "Success change status!",
    };
  }

  static async getFriendsAction(email: string): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new ResponseError(404, "User is not found!");
    }

    const relations = await prisma.friendRequest.findMany({
      where: { receiverId: user.id },
      select: {
        requester: {
          select: {
            username: true,
            email: true,
            userDetail: {
              select: { image_url: true },
            },
          },
        },
        id: true,
      },
    });

    return {
      code: 200,
      data: relations,
      message: "Successfully get request friend",
      status: "success",
    };
  }
}
