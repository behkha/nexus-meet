import { MeetingModel } from "#src/models/meetings.model.ts";
import { IMeetingAccessType, type IMeeting } from "#src/types/meeting.types.ts";
import type { IUser } from "#src/types/user.types.ts";
import { AccessToken } from "livekit-server-sdk";
import { nanoid } from "nanoid";
import { sql } from "bun";

export const MeetingService = {
  async getUserMeetings(userId: string) {
    const meetings = await sql<IMeeting[]>`
      SELECT id, title, description, room_name, host_id, access_type, created_at FROM meetings
      WHERE host_id = ${userId}
    `;
    return meetings;
  },
  async createMeeting({
    title,
    description,
    host,
    accessType,
    password,
  }: {
    title: string;
    description?: string;
    host: IUser;
    accessType: IMeetingAccessType;
    password?: string;
  }) {
    const roomName = nanoid(10);
    let passwordHash: string | undefined = undefined;

    if (accessType === IMeetingAccessType.PASSWORD && password) {
      passwordHash = await Bun.password.hash(password);
    }

    const meeting = await MeetingModel.create({
      title,
      description,
      room_name: roomName,
      host_id: host.id,
      access_type: accessType,
      password: passwordHash,
    });

    const token = await this.generateToken(roomName, host, true);
    return { meeting, token };
  },
  async validateJoin(roomName: string, userId: string, password?: string) {
    const meeting = await MeetingModel.findByRoomName(roomName);
    if (!meeting) throw new Error("Meeting not found");

    if (meeting.host_id === userId) return { status: "authorized", meeting }; // Host can always join

    switch (meeting.access_type) {
      case IMeetingAccessType.OPEN:
        return { status: "authorized", meeting };

      case IMeetingAccessType.PASSWORD:
        if (!password) return { status: "password_required" };
        const isMatch = await Bun.password.verify(
          password,
          meeting.password_hash!,
        );
        return isMatch
          ? { status: "authorized", meeting }
          : { status: "invalid_password" };

      case IMeetingAccessType.REQUEST:
        const request = await sql`
          SELECT * FROM meeting_requests 
          WHERE meeting_id = ${meeting.id} AND user_id = ${userId}
        `;
        if (request[0]?.status === "approved")
          return { status: "authorized", meeting };
        return {
          status: "request_required",
          currentStatus: request[0]?.status || "none",
        };

      default:
        throw new Error("Unknown access type");
    }
  },
  async generateToken(roomName: string, user: IUser, isHost: boolean) {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: user.id,
        name: user.full_name || user.email,
        metadata: JSON.stringify({
          user,
        }),
      },
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      roomAdmin: isHost,
    });

    return await at.toJwt();
  },
};
