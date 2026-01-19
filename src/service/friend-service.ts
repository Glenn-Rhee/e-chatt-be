import type z from "zod";
import type { ResponsePayload } from "../types/index.js";
import { prisma } from "../lib/prisma.js";
import ResponseError from "../error/Response-Error.js";
import type { FriendStatus } from "../../generated/prisma/enums.js";

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
      where: { username: { contains: username } },
      select: {
        userDetail: { select: { image_url: true } },
        id: true,
        email: true,
        username: true,
      },
    });

    const relations = await prisma.friendRequest.findMany({
      where: {
        OR: [{ requesterId: user.id, receiverId: user.id }],
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
}
