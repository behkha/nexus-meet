import { Router } from "express";
import authRouter from "./auth.route.ts";
import usersRouter from "./users.route.ts";
import meetingRouter from "./meeting.route.ts";

const router = Router();

router.use("/auth", authRouter);
router.use("/profile", usersRouter);
router.use("/meetings", meetingRouter);

export default router;
