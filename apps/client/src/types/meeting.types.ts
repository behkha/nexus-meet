export interface IMeeting {
  id: string;
  title: string;
  description: string | null;
  access_type: IMeetingAccessType;
  room_name: string;
  host_id: string;
  created_at: string;
}

export type IMeetingToken = string;

export interface INewMeetingPayload {
  title: string;
  accessType: IMeetingAccessType;
  password?: string;
}

export interface INewMeetingResponse {
  meeting: IMeeting;
  token: IMeetingToken;
}

export enum IMeetingAccessType {
  OPEN = "open",
  REQUEST = "request",
  PASSWORD = "password",
}

export enum IMeetingJoinStatus {
  AUTHORIZED = "authorized",
  PASSWORD_REQUIRED = "password_required",
  INVALID_PASSWORD = "invalid_password",
  REQUEST_REQUIRED = "request_required",
}

export type IMeetingActiveSpeakers = string[]
export type IMeetingCurrentSpeaker = string | null | undefined