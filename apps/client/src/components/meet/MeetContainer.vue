<template>
  <div class="h-screen flex flex-col">
    <div class="grow flex overflow-hidden">
      <div class="w-64 xl:w-96 border-r bg-sidebar">
        <MeetParticipants />
      </div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div class="flex items-center justify-center w-full p-4 h-full">
            <template v-if="screenShareParticipant">
              <ScreenShareTile
                :participant="
                  screenShareParticipant as LocalParticipant | RemoteParticipant
                "
              />
            </template>
            <template v-else>
              <div
                :class="[
                  'grid grid-flow-col gap-4 w-full h-full transition-all duration-500 ease-in-out',
                ]"
              >
                <MeetParticipantTile
                  v-for="p in visibleParticipants"
                  :key="p?.sid ?? 'local'"
                  :participant="p as LocalParticipant | RemoteParticipant"
                  class="w-full h-full"
                />
              </div>
            </template>
          </div>
        </ResizablePanel>
        <ResizableHandle with-handle />
        <ResizablePanel :default-size="20" :min-size="20" :max-size="50">
          <div class="p-4 bg-sidebar h-full flex flex-col">
            <Tabs default-value="artifacts" class="grow">
              <TabsList class="w-full">
                <TabsTrigger value="artifacts">
                  <Pyramid />
                  Artifacts
                </TabsTrigger>
                <TabsTrigger value="chat">
                  <MessageSquareMore />
                  Chat
                </TabsTrigger>
              </TabsList>
              <TabsContent value="artifacts" class="h-full">
                Make changes to your account here.
              </TabsContent>
              <TabsContent value="chat" class="h-full">
                <MeetChat />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
    <div class="h-16 flex items-center px-4 border-t shrink-0">
      <p>{{ meeting?.title }}</p>
      <div class="flex items-center justify-center mx-auto gap-2">
        <Button
          size="icon-lg"
          :variant="isMicEnabled ? 'default' : 'outline'"
          @click="toggleMic"
        >
          <component :is="isMicEnabled ? Mic : MicOff" />
        </Button>
        <Button
          size="icon-lg"
          :variant="isCameraEnabled ? 'default' : 'outline'"
          @click="toggleCamera"
        >
          <component :is="isCameraEnabled ? Video : VideoOff" />
        </Button>
        <Button
          size="icon-lg"
          :variant="isScreenShareEnabled ? 'default' : 'outline'"
          @click="toggleScreenShare"
        >
          <component
            :is="isScreenShareEnabled ? ScreenShare : ScreenShareOff"
          />
        </Button>
        <!-- <Button size="icon-lg">
          <Hand />
        </Button>
        <Button size="icon-lg">
          <MoreVertical />
        </Button> -->
        <Button class="min-w-22 h-10" variant="destructive" @click="leaveMeet">
          <Phone />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { toast } from "#/utils/toast";
import { useColorMode } from "@vueuse/core";
const colorMode = useColorMode();

import MeetParticipants from "./MeetParticipants.vue";
import ScreenShareTile from "./ScreenShareTile.vue";
import MeetParticipantTile from "./MeetParticipantTile.vue";
import MeetChat from "./MeetChat.vue";

import { useRoute } from "vue-router";
const route = useRoute();

import { useMeet } from "#/composables/useMeet";
const {
  meeting,
  visibleParticipants,
  isMicEnabled,
  isCameraEnabled,
  isScreenShareEnabled,
  screenShareParticipant,
  joinMeet,
  leaveMeet,
  toggleMic,
  toggleCamera,
  toggleScreenShare,
} = useMeet();

import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "#/components/ui/resizable";

import {
  Mic,
  Video,
  VideoOff,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  MoreVertical,
  Phone,
  Hand,
  MessageSquareMore,
  Pyramid,
} from "lucide-vue-next";
import type { LocalParticipant, RemoteParticipant } from "livekit-client";

const roomName = route.params.roomName as string;

const gridConfig = computed(() => {
  const count = visibleParticipants.value.length;
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 9) return "grid-cols-2 lg:grid-cols-2";
  return "grid-cols-2 lg:grid-cols-4";
});

onMounted(() => {
  if (!roomName) {
    toast.error("Room name is required to join a meeting.");
    return;
  }

  joinMeet(roomName);
});
</script>
