<template>
  <div class="h-full flex flex-col gap-2 px-2">
    <h4 class="scroll-m-20 text-xl font-semibold tracking-tight">Meetings</h4>
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
    <ScrollArea class="h-0 grow">
      <ItemGroup class="gap-2">
        <Item v-for="meet in meetings" :key="meet.id" variant="outline">
          <ItemContent>
            <ItemTitle>{{ meet.title }}</ItemTitle>
            <ItemDescription>
              {{ meet?.description || "No description!" }}
            </ItemDescription>
          </ItemContent>
          <ItemActions class="mb-auto">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem> View </DropdownMenuItem>
                <DropdownMenuItem> Edit </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ItemActions>
          <ItemFooter>
            <template v-if="meet.created_at">
              <span>
                {{ formatMeetingDate(meet.created_at) }}
              </span>
            </template>
            <div
              class="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale"
            >
              <Avatar class="size-6">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar class="size-6">
                <AvatarImage
                  src="https://github.com/leerob.png"
                  alt="@leerob"
                />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar class="size-6">
                <AvatarImage
                  src="https://github.com/evilrabbit.png"
                  alt="@evilrabbit"
                />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </div>
          </ItemFooter>
        </Item>
      </ItemGroup>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from "vue";
import { MeetingService } from "#/services/meeting.service";
import type { IMeeting } from "#/types/meeting.types";
import { toast } from "#/utils/toast";
import { formatDate } from "@vueuse/core";

import { ScrollArea } from "#/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";
import { Button } from "#/components/ui/button";
import {
  ItemGroup,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemFooter,
  ItemActions,
} from "#/components/ui/item";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "#/components/ui/dropdown-menu";
import { Search, MoreVertical } from "lucide-vue-next";

const loading = ref(false);
const meetings = shallowRef<IMeeting[]>([]);

onMounted(async () => {
  try {
    loading.value = true;
    const response = await MeetingService.indexMeetings();
    meetings.value = response.data;
  } catch (error) {
    toast.error("Failed to load meetings. Please try again.");
  } finally {
    loading.value = false;
  }
});

function formatMeetingDate(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfLastWeek = new Date(startOfToday);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  if (date >= startOfToday) {
    return `Today ${formatDate(date, "HH:mm")}`;
  }

  if (date >= startOfYesterday) {
    return `Yesterday ${formatDate(date, "HH:mm")}`;
  }

  if (date >= startOfLastWeek) {
    return `${formatDate(date, "dddd HH:mm")}`;
  }

  return formatDate(date, "MMM dd, yyyy HH:mm");
}
</script>
