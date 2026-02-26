import type { IMeeting } from "./meeting.types.ts";
import type { IUser } from "./user.types.ts";

export interface IMessage {
  id: string;
  meeting_id: IMeeting["id"];
  sender_id: string;
  sender_type: IMessageSenderType;
  recipient_id: string | null;
  content: object[];
  created_at: string;
}

export enum IMessageSenderType {
  USER = "user",
  AGENT = "agent",
}

export interface ICreateMessagePayload {
  meeting_id: IMessage["meeting_id"];
  sender_id: IUser["id"];
  sender_type: IMessage["sender_type"];
  recipient_id: IMessage["recipient_id"];
  content: IMessage["content"];
}
