import type { IMeeting } from "#/types/meeting.types";
import type { IMessage, INewMessagePayload } from "#/types/message.types";
import { axiosInstance } from "./index.service";

export const MessagesService = {
  async getMessages(meetingId: IMeeting["id"]) {
    return axiosInstance.get<{ data: IMessage[] }>("/messages", {
      params: {
        meeting_id: meetingId,
      },
    });
  },
  async sendMessage(payload: INewMessagePayload) {
    return axiosInstance.post<{ message: IMessage }>("/messages", {
      content: payload.content,
      meeting_id: payload.meetingId,
      recipient_id: payload.recipientId,
    });
  },
};
