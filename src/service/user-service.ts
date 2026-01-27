import type z from "zod";
import { prisma } from "../lib/prisma.js";
import type { ResponsePayload } from "../types/index.js";
import type UserValidation from "../validation/user-validation.js";
import { v4 } from "uuid";
import JWT from "../lib/jwt.js";
import Encryption from "../lib/encryption.js";
import ResponseError from "../error/Response-Error.js";

export default class UserService {
  public static async CreateUser(
    data: z.infer<typeof UserValidation.CREATEUSER>,
  ): Promise<ResponsePayload> {
    let user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    let token: string;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          id: `U-${v4().substring(0, 8)}`,
          username: data.username,
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });

      token = JWT.signin({
        username: user.username,
        email: user.email,
      });

      await prisma.userDetail.create({
        data: {
          gender: "UNKNOWN",
          image_url: data.imageUrl,
          userId: user.id,
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
        id: user.id,
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

  public static async EditUser(
    data: z.infer<typeof UserValidation.EDITSCHEMA>,
    email: string,
  ): Promise<ResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (!user) {
      throw new ResponseError(404, "User is not found!");
    }

    await prisma.user.update({
      where: { email: user.email },
      data: {
        username: data.username,
        userDetail: {
          update: {
            birthday: data.birthday || "",
            gender: data.gender,
          },
        },
      },
    });

    return {
      code: 201,
      data: null,
      message: "Successfully edit user!",
      status: "success",
    };
  }

  public static async EditImageUser(
    data: z.infer<typeof UserValidation.EDITIMAGE>,
    email: string,
  ): Promise<ResponsePayload> {
    const isRegist = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (!isRegist) {
      throw new ResponseError(404, "Oops! User is not found!");
    }

    await prisma.userDetail.update({
      where: { userId: isRegist.id },
      data: { image_url: data.imageUrl },
    });

    return {
      status: "success",
      code: 201,
      data: null,
      message: "Success!",
    };
  }
}
