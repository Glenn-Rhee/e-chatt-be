import z from "zod";

export default class ChattValidation {
  static readonly MESSAGE = z.object({
    targetId: z.string({ error: "Please fill target Id" }),
    message: z.string({ error: "Please fill message content!" }).trim(),
  });
}
