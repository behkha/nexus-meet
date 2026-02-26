import {
  IMessageSenderType,
  type ICreateMessagePayload,
} from "#src/types/message.types.ts";
import type { Request, Response } from "express";
import { MessagesModel } from "#src/models/messages.model.ts";
import type { IMeeting } from "#src/types/meeting.types.ts";

export const MessageController = {
  async index(req: Request, res: Response) {
    const { meeting_id } = req.query;
    const user = req.user;
    const messages = await MessagesModel.getMeetingMessages(
      meeting_id as IMeeting["id"],
      user.id,
    );
    return res.json({
      status: "success",
      data: messages,
    });
  },
  async create(req: Request, res: Response) {
    try {
      const { content, meeting_id, recipient_id = null } = req.body;
      const user = req.user;

      const payload: ICreateMessagePayload = {
        sender_id: user.id,
        sender_type: IMessageSenderType.USER,
        content,
        meeting_id,
        recipient_id,
      };

      const message = await MessagesModel.create(payload);
      if (!message) throw new Error("Failed to create message");

      const populatedMessage = await MessagesModel.getMessageWithUsers(
        message.id,
      );

      return res.json({
        status: "success",
        message: populatedMessage,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "",
      });
    }
  },
};
