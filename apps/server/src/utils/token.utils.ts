import type { ITokenPair, IUserPayload } from "#src/types/auth.types.ts";
import jwt, { type SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const generateTokens = (payload: IUserPayload): ITokenPair => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  } as SignOptions);

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7D",
  } as SignOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, ACCESS_SECRET) as IUserPayload;
};

export const verifyRefreshToken = (token: string): IUserPayload => {
  return jwt.verify(token, REFRESH_SECRET) as IUserPayload;
};

export const getRemainingSeconds = (exp: number) => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, exp - now);
}