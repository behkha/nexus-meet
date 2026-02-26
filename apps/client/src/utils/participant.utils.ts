import type {
  LocalParticipant,
  Participant,
  RemoteParticipant,
} from "livekit-client";

export function getParticipantMetadata(
  participant: Participant | LocalParticipant | RemoteParticipant,
) {
  if (!participant) return {};
  try {
    return participant.metadata ? JSON.parse(participant.metadata) : {};
  } catch (error) {
    return {};
  }
}
