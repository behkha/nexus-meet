import { MeetingController } from "#src/controllers/meeting.controller.ts";
import { authenticate } from "#src/middlewares/auth.middleware.ts";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, MeetingController.index);
router.post("/create", authenticate, MeetingController.create);
router.post("/join", authenticate, MeetingController.join);
router.post("/join/knock", authenticate, MeetingController.knock);
router.post("/join/approve", authenticate, MeetingController.approveJoin);

export default router;
