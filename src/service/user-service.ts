import type z from "zod";
import { prisma } from "../lib/prisma.js";
import type { ResponsePayload } from "../types/index.js";
import type UserValidation from "../validation/user-validation.js";
import { v4 } from "uuid";

export default class UserService {
  public static async CreateUser(
    data: z.infer<typeof UserValidation.CREATEUSER>
  ): Promise<ResponsePayload> {
    const countOfUser = await prisma.user.count({
      where: {
        email: data.email,
      },
    });

    if (countOfUser === 0) {
      const createdUser = await prisma.user.create({
        data: {
          email: data.email,
          id: `U-${v4().substring(0, 8)}`,
          username: data.username,
        },
      });

      await prisma.userDetail.create({
        data: {
          gender: "UNKNOWN",
          image_url: data.imageUrl,
          userId: createdUser.id,
        },
      });
    }

    return {
      code: 200,
      data: null,
      message: "Success create user!",
      status: "success",
    };
  }
}
