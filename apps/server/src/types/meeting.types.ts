import type { IUser } from "./user.types.ts";

export interface IMeeting {
  id: string;
  title: string;
  room_name: string;
  host_id: IUser["id"];
  is_active: boolean;
  access_type: IMeetingAccessType;
  password_hash: string | null;
}

export enum IMeetingAccessType {
  OPEN = "open",
  REQUEST = "request",
  PASSWORD = "password",
}

export interface IMeetingRequest {
  id: string;
  meeting_id: IMeeting["id"];
  user_id: IUser["id"];
  status: IMeetingRequestStatus;
}

export enum IMeetingRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
}
