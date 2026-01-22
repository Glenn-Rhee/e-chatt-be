import type { ResponsePayload } from "../types/index.js";
import { prisma } from "../lib/prisma.js";
import ResponseError from "../error/Response-Error.js";
import type { FriendStatus } from "../../generated/prisma/enums.js";
import type z from "zod";
import type FriendValidation from "../validation/friend-validation.js";
import { getIO } from "../lib/socket.js";

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

    const userA = user.id;
    const userB = receiverId;
    const [a, b] = userA < userB ? [userA, userB] : [userB, userA];
    const friendShip = await prisma.friendShip.findFirst({
      where: {
        OR: [
          { userIdA: a, userIdB: b },
          { userIdA: b, userIdB: a },
        ],
      },
    });

    const friendRequested = await prisma.friendRequest.findFirst({
      where: {
        requesterId: user.id,
        receiverId,
      },
    });

    if (friendShip && friendRequested) {
      await prisma.friendRequest.delete({
        where: { id: friendRequested.id },
      });
      await prisma.friendShip.delete({
        where: {
          id: friendShip.id,
        },
      });

      getIO().to(receiverId).emit("friend:remove", { requesterId: user.id });

      return {
        status: "success",
        code: 201,
        data: null,
        message: "Successfully removed friend!",
      };
    }

    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId: userA, receiverId: userB },
          { requesterId: userB, receiverId: userA },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (friendRequest?.status === "PENDING") {
      throw new ResponseError(400, "Friend request still pending");
    }

    if (friendRequest) {
      await prisma.friendRequest.update({
        where: {
          id: friendRequest.id,
        },
        data: {
          status: "PENDING",
        },
      });
    } else {
      await prisma.friendRequest.create({
        data: {
          requesterId: userA,
          receiverId: userB,
        },
      });
    }

    const friendRequestes = await prisma.friendRequest.findMany({
      where: {
        requesterId: user.id,
        receiverId,
      },
      select: {
        id: true,
        requester: {
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
      },
    });

    getIO().to(receiverId).emit("friend:request", { data: friendRequestes });

    return {
      status: "success",
      code: 201,
      data: null,
      message: "Friend request sended!",
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

    if (data.accept) {
      const isAlreadyFriendShip = await prisma.friendShip.findFirst({
        where: {
          userIdA: data.userIdTarget,
          userIdB: user.id,
        },
        select: { id: true },
      });

      if (isAlreadyFriendShip) {
        throw new ResponseError(400, "Already accepted!");
      }

      // ID A : Yang ngerequest
      // ID B : Yang nge approve
      await prisma.friendShip.create({
        data: { userIdA: data.userIdTarget, userIdB: user.id },
      });
    }

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
      where: { receiverId: user.id, status: "PENDING" },
      select: {
        requester: {
          select: {
            id: true,
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
