import { Router } from "express";
import { MessageController } from "#src/controllers/messages.controller.ts";

const router = Router();

router.get("/", MessageController.index);
router.post("/", MessageController.create);

export default router;