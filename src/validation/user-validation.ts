import z from "zod";

export default class UserValidation {
  static readonly CREATEUSER = z.object({
    email: z.email({ error: "Please fill email properly!" }),
    username: z
      .string({ error: "Please fill username properly!" })
      .min(1, { error: "Minimum length of username is 1" }),
    imageUrl: z.url({ error: "Please fill image url properly!" }),
  });

  static readonly EDITSCHEMA = z.object({
    username: z.string({ error: "Please fill username properly!" }),
    gender: z.enum(["UNKNOWN", "MALE", "FEMALE"], {
      error: "Please fill gender just between Unknwon, Male, and Female",
    }),
    birthday: z.date({ error: "Please fill birthday properly!" }).optional(),
  });

  static readonly EDITIMAGE = z.object({
    imageUrl: z.url({ error: "Please fill image url properly!" }),
  });
}
