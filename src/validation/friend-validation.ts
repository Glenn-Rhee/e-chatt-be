import z from "zod";

export default class FriendValidation {
  static readonly ADDFRIEND = z.object({
    receiverId: z.string({ error: "Id of receiver is required!" }),
  });
}
