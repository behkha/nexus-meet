<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRoomStore } from "./stores/room.ts";
import ParticipantTile from "./components/ParticipantTile.vue";

const roomStore = useRoomStore();
const username = ref("");
const roomName = ref("daily-standup");

const join = async () => {
  try {
    // 1. Get Token from Express
    const response = await axios.post("http://localhost:3000/api/join", {
      roomName: roomName.value,
      participantName: username.value,
    });

    // 2. Connect to LiveKit
    // Note: For MVP, hardcode the LiveKit WSS URL or fetch from env
    await roomStore.connectToRoom(
      "wss://quorum-wxb3w85f.livekit.cloud",
      response.data.token,
    );
  } catch (error) {
    alert(error)
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white p-6">
    <div v-if="!roomStore.isConnected" class="max-w-md mx-auto mt-20 space-y-4">
      <h1 class="text-3xl font-bold text-center text-blue-500">Nexus Meet</h1>
      <input
        v-model="username"
        placeholder="Your Name"
        class="w-full p-3 rounded bg-slate-800 border border-slate-700"
      />
      <button
        @click="join"
        class="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold transition"
      >
        Join Meeting
      </button>
    </div>

    <div v-else>
      <header class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Room: {{ roomName }}</h2>
        <button
          @click="roomStore.leaveRoom"
          class="bg-red-600 px-4 py-2 rounded"
        >
          Leave
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-if="roomStore.room?.localParticipant">
          <ParticipantTile :participant="roomStore.room.localParticipant" />
        </div>

        <div v-for="p in roomStore.participants" :key="p.sid">
          <ParticipantTile :participant="p" />
        </div>
      </div>
    </div>
  </div>
</template>
