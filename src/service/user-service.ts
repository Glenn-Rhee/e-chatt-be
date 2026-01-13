import type z from "zod";
import { prisma } from "../lib/prisma.js";
import type { ResponsePayload } from "../types/index.js";
import type UserValidation from "../validation/user-validation.js";
import { v4 } from "uuid";
import JWT from "../lib/jwt.js";
import Encryption from "../lib/encryption.js";

export default class UserService {
  public static async CreateUser(
    data: z.infer<typeof UserValidation.CREATEUSER>
  ): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    let token: string;

    if (!user) {
      const createdUser = await prisma.user.create({
        data: {
          email: data.email,
          id: `U-${v4().substring(0, 8)}`,
          username: data.username,
        },
      });

      token = JWT.signin({
        username: createdUser.username,
        email: createdUser.email,
      });

      await prisma.userDetail.create({
        data: {
          gender: "UNKNOWN",
          image_url: data.imageUrl,
          userId: createdUser.id,
        },
      });
    } else {
      token = JWT.signin({
        username: user.username,
        email: user.email,
      });
    }

    const tokenEncrypt = Encryption.encrypt(token);

    return {
      code: 200,
      data: {
        token: tokenEncrypt,
      },
      message: "Success create user!",
      status: "success",
    };
  }

  public static async GetUser(email: string): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        username: true,
        userDetail: {
          select: {
            birthday: true,
            gender: true,
            image_url: true,
          },
        },
      },
    });

    return {
      code: 200,
      data: user,
      message: "Success get user!",
      status: "success",
    };
  }
}
