import { type Request, type Response } from "express";
import * as AuthService from "#src/services/auth.service.ts";
import * as UsersService from "#src/services/users.service.ts";
import type { IUserPayload } from "#src/types/auth.types.ts";
import { generateTokens, verifyRefreshToken } from "#src/utils/token.utils.ts";
import {
  deleteRefreshToken,
  isRefreshTokenValid,
  saveRefreshToken,
} from "#src/stores/auth.store.ts";

export const AuthController = {
  async googleLogin(req: Request, res: Response) {
    const { credential } = req.body;

    try {
      const googleUser = await AuthService.getGooglePayload(credential);
      if (!googleUser || !googleUser.email) throw new Error("Login failed!");

      let user = await UsersService.findByEmail(googleUser.email);
      if (!user) {
        user = await UsersService.upsertGoogleUser(
          googleUser.email,
          googleUser.name || "User",
          googleUser.picture,
          googleUser.sub,
        );
      } else if (!user.google_id) {
        await UsersService.updateGoogleId(user.email, googleUser.sub);
      }

      const userPayload: IUserPayload = {
        id: user?.id!,
        email: user?.email!,
      };
      const { accessToken, refreshToken } = generateTokens(userPayload);
      await saveRefreshToken(refreshToken, user?.id!);

      res.json({
        message: "Login successful!",
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  async refreshToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(401).json({ message: "Refresh token not provided" });
        return;
      }

      const tokenExists = await isRefreshTokenValid(token);
      if (!tokenExists) {
        res
          .status(403)
          .json({ message: "Refresh token is invalid or revoked" });
        return;
      }

      const decoded = verifyRefreshToken(token);
      const payload = {
        id: decoded.id,
        email: decoded.email,
      };

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(payload);

      await deleteRefreshToken(token);
      await saveRefreshToken(newRefreshToken, decoded.id);

      res.status(200).json({
        message: "Token refreshed successfully",
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  },
  async logout(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (token) {
        await deleteRefreshToken(token);
      }

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
