import type {
  IMeeting,
  INewMeetingPayload,
  INewMeetingResponse,
} from "#/types/meeting.types";
import { axiosInstance } from "./index.service";

export const MeetingService = {
  async indexMeetings() {
    return axiosInstance.get<IMeeting[]>("/meetings");
  },
  async createMeet(payload: INewMeetingPayload) {
    return axiosInstance.post<INewMeetingResponse>("/meetings/create", payload);
  },
  async joinMeet(roomName: string, password?: string) {
    return axiosInstance.post("/meetings/join", { roomName, password });
  },
};
