import { Router } from 'express';
import authRouter from './auth.route.ts';
import usersRouter from './users.route.ts';

const router = Router()

router.use("/auth", authRouter);
router.use("/profile", usersRouter);

export default router;