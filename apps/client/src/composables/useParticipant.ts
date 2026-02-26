import { computed, ref, toValue, watchEffect } from "vue";
import {
  LocalParticipant,
  ParticipantEvent,
  RemoteTrack,
  RemoteTrackPublication,
  TrackPublication,
  type Participant,
  type RemoteParticipant,
} from "livekit-client";
import { getParticipantMetadata } from "#/utils/participant.utils";

export function useParticipant(
  p: Participant | LocalParticipant | RemoteParticipant,
) {
  const participant = ref<
    Participant | LocalParticipant | RemoteParticipant | null
  >(null);
  const isLocal = ref(false);

  const metadata = computed(() => {
    return getParticipantMetadata(
      participant.value as LocalParticipant | RemoteParticipant,
    );
  });

  watchEffect(() => {
    participant.value = toValue(p);
    isLocal.value = participant.value instanceof LocalParticipant;
  });

  function participantTrackPublicationListeners(
    callback: (publication: TrackPublication) => void,
  ) {
    if (!participant.value) return;
    participant.value.on(ParticipantEvent.TrackMuted, callback);
    participant.value.on(ParticipantEvent.TrackUnmuted, callback);
    participant.value.on(ParticipantEvent.TrackPublished, callback);
    participant.value.on(ParticipantEvent.TrackUnpublished, callback);
    participant.value.on(ParticipantEvent.LocalTrackPublished, callback);
    participant.value.on(ParticipantEvent.LocalTrackSubscribed, callback);
    participant.value.on(ParticipantEvent.LocalTrackUnpublished, callback);
  }

  function participantTrackSubscriptionListeners(
    callback: (track: RemoteTrack, publication: RemoteTrackPublication) => void,
  ) {
    if (!participant.value) return;
    participant.value.on(ParticipantEvent.TrackSubscribed, callback);
  }

  return {
    isLocal,
    metadata,
    participantTrackPublicationListeners,
    participantTrackSubscriptionListeners,
  };
}
