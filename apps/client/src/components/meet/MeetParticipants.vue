<template>
  <div class="p-4 flex flex-col h-full">
    <div class="pb-2 flex flex-col gap-4 border-b">
      <div class="flex items-center justify-between gap-2">
        <p>Participants</p>
        <Users class="size-4" />
      </div>
      <div
        class="flex items-center justify-between text-muted-foreground text-xs"
      >
        <p>{{ participants.length }} in meeting</p>
        <p>5 Agents</p>
      </div>
    </div>

    <ScrollArea class="h-0 grow">
      <ItemGroup>
        <Item
          v-for="item in participants"
          :key="item.identity"
          size="sm"
          class="px-0 py-2"
        >
          <ItemMedia>
            <Avatar>
              <AvatarImage :src="item.metadata?.user?.avatar_url" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{{ item.name }}</ItemTitle>
          </ItemContent>
          <ItemActions> </ItemActions>
        </Item>
      </ItemGroup>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useMeet } from "#/composables/useMeet";
const { allParticipants } = useMeet();

import { ScrollArea } from "#/components/ui/scroll-area";
import {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "#/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";

import { Users } from "lucide-vue-next";

const participants = computed(() => {
  return allParticipants.value.map((p) => {
    return {
      ...p,
      metadata: p.metadata ? JSON.parse(p.metadata) : {},
    };
  });
});
</script>
