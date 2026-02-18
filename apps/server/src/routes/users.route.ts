import { Router } from "express";
import { authenticate } from "#src/middlewares/auth.middleware.ts";
import * as UsersController from "#src/controllers/users.controller.ts";

const router = Router();

router.get("/profile", authenticate, UsersController.getProfile);

export default router;
