<template>
  <div class="relative rounded-xl overflow-hidden border">
    <template v-if="!isCameraEnabled">
      <img
        class="size-full blur-[100px] object-cover"
        :src="metadata?.user?.avatar_url"
        no-cache
      />
      <img
        class="absolute inset-0 rounded-full m-auto size-32 border"
        :src="metadata?.user?.avatar_url"
        no-cache
      />
    </template>
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      autoplay
      playsinline
    />
    <audio ref="audioRef" autoplay />
    <Badge class="absolute bottom-2 left-2 text-base">
      {{ isLocal ? "You" : participant.name || participant.identity }}
    </Badge>
    <div
      class="absolute top-2 right-2 p-2 rounded-full flex items-center justify-center"
      :class="[isMicEnabled ? 'bg-primary/90' : 'bg-gray-500']"
    >
      <component :is="isMicEnabled ? Mic : MicOff" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { type LocalParticipant, RemoteParticipant, Track } from "livekit-client";

import { Badge } from "#/components/ui/badge";
import { Mic, MicOff } from "lucide-vue-next";

import { useParticipant } from "#/composables/useParticipant";

const props = defineProps<{
  participant: LocalParticipant | RemoteParticipant;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const isMicEnabled = ref(props.participant.isMicrophoneEnabled);
const isCameraEnabled = ref(props.participant.isCameraEnabled);

const {
  isLocal,
  metadata,
  participantTrackPublicationListeners,
  participantTrackSubscriptionListeners,
} = useParticipant(props.participant);

function attachTrack(track: Track) {
  if (track.kind === Track.Kind.Video && videoRef.value) {
    track.attach(videoRef.value);
  }

  if (track.kind === Track.Kind.Audio && audioRef.value && !isLocal) {
    track.attach(audioRef.value);
  }
}

function updatePublications() {
  isMicEnabled.value = props.participant.isMicrophoneEnabled;
  isCameraEnabled.value = props.participant.isCameraEnabled;

  props.participant.trackPublications.forEach((pub) => {
    if (pub.track) {
      attachTrack(pub.track);
    }
  });
}

onMounted(() => {
  updatePublications();
  participantTrackPublicationListeners(updatePublications);
  participantTrackSubscriptionListeners(attachTrack);
});

onUnmounted(() => {
  props.participant.removeAllListeners();
});
</script>
