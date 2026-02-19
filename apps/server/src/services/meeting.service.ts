import { MeetingModel } from "#src/models/meeting.model.ts";
import { IMeetingAccessType, type IMeeting } from "#src/types/meeting.types.ts";
import type { IUser } from "#src/types/user.types.ts";
import { AccessToken } from "livekit-server-sdk";
import { nanoid } from "nanoid";
import { sql } from "bun";

export const MeetingService = {
  async createMeeting(
    title: string,
    host: IUser,
    accessType: IMeetingAccessType,
    password?: string,
  ) {
    const roomName = nanoid(10);
    let passwordHash: string | null = null;

    if (accessType === IMeetingAccessType.PASSWORD && password) {
      passwordHash = await Bun.password.hash(password);
    }

    const meeting = await sql<IMeeting[]>`
      INSERT INTO meetings (title, room_name, host_id, access_type, password_hash)
      VALUES (${title}, ${roomName}, ${host.id}, ${accessType}, ${passwordHash})
      RETURNING *;
    `;

    const token = await this.generateToken(
      roomName,
      host.id,
      host.full_name || "Host",
      true,
    );
    return { meeting: meeting[0], token };
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
  async generateToken(
    roomName: string,
    identity: string,
    name: string,
    isAdmin: boolean,
  ) {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity, name },
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      roomAdmin: isAdmin,
    });

    return await at.toJwt();
  },
};
