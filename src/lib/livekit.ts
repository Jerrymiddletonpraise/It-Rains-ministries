import "server-only";
import {
  AccessToken, RoomServiceClient, IngressClient, EgressClient, IngressInput, EncodedFileOutput, EncodedFileType, S3Upload,
} from "livekit-server-sdk";
import { env } from "@/lib/env";

const host = () => env.livekitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
export const rooms = () => new RoomServiceClient(host(), env.livekitKey, env.livekitSecret);
export const ingress = () => new IngressClient(host(), env.livekitKey, env.livekitSecret);
export const egress = () => new EgressClient(host(), env.livekitKey, env.livekitSecret);

/** Viewer token: subscribe only, cannot publish media. */
export async function viewerToken(room: string, identity: string, name: string) {
  const at = new AccessToken(env.livekitKey, env.livekitSecret, { identity, name, ttl: "6h" });
  at.addGrant({ room, roomJoin: true, canSubscribe: true, canPublish: false, canPublishData: false, hidden: false });
  return at.toJwt();
}

/** Broadcaster token for authorised pastors / media team. */
export async function publisherToken(room: string, identity: string, name: string) {
  const at = new AccessToken(env.livekitKey, env.livekitSecret, { identity: `host-${identity}`, name, ttl: "8h", metadata: JSON.stringify({ host: true }) });
  at.addGrant({ room, roomJoin: true, canSubscribe: true, canPublish: true, canPublishData: true, roomAdmin: true });
  return at.toJwt();
}

export async function ensureRoom(name: string) {
  await rooms().createRoom({ name, emptyTimeout: 60 * 30, maxParticipants: 0 }).catch(() => null);
}

/** Creates an RTMP ingest endpoint (for OBS, vMix, hardware encoders) that publishes into the room. */
export async function createRtmpIngress(room: string, title: string) {
  const info = await ingress().createIngress(IngressInput.RTMP_INPUT, {
    name: title.slice(0, 60), roomName: room, participantIdentity: `encoder-${room}`, participantName: "IT RAINS Live", enableTranscoding: true,
  });
  return { ingressId: info.ingressId, url: info.url, streamKey: info.streamKey };
}

/** Starts recording the whole room to S3-compatible storage (e.g. Supabase Storage S3 endpoint). */
export async function startRecording(room: string, streamId: string) {
  const s3 = env.recordingS3;
  const output = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath: `streams/${streamId}/{time}.mp4`,
    output: {
      case: "s3",
      value: new S3Upload({ accessKey: s3.accessKey, secret: s3.secret, bucket: s3.bucket, region: s3.region, endpoint: s3.endpoint, forcePathStyle: true }),
    },
  });
  const info = await egress().startRoomCompositeEgress(room, output, { layout: "speaker" });
  return info.egressId;
}

export async function stopRecording(egressId: string) {
  await egress().stopEgress(egressId).catch(() => null);
}

export async function participantCount(room: string) {
  const list = await rooms().listParticipants(room).catch(() => []);
  return list.length;
}
