import { ref, markRaw } from 'vue';
import { defineStore } from 'pinia';
import { Room, RoomEvent, VideoPresets } from 'livekit-client'

export const useRoomStore = defineStore('room', () => {
  const room = ref<Room | null>(null);
  const isConnected = ref(false);
  const participants = ref<any[]>([]);

  async function connectToRoom(url: string, token: string) {
    try {
      const videoRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution
        }
      });

      room.value = markRaw(videoRoom);

      room.value.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`Participant joined:`, participant.identity);
        updateParticipants()
      })

      room.value.on(RoomEvent.ParticipantDisconnected, () => {
        updateParticipants()
      });

      room.value.on(RoomEvent.TrackSubscribed, () => {
        updateParticipants();
      })

      await room.value.connect(url, token);
      console.log('Connected to Room!');

      await room.value.localParticipant.enableCameraAndMicrophone();

      isConnected.value = true;
      updateParticipants()

    } catch (error) {
      console.error('Failed to connect', error);
    }
  }

  async function leaveRoom() {
    await room.value?.disconnect();
    isConnected.value = false;
    participants.value = []
  }

  function updateParticipants() {
    if (!room.value) return;
    participants.value = Array.from(room.value.remoteParticipants.values());
  }

  return {
    room,
    isConnected,
    participants,
    connectToRoom,
    leaveRoom
  }
})