import type { ZodType } from "zod";

export default class Validation {
  static validate<T>(schema: ZodType<T>, data: unknown): T {
    return schema.parse(data);
  }
}
