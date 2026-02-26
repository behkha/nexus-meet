<template>
  <div
    class="size-full relative flex items-center justify-center bg-black border rounded-3xl"
  >
    <video
      ref="videoRef"
      class="max-w-full max-h-full object-fill"
      autoplay
      playsinline
    />
    <div
      class="absolute flex items-center gap-2 bottom-2 left-2 px-2 pr-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-white"
    >
      <Avatar>
        <AvatarImage :src="metadata?.user?.avatar_url" alt="@radix-vue" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <span class="text-sm font-semibold">{{ participant.name }}'s Screen</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Participant, Track } from "livekit-client";

import { useParticipant } from "#/composables/useParticipant";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";

const props = defineProps<{ participant: Participant }>();
const videoRef = ref<HTMLVideoElement | null>(null);

const {
  metadata,
  participantTrackPublicationListeners,
  participantTrackSubscriptionListeners,
} = useParticipant(props.participant);

const setupScreenTrack = () => {
  const publication = props.participant.getTrackPublication(
    Track.Source.ScreenShare,
  );
  if (publication?.track && videoRef.value) {
    publication.track.attach(videoRef.value);
  }
};

onMounted(() => {
  setupScreenTrack();
  participantTrackPublicationListeners(setupScreenTrack);
  participantTrackSubscriptionListeners(setupScreenTrack);
});
watch(() => props.participant, setupScreenTrack);
</script>
