import { Router } from "express";
import authRouter from "./auth.route.ts";
import usersRouter from "./users.route.ts";
import meetingRouter from "./meeting.route.ts";
import messagesRouter from "./messages.route.ts";
import { authenticate } from "#src/middlewares/auth.middleware.ts";

const router = Router();

router.use("/auth", authRouter);

router.use(authenticate);

router.use("/profile", usersRouter);
router.use("/meetings", meetingRouter);
router.use("/messages", messagesRouter);

export default router;
