import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from 'react-native-webrtc';
import { supabase } from './supabase';

export type SharePhase = 'idle' | 'requesting' | 'waiting' | 'connected' | 'stopping' | 'error';

interface ScreenShareRow {
  id: string;
  device_id: string;
  status: 'offered' | 'connected' | 'stopped' | 'failed';
  offer: { type: 'offer'; sdp: string };
  answer: { type: 'answer'; sdp: string } | null;
  created_at: string;
}

const optionalTurnUrl = (process.env.EXPO_PUBLIC_TURN_URL || '').trim();
const optionalTurnUsername = (process.env.EXPO_PUBLIC_TURN_USERNAME || '').trim();
const optionalTurnCredential = (process.env.EXPO_PUBLIC_TURN_CREDENTIAL || '').trim();

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(optionalTurnUrl
    ? [{ urls: optionalTurnUrl, username: optionalTurnUsername, credential: optionalTurnCredential }]
    : []),
];

function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 8000): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      (pc as any).onicegatheringstatechange = null;
      resolve();
    };
    const check = () => {
      if (pc.iceGatheringState === 'complete') finish();
    };
    const timer = setTimeout(finish, timeoutMs);
    (pc as any).onicegatheringstatechange = check;
  });
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useScreenBroadcaster(deviceId: string | null) {
  const [phase, setPhase] = useState<SharePhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const release = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  const stop = useCallback(async () => {
    setPhase('stopping');
    const sessionId = sessionIdRef.current;
    release();
    sessionIdRef.current = null;
    if (sessionId) {
      await supabase
        .from('screen_share_sessions')
        .update({ status: 'stopped', updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
    setPhase('idle');
  }, [release]);

  const start = useCallback(async () => {
    if (!deviceId || (phase !== 'idle' && phase !== 'error')) return;
    setError(null);
    setPhase('requesting');
    try {
      // Android shows its own non-bypassable consent dialog here. The package's
      // foreground MediaProjection service keeps a visible notification active.
      const stream = (await (mediaDevices.getDisplayMedia as any)({
        video: true,
        audio: false,
        android: { createConfigForDefaultDisplay: true, resolutionScale: 0.6 },
      } as never)) as MediaStream;
      streamRef.current = stream;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        (track as any).onended = () => void stop();
      });

      (pc as any).onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setPhase('connected');
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setError('ارتباط تصویر قطع شد. دوباره تلاش کنید.');
          setPhase('error');
        }
      };

      const offer = await pc.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false });
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);
      if (!pc.localDescription?.sdp) throw new Error('WebRTC offer was not created');

      // Remove stale sessions for this device before advertising the new one.
      await supabase
        .from('screen_share_sessions')
        .update({ status: 'stopped', updated_at: new Date().toISOString() })
        .eq('device_id', deviceId)
        .in('status', ['offered', 'connected']);

      const { data, error: insertError } = await supabase
        .from('screen_share_sessions')
        .insert({
          device_id: deviceId,
          status: 'offered',
          offer: { type: 'offer', sdp: pc.localDescription.sdp },
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (insertError || !data) throw insertError || new Error('Could not create screen session');

      sessionIdRef.current = data.id;
      setPhase('waiting');
      pollRef.current = setInterval(async () => {
        const id = sessionIdRef.current;
        const activePc = pcRef.current;
        if (!id || !activePc || activePc.remoteDescription) return;
        const { data: row } = await supabase
          .from('screen_share_sessions')
          .select('answer,status')
          .eq('id', id)
          .maybeSingle();
        if (row?.status === 'stopped') {
          await stop();
          return;
        }
        const answer = row?.answer as ScreenShareRow['answer'];
        if (answer?.sdp) {
          await activePc.setRemoteDescription(new RTCSessionDescription(answer));
          setPhase('connected');
        }
      }, 1500);
    } catch (cause) {
      release();
      setError(cause instanceof Error ? cause.message : 'اجازه اشتراک صفحه صادر نشد.');
      setPhase('error');
    }
  }, [deviceId, phase, release, stop]);

  const reset = useCallback(() => {
    release();
    setError(null);
    setPhase('idle');
  }, [release]);

  useEffect(() => () => release(), [release]);
  return { phase, error, start, stop, reset };
}

export function useScreenViewer(deviceId: string | null) {
  const [phase, setPhase] = useState<SharePhase>('waiting');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const connectingRef = useRef(false);

  const close = useCallback(async () => {
    const id = sessionIdRef.current;
    pcRef.current?.close();
    pcRef.current = null;
    sessionIdRef.current = null;
    setStream(null);
    if (id) {
      await supabase
        .from('screen_share_sessions')
        .update({ status: 'stopped', updated_at: new Date().toISOString() })
        .eq('id', id);
    }
  }, []);

  const connectTo = useCallback(async (row: ScreenShareRow) => {
    if (connectingRef.current || pcRef.current || !row.offer?.sdp) return;
    connectingRef.current = true;
    try {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      sessionIdRef.current = row.id;
      (pc as any).ontrack = (event: any) => {
        const remote = event.streams?.[0];
        if (remote) setStream(remote);
      };
      (pc as any).onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setPhase('connected');
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setError('ارتباط زنده قطع شد.');
          setPhase('error');
        }
      };
      await pc.setRemoteDescription(new RTCSessionDescription(row.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIceGathering(pc);
      if (!pc.localDescription?.sdp) throw new Error('WebRTC answer was not created');
      const { error: updateError } = await supabase
        .from('screen_share_sessions')
        .update({
          answer: { type: 'answer', sdp: pc.localDescription.sdp },
          status: 'connected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (updateError) throw updateError;
      setPhase('connected');
    } catch (cause) {
      pcRef.current?.close();
      pcRef.current = null;
      sessionIdRef.current = null;
      setError(cause instanceof Error ? cause.message : 'اتصال تصویر برقرار نشد.');
      setPhase('error');
    } finally {
      connectingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!deviceId) {
      setError('ابتدا گوشی دوم را انتخاب کنید.');
      setPhase('error');
      return;
    }
    let active = true;
    const findOffer = async () => {
      if (!active || pcRef.current) return;
      const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error: queryError } = await supabase
        .from('screen_share_sessions')
        .select('id,device_id,status,offer,answer,created_at')
        .eq('device_id', deviceId)
        .eq('status', 'offered')
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (queryError) {
        setError('جدول اشتراک صفحه روی سرور فعال نشده است.');
        setPhase('error');
      } else if (data) {
        await connectTo(data as ScreenShareRow);
      }
    };
    void findOffer();
    const timer = setInterval(findOffer, 1500);
    return () => {
      active = false;
      clearInterval(timer);
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [connectTo, deviceId]);

  return { phase, stream, error, close };
}

export function ScreenStreamView({ stream, style }: { stream: MediaStream; style?: StyleProp<ViewStyle> }) {
  return <RTCView streamURL={stream.toURL()} objectFit="contain" mirror={false} style={style} />;
}
