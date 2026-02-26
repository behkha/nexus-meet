import { computed, ref, shallowRef } from "vue";
import { MeetingService } from "#/services/meeting.service";
import { toast } from "#/utils/toast";
import {
  IMeetingJoinStatus,
  type IMeeting,
  type IMeetingActiveSpeakers,
  type IMeetingCurrentSpeaker,
} from "#/types/meeting.types";
import {
  Room,
  RoomEvent,
  Participant,
  RemoteParticipant,
  VideoPresets,
} from "livekit-client";
import { useChat } from "./useChat";

const isJoining = ref(false);
const joinMeetStatus = ref<IMeetingJoinStatus | null>(null);
const meeting = ref<IMeeting | null>(null);
const token = ref<string | null>(null);
const room = shallowRef<Room | null>(null);
const isConnected = ref(false);
const participants = ref<RemoteParticipant[]>([]);
const activeSpeakerIds = ref<IMeetingActiveSpeakers>([]);
const currentSpeakerId = ref<IMeetingCurrentSpeaker>(null);
const isMicEnabled = ref(true);
const isCameraEnabled = ref(false);
const isScreenShareEnabled = ref(false);

export function useMeet() {
  const allParticipants = computed(() => {
    if (!room.value) return [];

    const local = room.value.localParticipant;
    const remotes = participants.value;

    return [local, ...remotes];
  });

  const visibleParticipants = computed(() => {
    if (!room.value) return [];

    const local = room.value.localParticipant;
    const remote = participants.value;

    const topRemotes = remote
      .filter((p) => activeSpeakerIds.value.includes(p.identity))
      .sort((a, b) => {
        return (
          activeSpeakerIds.value.indexOf(a.identity) -
          activeSpeakerIds.value.indexOf(b.identity)
        );
      });

    const others = remote.filter(
      (p) => !activeSpeakerIds.value.includes(p.identity),
    );
    const combinedRemotes = [...topRemotes, ...others];

    return [local, ...combinedRemotes];
  });

  const screenShareParticipant = computed(() => {
    if (!room.value) return;

    if (isScreenShareEnabled.value) {
      return room.value.localParticipant;
    }

    return participants.value.find((p) => p.isScreenShareEnabled);
  });

  async function joinMeet(roomName: string, password?: string) {
    if (isJoining.value) return;

    isJoining.value = true;
    try {
      const { data } = await MeetingService.joinMeet(roomName, password);
      joinMeetStatus.value = data.status;
      if (joinMeetStatus.value === IMeetingJoinStatus.AUTHORIZED) {
        meeting.value = data.meeting;
        token.value = data.token;
        if (token.value) joinRoom(token.value);
      }
    } catch (error) {
      toast.error("Failed to join meeting", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      isJoining.value = false;
    }
  }

  async function leaveMeet() {
    if (room.value) {
      await room.value.disconnect();
      room.value = null;
      isConnected.value = false;
      participants.value = [];
      meeting.value = null;
      token.value = null;
      toast.success("Left the meeting");
    }
  }

  async function joinRoom(token: string) {
    try {
      room.value = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h1080,
        },
      });

      room.value.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        if (speakers.length > 0) {
          currentSpeakerId.value = speakers[0]?.identity;
          updateRecencyQueue(speakers);
        }
      });
      room.value.on(RoomEvent.ParticipantConnected, syncParticipants);
      room.value.on(RoomEvent.ParticipantDisconnected, syncParticipants);
      room.value.on(RoomEvent.TrackSubscribed, syncParticipants);
      room.value.on(RoomEvent.DataReceived, (payload, participant) => {
        if (!participant) return;
        try {
          const parsed = JSON.parse(new TextDecoder().decode(payload));
          switch (parsed.type) {
            case "CHAT_MESSAGE": {
              const { receiveMessage } = useChat();
              receiveMessage(parsed.data);
              break;
            }
            case "TYPING": {
              const { setTyping } = useChat();
              setTyping(participant.identity);
            }
          }
        } catch (error) {}
      });

      // await room.value.connect("wss://quorum-wxb3w85f.livekit.cloud", token);
      await room.value.connect("ws://localhost:7880", token);
      await room.value.localParticipant.setMicrophoneEnabled(
        isMicEnabled.value,
      );

      isConnected.value = true;
      syncParticipants();
    } catch (error) {
      toast.error("Failed to connect to meeting", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  function syncParticipants() {
    if (!room.value) return;
    participants.value = Array.from(room.value.remoteParticipants.values());
  }

  function updateRecencyQueue(speakers: Participant[]) {
    let newQueue = [...activeSpeakerIds.value];

    speakers.forEach((speaker) => {
      newQueue = newQueue.filter((id) => id !== speaker.identity);
      newQueue.unshift(speaker.identity);
    });

    activeSpeakerIds.value = newQueue.slice(0, 20);
  }

  async function toggleMic() {
    if (!room.value) return;
    const local = room.value.localParticipant;

    isMicEnabled.value = !isMicEnabled.value;
    await local.setMicrophoneEnabled(isMicEnabled.value);
  }

  async function toggleCamera() {
    if (!room.value) return;
    const local = room.value.localParticipant;

    isCameraEnabled.value = !isCameraEnabled.value;
    await local.setCameraEnabled(isCameraEnabled.value);
  }

  async function toggleScreenShare() {
    if (!room.value) return;
    const local = room.value.localParticipant;

    try {
      isScreenShareEnabled.value = !isScreenShareEnabled.value;
      await local.setScreenShareEnabled(isScreenShareEnabled.value);
    } catch (error) {
      isScreenShareEnabled.value = false;
      toast.error("Screen share failed!");
    }
  }

  return {
    isJoining,
    joinMeetStatus,
    room,
    meeting,
    participants,
    allParticipants,
    visibleParticipants,
    activeSpeakerIds,
    currentSpeakerId,
    isMicEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    screenShareParticipant,
    joinMeet,
    leaveMeet,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
