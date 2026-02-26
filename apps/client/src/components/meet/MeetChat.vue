<template>
  <div class="h-full flex flex-col">
    <ScrollArea ref="scrollAreaRef" class="h-0 grow">
      <div class="space-y-6">
        <ChatBubble v-for="item in messages" :key="item.id" :message="item" />
      </div>
    </ScrollArea>
    <div class="relative">
      <Transition name="fade-up">
        <Button
          v-if="showNewMessageButton"
          @click="scrollToBottom('smooth')"
          class="absolute -top-2 -translate-y-full left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-900/40 border border-blue-400/20 transition-all active:scale-95"
        >
          <ChevronDown class="w-4 h-4" />
          New Messages
        </Button>
      </Transition>
      <ChatTypingIndicator />
      <ChatInput v-model="messageContent" @submit="handleSendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  useTemplateRef,
  nextTick,
  watch,
  onUnmounted,
} from "vue";
import type { IMessageContent } from "#/types/message.types";

import { useMeet } from "#/composables/useMeet";
const { meeting, room } = useMeet();

import { useChat } from "#/composables/useChat";
const { messages, fetchMessages, sendMessage } = useChat();

import ChatBubble from "#/components/chat/ChatBubble.vue";
import ChatTypingIndicator from "#/components/chat/ChatTypingIndicator.vue";
import ChatInput from "#/components/chat/ChatInput.vue";

import { ScrollArea } from "#/components/ui/scroll-area";

import { Button } from "#/components/ui/button";
import { ChevronDown } from "lucide-vue-next";

const scrollAreaRef = useTemplateRef("scrollAreaRef");
let viewportElement: HTMLElement | null = null;
const showNewMessageButton = ref(false);
const isUserScrolledUp = ref(false);
const messageContent = ref<IMessageContent>([
  {
    type: "text",
    text: "",
  },
]);

watch(
  () => messages.value.length,
  () => {
    const lastMessage = messages.value[messages.value.length - 1];
    const isLastMessageLocal =
      room.value?.localParticipant.identity === lastMessage?.sender_id;

    if (isUserScrolledUp.value && !isLastMessageLocal) {
      showNewMessageButton.value = true;
    } else {
      scrollToBottom("smooth");
    }
  },
);

onMounted(async () => {
  await nextTick();
  attachScrollListener();
  await fetchMessages();
  scrollToBottom("auto");
});

onUnmounted(() => {
  if (viewportElement) {
    viewportElement.removeEventListener("scroll", handleScroll);
  }
});

function getViewPort() {
  return scrollAreaRef.value?.$el.querySelector(
    "[data-reka-scroll-area-viewport]",
  );
}

function handleScroll(event: Event) {
  const viewport = event.target as HTMLElement;
  const bottomThreshold = 100;

  const distanceToBottom =
    viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
  isUserScrolledUp.value = distanceToBottom > bottomThreshold;

  if (!isUserScrolledUp.value) {
    showNewMessageButton.value = false;
  }
}

function attachScrollListener() {
  viewportElement = getViewPort();
  if (viewportElement) {
    viewportElement.addEventListener("scroll", handleScroll);
  }
}

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  const viewport = getViewPort();
  if (viewport) {
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    });
    showNewMessageButton.value = false;
  }
}

async function handleSendMessage() {
  if (!meeting.value) return;
  await sendMessage({
    content: messageContent.value,
    meetingId: meeting.value?.id,
  });
  scrollToBottom();
  messageContent.value = [
    {
      type: "text",
      text: "",
    },
  ];
}
</script>
