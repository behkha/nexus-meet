import { Router } from "express";
import { AuthController } from "#src/controllers/auth.controller.ts";

const router = Router();

router.post("/google", AuthController.googleLogin);
// router.post("/google/callback", googleCallback);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

export default router;
