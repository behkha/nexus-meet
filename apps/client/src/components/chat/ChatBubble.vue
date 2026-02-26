<template>
  <div
    :class="['flex gap-2 last:mb-4', isLocal ? 'flex-row-reverse' : 'flex-row']"
  >
    <Avatar v-if="!isLocal">
      <AvatarImage :src="message.sender_user?.avatar || ''" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>

    <div
      :class="[
        'flex flex-col max-w-[75%]',
        isLocal ? 'items-end' : 'items-start',
      ]"
    >
      <div
        :class="[
          'px-3 py-2 rounded-2xl text-sm wrap-break-word shadow-sm',
          isLocal
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-slate-800 text-slate-200 rounded-tl-none',
        ]"
      >
        <div v-if="!isLocal" class="text-xs mb-1">
          {{ message.sender_user?.name }}
        </div>
        <div v-for="(content, index) in message.content" :key="index">
          <p v-if="content.type === 'text'" class="text-sm">
            {{ content.text }}
          </p>
        </div>
        <div class="flex mt-1" :class="[isLocal ? '' : 'justify-end']">
          <span class="text-[10px]">
            {{ formatDate(new Date(message.created_at), "hh:mm") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IMessage } from "#/types/message.types";
import { formatDate } from "@vueuse/core";

import { useMeet } from "#/composables/useMeet";
const { room } = useMeet();

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";

const props = defineProps<{
  message: IMessage;
}>();

const isLocal = computed(() => {
  return room.value?.localParticipant.identity === props.message.sender_id;
});
</script>
