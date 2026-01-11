import type { ResponsePayload } from "../types/index.js";

export default class UserService {
  public static async CreateUser(): Promise<ResponsePayload> {
    return {
      code: 200,
      data: null,
      message: "Success create user!",
      status: "success",
    };
  }
}
