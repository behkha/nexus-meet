<template>
  <div
    class="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700"
  >
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      autoplay
      playsinline
    ></video>
    <audio ref="audioRef" autoplay></audio>

    <div
      class="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-md text-white text-sm font-semibold backdrop-blur-sm"
    >
      {{ participant.identity }}
      <span
        v-if="participant.identity.includes('Agent')"
        class="text-blue-400 ml-1"
        >🤖</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Participant, Track, TrackPublication } from "livekit-client";

const props = defineProps<{
  participant: Participant;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);

const handleTrackSubscription = (track: Track) => {
  if (track.kind === Track.Kind.Video && videoRef.value) {
    track.attach(videoRef.value);
  }
  if (track.kind === Track.Kind.Audio && audioRef.value) {
    track.attach(audioRef.value);
  }
};

onMounted(() => {
  // Check existing tracks
  props.participant.trackPublications.forEach((pub) => {
    if (pub.isSubscribed && pub.track) {
      if (pub.isLocal && pub.track.kind === Track.Kind.Audio) return;
      handleTrackSubscription(pub.track);
    }
  });

  // Listen for future tracks (e.g. if they turn camera on later)
  props.participant.on("trackSubscribed", (track) => {
    handleTrackSubscription(track);
  });
});
</script>
