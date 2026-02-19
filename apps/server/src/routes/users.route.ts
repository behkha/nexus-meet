import { Router } from "express";
import { authenticate } from "#src/middlewares/auth.middleware.ts";
import { UserController } from "#src/controllers/users.controller.ts";

const router = Router();

router.get("/me", authenticate, UserController.getProfile);

export default router;
