import jwt from "jsonwebtoken";

export default class JWT {
  static signin(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "30d",
    });
  }

  static verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  }
}
