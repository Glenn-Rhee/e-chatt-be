import z from "zod";

export default class UserValidation {
  static readonly CREATEUSER = z.object({
    email: z.email({ error: "Please fill email properly!" }),
    username: z
      .string({ error: "Please fill username properly!" })
      .min(1, { error: "Minimum length of username is 1" }),
    imageUrl: z.url({ error: "Please fill image url properly!" }),
  });
}
