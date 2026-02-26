import { reactive, ref } from "vue";
import { toast } from "#/utils/toast";
import { useMeet } from "./useMeet";
import type { IMessage, INewMessagePayload } from "#/types/message.types";
import { MessagesService } from "#/services/messages.service";

const messages = ref<IMessage[]>([]);
const isLoadingMessages = ref(false);
const isSendingMessage = ref(false);
const typingUsers = reactive<Map<string, number>>(new Map());

export function useChat() {
  const { meeting, room } = useMeet();

  async function fetchMessages() {
    if (!meeting.value) return;

    try {
      isLoadingMessages.value = true;
      const response = await MessagesService.getMessages(meeting.value.id);
      const { data } = response.data;
      messages.value = data;
    } catch (error) {
      toast.error("Failed to load messages!");
    } finally {
      isLoadingMessages.value = false;
    }
  }

  async function sendMessage(payload: INewMessagePayload) {
    if (!room.value) return;

    isSendingMessage.value = true;
    try {
      const response = await MessagesService.sendMessage(payload);
      const { message } = response.data;
      messages.value.push(message);

      const encoder = new TextEncoder();
      const data = {
        type: "CHAT_MESSAGE",
        data: message,
      };
      await room.value.localParticipant.publishData(
        encoder.encode(JSON.stringify(data)),
        { reliable: true },
      );
    } catch (error) {
      toast.error("Failed to send message!");
    } finally {
      isSendingMessage.value = false;
    }
  }

  function receiveMessage(message: IMessage) {
    messages.value.push(message);
  }

  function setTyping(identity: string) {
    typingUsers.set(identity, Date.now());
  }

  function sendTypingSignal() {
    if (!room.value) return;

    const payload = JSON.stringify({ type: "TYPING" });
    const data = new TextEncoder().encode(payload);
    room.value.localParticipant.publishData(data, { reliable: false });
  }

  setInterval(() => {
    const now = Date.now();
    for (const [id, timestamp] of typingUsers.entries()) {
      if (now - timestamp > 3000) {
        typingUsers.delete(id);
      }
    }
  }, 1000);

  return {
    isLoadingMessages,
    isSendingMessage,
    messages,
    typingUsers,
    setTyping,
    sendTypingSignal,
    fetchMessages,
    sendMessage,
    receiveMessage,
  };
}
