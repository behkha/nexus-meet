import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "#src/utils/token.utils.ts";
import type { IUser } from "#src/models/user.model.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: IUser["id"];
        email: IUser["email"];
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token not provided",
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Access token has expired",
          code: "TOKEN_EXPIRED",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Invalid access token",
        code: "TOKEN_INVALID",
      });
      return;
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};
