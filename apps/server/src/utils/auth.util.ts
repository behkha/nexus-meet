import type { IUser } from "#src/models/user.model.ts";
import jwt from "jsonwebtoken";

export function signToken(userId: IUser["id"], email: IUser["email"]) {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}
