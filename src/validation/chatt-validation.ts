import z from "zod";

export default class ChattValidation {
  static readonly MESSAGE = z.object({
    targetId: z.string({ error: "Please fill target Id" }),
    message: z.string({ error: "Please fill message content!" }).trim(),
  });

  static readonly DELETECHATT = z.object({
    idConvs: z
      .array(z.string({ error: "Please fill id conversation properly!" }))
      .min(1, { error: "At least one conversations id is required!" }),
  });
}
