import type { IMeeting } from "./meeting.types";
import type { IUser } from "./user.type";

export enum IMessageSenderType {
  USER = "user",
  AGENT = "agent",
}

export type TextMessage = {
  type: "text";
  text: string;
};

export type FileMessage = {
  type: "file";
  file: {
    url: string;
  };
};

export type IMessageContent = (TextMessage | FileMessage)[];

export interface INewMessagePayload {
  content: IMessageContent;
  meetingId: IMeeting["id"];
  recipientId?: IUser["id"];
}

export interface IMessage {
  id: string;
  content: IMessageContent;
  meeting_id: IMeeting["id"];
  recipient_id: IUser["id"] | null;
  sender_id: IUser["id"];
  sender_type: IMessageSenderType;
  created_at: string;
  sender_user: Partial<IUser> | null;
  recipient_user: Partial<IUser> | null;
}
