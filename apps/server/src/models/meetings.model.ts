import type { IMeeting, IMeetingRequest } from "#src/types/meeting.types.ts";
import type { IUser } from "#src/types/user.types.ts";
import { sql } from "bun";

interface ICreateMeetingInput {
  title: string;
  room_name: string;
  host_id: IUser["id"];
  access_type: IMeeting["access_type"];
  description: string | undefined;
  password: string | undefined;
}

export const MeetingModel = {
  async create(data: ICreateMeetingInput) {
    const result = await sql<IMeeting[]>`
    INSERT INTO MEETINGS (${sql(data)})
    RETURNING id, title, description, room_name, host_id, access_type, created_at
  `;
    return result[0];
  },
  async findByRoomName(roomName: string) {
    const result = await sql<
      IMeeting[]
    >`SELECT id, title, description, room_name, host_id, access_type, created_at FROM meetings WHERE room_name = ${roomName} AND is_active = true`;
    return result[0];
  },
  async findById(meetingId: IMeeting["id"]) {
    const result = await sql<IMeeting[]>`
      SELECT id, title, description, room_name, host_id, access_type, created_at FROM meetings WHERE id = ${meetingId} AND is_active = true
    `;
    return result[0];
  },
  async findMeetingRequestById(requestId: IMeetingRequest["id"]) {
    const result = await sql<IMeetingRequest[]>`
      SELECT id, meeting_id, user_id, status FROM meeting_requests WHERE id = ${requestId}
    `;
    return result[0];
  },
};
