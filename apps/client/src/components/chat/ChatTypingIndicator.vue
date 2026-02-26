<template>
  <div class="h-6">
    <Transition name="slide">
      <div
        v-if="indicatorText"
        class="text-[10px] italic flex items-center gap-2"
      >
        {{ indicatorText }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useMeet } from "#/composables/useMeet";
const { participants } = useMeet();

import { useChat } from "#/composables/useChat";
const { typingUsers } = useChat();

const typingNames = computed(() => {
  return Array.from(typingUsers.keys())
    .map(
      (id) =>
        participants.value.find((p) => p.identity === id)?.name || "Someone",
    )
    .filter(Boolean);
});

const indicatorText = computed(() => {
  const names = typingNames.value;
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others are typing...`;
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
