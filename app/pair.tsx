// Dashboard pairing screen (phone 1) — shows a fresh 6-digit code + QR,
// and lists phones that entered the code so the admin can approve or reject
// them (the "TV confirmation popup" moment).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  MailWarning,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { toPersianDigits } from '@/lib/format';
import {
  createPairingSession,
  cancelPairingSession,
  fetchPendingDevices,
  confirmDevice,
  rejectDevice,
  isSupabaseConfigured,
  type PairingSession,
} from '@/lib/pairing';
import { useDeviceContext } from '@/lib/DeviceContext';
import type { Device } from '@/lib/types';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=';

function useCountdown(expiresAt: number | null): number {
  const [remain, setRemain] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemain(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return remain;
}

export default function PairScreen() {
  const router = useRouter();
  const { reload } = useDeviceContext();
  const configured = isSupabaseConfigured();

  const [session, setSession] = useState<PairingSession | null>(null);
  const [sessionError, setSessionError] = useState(false);
  const [pending, setPending] = useState<Device[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const remain = useCountdown(session?.expiresAt ?? null);
  const sessionRef = useRef<PairingSession | null>(null);
  sessionRef.current = session;

  const newSession = useCallback(async () => {
    if (!configured) return;
    const old = sessionRef.current;
    if (old) cancelPairingSession(old.id);
    setSession(null);
    setSessionError(false);
    const fresh = await createPairingSession();
    setSession(fresh);
    if (!fresh) setSessionError(true);
  }, [configured]);

  useFocusEffect(
    useCallback(() => {
      newSession();
      const poll = setInterval(async () => {
        const list = await fetchPendingDevices();
        setPending(list);
      }, 4000);
      fetchPendingDevices().then(setPending);
      return () => clearInterval(poll);
    }, [newSession]),
  );

  // Auto-regenerate when the code expires
  useEffect(() => {
    if (session && remain === 0) newSession();
  }, [remain, session, newSession]);

  const approve = async (device: Device) => {
    setBusyId(device.id);
    await confirmDevice(device.id);
    setPending((list) => list.filter((d) => d.id !== device.id));
    reload();
    setBusyId(null);
  };

  const reject = async (device: Device) => {
    setBusyId(device.id);
    await rejectDevice(device.id);
    setPending((list) => list.filter((d) => d.id !== device.id));
    setBusyId(null);
  };

  const codeDisplay = session ? toPersianDigits(session.code).split('').join(' ') : '';
  const qrUrl = session ? `${QR_API}${encodeURIComponent(session.code)}` : '';

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowRight size={20} color={Colors.neutral[200]} strokeWidth={2.3} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>اتصال گوشی دوم</Text>
          <Text style={styles.headerSub}>کد را در گوشی دوم وارد یا اسکن کنید</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.body}>
          {!configured ? (
            <View style={styles.noticeCard}>
              <MailWarning size={22} color={Colors.warning[400]} strokeWidth={2} />
              <Text style={styles.noticeTitle}>سرور هنوز تنظیم نشده است</Text>
              <Text style={styles.noticeText}>
                برای اتصال واقعی دو گوشی، ابتدا باید سرور (Supabase) فعال شود. تا آن زمان این صفحه فقط برای نمایش است.
              </Text>
            </View>
          ) : (
            <>
              {/* code card */}
              <LinearGradient
                colors={[Colors.primary[600], Colors.accent[800]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.codeCard}
              >
                <Text style={styles.codeCardTitle}>کد اتصال</Text>
                {session ? (
                  <>
                    <View style={styles.codeBox} accessible accessibilityLabel={`کد اتصال ${toPersianDigits(session.code)}`}>
                      <Text style={styles.codeDigits}>{codeDisplay}</Text>
                    </View>
                    <View style={styles.timerRow}>
                      <Clock size={14} color="rgba(255,255,255,0.85)" strokeWidth={2.2} />
                      <Text style={styles.timerText}>
                        اعتبار: {toPersianDigits(Math.floor(remain / 60))}:
                        {toPersianDigits(String(remain % 60).padStart(2, '0'))}
                      </Text>
                    </View>
                    {qrUrl ? (
                      <View style={styles.qrWrap}>
                        <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
                      </View>
                    ) : null}
                    <Text style={styles.codeHint}>
                      در گوشی دوم دکمه‌ی «اتصال به گوشی اول» را بزنید و این کد را وارد یا اسکن کنید
                    </Text>
                  </>
                ) : sessionError ? (
                  <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md }}>
                    <XCircle size={30} color={Colors.error[400]} strokeWidth={2} />
                    <Text style={styles.codeHint}>
                      ساخت کد ممکن نشد. اتصال اینترنت و تنظیمات سرور را بررسی کنید.
                    </Text>
                  </View>
                ) : (
                  <ActivityIndicator size="large" color={Colors.onColor} style={{ marginVertical: Spacing.xl }} />
                )}
                <Pressable style={styles.newCodeBtn} onPress={newSession}>
                  <RefreshCw size={15} color={Colors.onColor} strokeWidth={2.4} />
                  <Text style={styles.newCodeBtnText}>کد جدید</Text>
                </Pressable>
              </LinearGradient>

              {/* pending approvals — the TV-style confirmation */}
              <View style={styles.pendingHeader}>
                <ShieldCheck size={18} color={Colors.accent[500]} strokeWidth={2.2} />
                <Text style={styles.pendingTitle}>درخواست‌های اتصال</Text>
              </View>

              {pending.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Smartphone size={28} color={Colors.neutral[600]} strokeWidth={1.8} />
                  <Text style={styles.emptyText}>
                    هنوز گوشی‌ای درخواست نداده است. وقتی کد را در گوشی دوم وارد کنید، درخواست آن اینجا می‌آید.
                  </Text>
                </View>
              ) : (
                pending.map((device) => (
                  <View key={device.id} style={styles.requestCard}>
                    <View style={styles.requestIconWrap}>
                      <Smartphone size={26} color={Colors.accent[500]} strokeWidth={2} />
                    </View>
                    <Text style={styles.requestTitle}>
                      «{device.device_name || device.device_model || 'گوشی'}» می‌خواهد متصل شود
                    </Text>
                    <Text style={styles.requestSub}>
                      {device.device_model ?? ''} {device.os_version ? `• ${device.os_version}` : ''}
                    </Text>
                    <View style={styles.requestActions}>
                      <Pressable
                        style={[styles.approveBtn, busyId === device.id && { opacity: 0.6 }]}
                        disabled={busyId === device.id}
                        onPress={() => approve(device)}
                      >
                        <CheckCircle2 size={17} color={Colors.onColor} strokeWidth={2.3} />
                        <Text style={styles.approveBtnText}>تأیید اتصال</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.rejectBtn, busyId === device.id && { opacity: 0.6 }]}
                        disabled={busyId === device.id}
                        onPress={() => reject(device)}
                      >
                        <XCircle size={17} color={Colors.error[400]} strokeWidth={2.3} />
                        <Text style={styles.rejectBtnText}>رد</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'right',
  },
  headerSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
    textAlign: 'right',
  },
  scroll: { flex: 1 },
  body: { padding: Spacing.lg, paddingBottom: Spacing.xxl + 24, gap: Spacing.md },

  noticeCard: {
    backgroundColor: Colors.warning[500] + '10',
    borderWidth: 1,
    borderColor: Colors.warning[500] + '45',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noticeTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.warning[400],
    textAlign: 'center',
  },
  noticeText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[300],
    textAlign: 'center',
    lineHeight: 22,
  },

  codeCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  codeCardTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    color: 'rgba(255,255,255,0.85)',
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  codeDigits: {
    fontFamily: Typography.fontFamily,
    fontSize: 38,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
    letterSpacing: 4,
    textAlign: 'center',
  },
  timerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  timerText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  qrWrap: {
    backgroundColor: Colors.onColor,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  qrImage: { width: 170, height: 170 },
  codeHint: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  newCodeBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  newCodeBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
  },

  pendingHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  pendingTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
  },

  emptyCard: {
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    textAlign: 'center',
    lineHeight: 22,
  },

  requestCard: {
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.accent[500] + '50',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requestIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent[500] + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'center',
  },
  requestSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
  requestActions: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    alignSelf: 'stretch',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.success[500],
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  approveBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.error[500] + '15',
    borderWidth: 1,
    borderColor: Colors.error[500] + '50',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  rejectBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.error[400],
  },
});
