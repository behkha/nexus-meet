import { sql } from "bun";
import type {
  ICreateMessagePayload,
  IMessage,
} from "#src/types/message.types.ts";
import type { IMeeting } from "#src/types/meeting.types.ts";
import type { IUser } from "#src/types/user.types.ts";

export const MessagesModel = {
  async create(payload: ICreateMessagePayload): Promise<IMessage | null> {
    const messages = await sql<IMessage[]>`
      INSERT INTO messages ${sql(payload)}
      RETURNING *
    `;
    return messages[0] ?? null;
  },
  async getMeetingMessages(meetingId: IMeeting["id"], userId: IUser["id"]) {
    return await sql<IMessage[]>`
    SELECT 
      m.*,
      jsonb_build_object(
        'id', u_s.id,
        'name', u_s.full_name,
        'avatar', u_s.avatar_url
      ) AS sender_user,
      CASE 
        WHEN m.recipient_id IS NOT NULL THEN 
          jsonb_build_object(
            'id', u_r.id,
            'name', u_r.full_name,
            'avatar', u_r.avatar_url
          )
        ELSE NULL 
      END AS recipient_user
    FROM messages m
    INNER JOIN users u_s ON m.sender_id = u_s.id
    LEFT JOIN users u_r ON m.recipient_id = u_r.id
    WHERE m.meeting_id = ${meetingId} 
      AND (
        m.recipient_id IS NULL          
        OR m.recipient_id = ${userId}    
        OR m.sender_id = ${userId} 
      )
    ORDER BY m.created_at ASC
  `;
  },
  async getMessageWithUsers(messageId: string) {
    const result = await sql`
    SELECT 
      m.*,
      jsonb_build_object('id', u_s.id, 'name', u_s.full_name, 'avatar', u_s.avatar_url) AS sender_user,
      CASE 
        WHEN m.recipient_id IS NOT NULL THEN 
          jsonb_build_object('id', u_r.id, 'name', u_r.full_name, 'avatar', u_r.avatar_url)
        ELSE NULL 
      END AS recipient_user
    FROM messages m
    INNER JOIN users u_s ON m.sender_id = u_s.id
    LEFT JOIN users u_r ON m.recipient_id = u_r.id
    WHERE m.id = ${messageId}
  `;
    return result[0];
  },
};
