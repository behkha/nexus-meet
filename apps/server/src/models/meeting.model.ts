import type { IMeeting, IMeetingRequest } from "#src/types/meeting.types.ts";
import type { IUser } from "#src/types/user.types.ts";
import { sql } from "bun";

export const MeetingModel = {
  async create(title: string, roomName: string, hostId: IUser["id"]) {
    const result = await sql<IMeeting[]>`
    INSERT INTO MEETINGS (title, room_name, host_id)
    VALUES (${title}, ${roomName}, ${hostId})
    RETURNING *
  `;
    return result[0];
  },
  async findByRoomName(roomName: string) {
    const result = await sql<
      IMeeting[]
    >`SELECT * FROM meetings WHERE room_name = ${roomName} AND is_active = true`;
    return result[0];
  },
  async findById(meetingId: IMeeting["id"]) {
    const result = await sql<IMeeting[]>`
      SELECT * FROM meetings WHERE id = ${meetingId} AND is_active = true
    `;
    return result[0];
  },
  async findMeetingRequestById(requestId: IMeetingRequest["id"]) {
    const result = await sql<IMeetingRequest[]>`
      SELECT * FROM meeting_requests WHERE id = ${requestId}
    `;
    return result[0];
  },
};
