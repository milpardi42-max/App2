import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, MonitorSmartphone, ShieldCheck, X } from 'lucide-react-native';
import { useDeviceContext } from '@/lib/DeviceContext';
import { ScreenStreamView, useScreenViewer } from '@/lib/liveScreen';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';

export default function RemoteScreenPage() {
  const router = useRouter();
  const { selectedDeviceId } = useDeviceContext();
  const viewer = useScreenViewer(selectedDeviceId);

  useEffect(() => {
    return () => {
      void viewer.close();
    };
  }, [viewer.close]);

  const goBack = async () => {
    await viewer.close();
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => void goBack()} hitSlop={10}>
          <ArrowRight size={21} color={Colors.neutral[100]} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>نمایش زنده گوشی دوم</Text>
          <Text style={styles.subtitle}>
            {viewer.phase === 'connected' ? 'ارتباط امن برقرار است' : 'در انتظار اشتراک صفحه'}
          </Text>
        </View>
        <View style={[styles.dot, viewer.phase === 'connected' && styles.dotLive]} />
      </View>

      <View style={styles.stage}>
        {viewer.stream ? (
          <ScreenStreamView stream={viewer.stream} style={styles.video} />
        ) : (
          <View style={styles.empty}>
            {viewer.phase === 'waiting' ? (
              <ActivityIndicator size="large" color={Colors.primary[400]} />
            ) : (
              <MonitorSmartphone size={52} color={Colors.neutral[600]} strokeWidth={1.5} />
            )}
            <Text style={styles.emptyTitle}>
              {viewer.phase === 'error' ? 'اتصال تصویر برقرار نشد' : 'منتظر گوشی دوم هستیم'}
            </Text>
            <Text style={styles.emptyDesc}>
              {viewer.error ||
                'در گوشی دوم وارد صفحه اصلی شوید، «شروع اشتراک صفحه» را بزنید و پیام اجازه اندروید را تأیید کنید.'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.consentBar}>
        <ShieldCheck size={17} color={Colors.success[400]} strokeWidth={2.1} />
        <Text style={styles.consentText}>
          اشتراک با اجازه صریح گوشی دوم فعال است و هنگام پخش، اعلان دائمی اندروید نمایش داده می‌شود.
        </Text>
      </View>

      <Pressable style={styles.stopBtn} onPress={() => void goBack()}>
        <X size={18} color={Colors.error[300]} strokeWidth={2.2} />
        <Text style={styles.stopText}>بستن نمایش زنده</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070d', paddingTop: 48, paddingBottom: 24 },
  header: {
    minHeight: 66,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[850],
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[0],
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
    textAlign: 'right',
    marginTop: 2,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.warning[500] },
  dotLive: { backgroundColor: Colors.success[500] },
  stage: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  video: { width: '100%', height: '100%', backgroundColor: '#000' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[100],
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    textAlign: 'center',
    lineHeight: 23,
  },
  consentBar: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.success[500] + '10',
  },
  consentText: {
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[300],
    textAlign: 'right',
    lineHeight: 19,
  },
  stopBtn: {
    minHeight: 48,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.error[500] + '55',
    backgroundColor: Colors.error[500] + '10',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.error[300],
  },
});
