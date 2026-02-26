<template>
  <InputGroup>
    <InputGroupTextarea
      v-model="text"
      placeholder="Write your message here... (Enter + Shift for new line)"
    />
    <InputGroupAddon align="block-end">
      <InputGroupButton variant="outline" class="rounded-full" size="icon-xs">
        <PlusIcon class="size-4" />
      </InputGroupButton>
      <InputGroupButton
        variant="default"
        class="rounded-full ml-auto"
        size="icon-xs"
        :disabled="!canSubmit || isLoadingMessages || isSendingMessage"
        @click="emits('submit')"
      >
        <template v-if="isSendingMessage">
          <Spinner />
        </template>
        <template v-else>
          <ArrowUpIcon class="size-4" />
          <span class="sr-only">Send</span>
        </template>
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useChat } from "#/composables/useChat";
const { isLoadingMessages, isSendingMessage, sendTypingSignal } = useChat();

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "#/components/ui/input-group";
import { Spinner } from "#/components/ui/spinner";
import type { IMessageContent } from "#/types/message.types";
import { ArrowUpIcon, PlusIcon } from "lucide-vue-next";

const emits = defineEmits(["submit"]);
const modelValue = defineModel<IMessageContent>({
  default: [
    {
      type: "text",
      text: "",
    },
  ],
});

let lastSentTyping = 0;

const text = computed({
  get() {
    return modelValue.value?.find((c) => c.type === "text")?.text ?? "";
  },
  set(newValue: string) {
    handleInput();
    const textContent = modelValue.value?.find((c) => c.type === "text");
    if (textContent) {
      textContent.text = newValue;
    }
  },
});

const files = computed(() => {
  return modelValue.value.filter((c) => c.type === "file");
});

const canSubmit = computed(() => {
  return text.value || files.value.length > 0;
});

function handleInput() {
  const now = Date.now();
  // Throttle: Only send every 1.5 seconds
  if (now - lastSentTyping > 1500) {
    lastSentTyping = now;
    sendTypingSignal();
  }
}
</script>
