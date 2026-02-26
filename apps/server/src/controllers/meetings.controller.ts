import { MeetingService } from "#src/services/meetings.service.ts";
import { UserService } from "#src/services/users.service.ts";
import {
  IMeetingAccessType,
  IMeetingRequestStatus,
} from "#src/types/meeting.types.ts";
import { type Request, type Response } from "express";
import { sql } from "bun";
import { MeetingModel } from "#src/models/meetings.model.ts";

export const MeetingController = {
  async index(req: Request, res: Response) {
    const user = await UserService.findById(req.user?.id!);
    const meetings = await MeetingService.getUserMeetings(user?.id!);
    res.json(meetings);
  },
  async create(req: Request, res: Response) {
    const {
      title,
      description,
      accessType = IMeetingAccessType.OPEN,
      password,
    } = req.body;
    const user = await UserService.findById(req.user?.id);

    try {
      const data = await MeetingService.createMeeting({
        title,
        description,
        host: user!,
        accessType,
        password,
      });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  async join(req: Request, res: Response) {
    const { roomName, password } = req.body;
    const user = await UserService.findById(req.user?.id!);

    try {
      const gate = await MeetingService.validateJoin(
        roomName,
        user?.id!,
        password,
      );

      if (gate.status === "authorized") {
        const token = await MeetingService.generateToken(
          roomName,
          user!,
          false,
        );
        return res.json({
          status: gate.status,
          token,
          meeting: gate.meeting,
        });
      }

      return res.json(gate);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  async knock(req: Request, res: Response) {
    const { roomName } = req.body;
    const user = await UserService.findById(req.user?.id!);

    const meeting = await MeetingModel.findByRoomName(roomName);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    await sql`
      INSERT INTO meeting_requests (meeting_id, user_id)
      VALUES (${meeting.id}, ${user?.id})
      ON CONFLICT (meeting_id, user_id) DO UPDATE SET status = '${IMeetingRequestStatus.PENDING}'
    `;

    // TODO: Notify host about the new request using WebSocket or any real-time mechanism

    res.json({
      message: "Request sent",
    });
  },
  async approveJoin(req: Request, res: Response) {
    const { requestId, status } = req.body;
    const user = await UserService.findById(req.user?.id!);

    const meetingRequest = await MeetingModel.findMeetingRequestById(requestId);
    if (!meetingRequest) {
      return res.status(404).json({ error: "Meeting request not found" });
    }

    const meeting = await MeetingModel.findById(meetingRequest.meeting_id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (meeting.host_id !== user?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedMeetingRequest = await sql`
      UPDATE meeting_requests mr
      SET status = ${status}
      FROM meetings m
      WHERE mr.id = ${requestId} AND mr.meeting_id = m.id
      RETURNING mr.user_id
    `;

    if (updatedMeetingRequest.length === 0) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({
      message: `User has been ${status}`,
    });
  },
};
