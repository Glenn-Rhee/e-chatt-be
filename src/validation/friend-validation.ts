import z from "zod";

export default class FriendValidation {
  static readonly ADDFRIEND = z.object({
    receiverId: z.string({ error: "Id of receiver is required!" }),
  });
  static readonly ACTIONFRIEND = z.object({
    userIdTarget: z.string({ error: "Id of receiver is required!" }),
    accept: z.boolean({ error: "Please fill accept properly!" }),
  });
}
