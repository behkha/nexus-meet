import { type Request, type Response } from "express";
import { UserService } from "#src/services/users.service.ts";

export const UserController = {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const user = await UserService.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          avatar: user.avatar_url,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  },
};
