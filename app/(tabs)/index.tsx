import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  HardDrive,
  TrendingUp,
  Clock,
  Smartphone,
  Cpu,
  Signal,
  Battery,
  Wifi,
  Thermometer,
  Zap,
  ChevronLeft,
  AppWindow,
  Command,
} from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatCard } from '@/components/StatCard';
import { ActivityRow } from '@/components/ActivityRow';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { useDeviceInfo } from '@/lib/useData';
import { useDeviceContext } from '@/lib/DeviceContext';
import type { DeviceActivity, SecurityEvent, InstalledApp } from '@/lib/types';
import { toPersianDigits, formatBytes } from '@/lib/format';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { selectedDeviceId } = useDeviceContext();
  const { info: device } = useDeviceInfo(selectedDeviceId);
  const [activities, setActivities] = useState<DeviceActivity[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedDeviceId) { setLoading(false); return; }
    const [actRes, secRes, appRes] = await Promise.all([
      supabase.from('device_activity').select('*').eq('device_id', selectedDeviceId).order('created_at', { ascending: false }).limit(5),
      supabase.from('security_events').select('*').eq('device_id', selectedDeviceId).order('created_at', { ascending: false }).limit(5),
      supabase.from('installed_apps').select('*').eq('device_id', selectedDeviceId),
    ]);
    if (actRes.data) setActivities(actRes.data as DeviceActivity[]);
    if (secRes.data) setSecurityEvents(secRes.data as SecurityEvent[]);
    if (appRes.data) setApps(appRes.data as InstalledApp[]);
    setLoading(false);
    setRefreshing(false);
  }, [selectedDeviceId]);

  useEffect(() => { setLoading(true); loadData(); }, [loadData]);

  const calls = activities.filter((a) => a.type === 'call').length;
  const messages = activities.filter((a) => a.type === 'message').length;
  const unresolved = securityEvents.filter((e) => !e.resolved).length;
  const totalData = activities.reduce((sum, a) => sum + (a.data_size || 0), 0);
  const blockedApps = apps.filter((a) => a.is_blocked).length;
  const successRate = activities.length > 0
    ? Math.round((activities.filter((a) => a.status === 'success').length / activities.length) * 100)
    : 0;

  const storageTotal = parseInt(device.storage_total || '0');
  const storageUsed = parseInt(device.storage_used || '0');
  const storagePct = storageTotal > 0 ? Math.round((storageUsed / storageTotal) * 100) : 0;
  const ramTotal = parseInt(device.ram_total || '0');
  const ramUsed = parseInt(device.ram_used || '0');
  const ramPct = ramTotal > 0 ? Math.round((ramUsed / ramTotal) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent[400]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.accent[400]} />}
    >
      <ScreenHeader
        title="پنل مدیریت"
        subtitle="کنترل و مانیتورینگ کامل دستگاه"
        icon={Smartphone}
      />

      <View style={styles.body}>
        {/* Device Status Hero */}
        <LinearGradient
          colors={[Colors.accent[600], Colors.primary[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Smartphone size={28} color={Colors.onColor} strokeWidth={2} />
            </View>
            <View style={styles.heroStatus}>
              <View style={styles.heroStatusDot} />
              <Text style={styles.heroStatusText}>آنلاین و فعال</Text>
            </View>
          </View>
          <Text style={styles.heroDeviceName}>{device.device_model || 'گوشی هوشمند'}</Text>
          <Text style={styles.heroDeviceSub}>{device.os_version || ''}</Text>
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Battery size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Text style={styles.heroMetricText}>{toPersianDigits(device.battery_level || '0')}٪ باتری</Text>
            </View>
            <View style={styles.heroMetric}>
              <Signal size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Text style={styles.heroMetricText}>{device.carrier || ''}</Text>
            </View>
            <View style={styles.heroMetric}>
              <Cpu size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Text style={styles.heroMetricText}>{toPersianDigits(device.cpu_usage || '0')}٪ CPU</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon={Phone} label="تماس‌ها" value={toPersianDigits(calls)} subValue="امروز" gradient={[Colors.accent[500], Colors.accent[700]]} />
          <StatCard icon={MessageSquare} label="پیامک‌ها" value={toPersianDigits(messages)} subValue="امروز" gradient={[Colors.success[500], Colors.success[700]]} />
          <StatCard icon={ShieldAlert} label="هشدار امنیتی" value={toPersianDigits(unresolved)} subValue="نیاز به بررسی" gradient={[Colors.warning[500], Colors.warning[700]]} />
          <StatCard icon={HardDrive} label="حجم داده" value={formatBytes(totalData)} subValue="انتقال داده" gradient={[Colors.primary[500], Colors.primary[700]]} />
        </View>

        {/* System Resources */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>منابع سیستم</Text>
          <View style={styles.resourceRow}>
            <View style={styles.resourceHeader}>
              <HardDrive size={16} color={Colors.accent[400]} strokeWidth={2} />
              <Text style={styles.resourceLabel}>حافظه داخلی</Text>
            </View>
            <View style={styles.resourceBar}>
              <View style={styles.resourceTrack}>
                <LinearGradient
                  colors={[Colors.accent[400], Colors.accent[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.resourceFill, { width: `${storagePct}%` }]}
                />
              </View>
              <Text style={styles.resourcePct}>{toPersianDigits(storagePct)}٪</Text>
            </View>
            <Text style={styles.resourceDetail}>{formatBytes(storageUsed)} از {formatBytes(storageTotal)}</Text>
          </View>
          <View style={styles.resourceRow}>
            <View style={styles.resourceHeader}>
              <Cpu size={16} color={Colors.primary[400]} strokeWidth={2} />
              <Text style={styles.resourceLabel}>حافظه RAM</Text>
            </View>
            <View style={styles.resourceBar}>
              <View style={styles.resourceTrack}>
                <LinearGradient
                  colors={[Colors.primary[400], Colors.primary[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.resourceFill, { width: `${ramPct}%` }]}
                />
              </View>
              <Text style={styles.resourcePct}>{toPersianDigits(ramPct)}٪</Text>
            </View>
            <Text style={styles.resourceDetail}>{formatBytes(ramUsed)} از {formatBytes(ramTotal)}</Text>
          </View>
          <View style={styles.resourceRow}>
            <View style={styles.resourceHeader}>
              <Thermometer size={16} color={Colors.warning[400]} strokeWidth={2} />
              <Text style={styles.resourceLabel}>دمای پردازنده</Text>
            </View>
            <View style={styles.resourceBar}>
              <View style={styles.resourceTrack}>
                <LinearGradient
                  colors={[Colors.success[400], Colors.warning[500]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.resourceFill, { width: `${Math.min(parseInt(device.cpu_temp || '0'), 100)}%` }]}
                />
              </View>
              <Text style={styles.resourcePct}>{toPersianDigits(device.cpu_temp || '0')}°C</Text>
            </View>
            <Text style={styles.resourceDetail}>نرمال</Text>
          </View>
        </View>

        {/* Success Rate */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={Colors.accent[400]} strokeWidth={2} />
            <Text style={styles.sectionTitle}>نرخ موفقیت فعالیت‌ها</Text>
          </View>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[Colors.success[400], Colors.success[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${successRate}%` }]}
              />
            </View>
            <Text style={styles.progressPercent}>{toPersianDigits(successRate)}٪</Text>
          </View>
          <View style={styles.statusBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: Colors.success[400] }]} />
              <Text style={styles.breakdownText}>موفق: {toPersianDigits(activities.filter((a) => a.status === 'success').length)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: Colors.warning[500] }]} />
              <Text style={styles.breakdownText}>مسدود: {toPersianDigits(activities.filter((a) => a.status === 'blocked').length)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: Colors.error[400] }]} />
              <Text style={styles.breakdownText}>ناموفق: {toPersianDigits(activities.filter((a) => a.status === 'failed').length)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksRow}>
          <Pressable style={styles.quickLink} onPress={() => router.push('/(tabs)/apps')}>
            <View style={[styles.quickLinkIcon, { backgroundColor: Colors.primary[500] + '20' }]}>
              <AppWindow size={20} color={Colors.primary[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickLinkLabel}>برنامه‌ها</Text>
            <Text style={styles.quickLinkCount}>{toPersianDigits(apps.length)} برنامه</Text>
          </Pressable>
          <Pressable style={styles.quickLink} onPress={() => router.push('/(tabs)/controls')}>
            <View style={[styles.quickLinkIcon, { backgroundColor: Colors.accent[500] + '20' }]}>
              <Command size={20} color={Colors.accent[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickLinkLabel}>کنترل</Text>
            <Text style={styles.quickLinkCount}>دستورات از راه دور</Text>
          </Pressable>
          <Pressable style={styles.quickLink} onPress={() => router.push('/(tabs)/security')}>
            <View style={[styles.quickLinkIcon, { backgroundColor: Colors.warning[500] + '20' }]}>
              <ShieldAlert size={20} color={Colors.warning[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickLinkLabel}>امنیت</Text>
            <Text style={styles.quickLinkCount}>{toPersianDigits(unresolved)} هشدار</Text>
          </Pressable>
        </View>

        {/* Recent Activity */}
        <Pressable style={styles.sectionLink} onPress={() => router.push('/(tabs)/activity')}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={Colors.accent[400]} strokeWidth={2} />
            <Text style={styles.sectionTitle}>آخرین فعالیت‌ها</Text>
          </View>
          <ChevronLeft size={20} color={Colors.neutral[500]} strokeWidth={2} />
        </Pressable>
        {activities.map((act) => (
          <ActivityRow key={act.id} activity={act} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  loadingContainer: { flex: 1, backgroundColor: Colors.neutral[950], justifyContent: 'center', alignItems: 'center', direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },
  heroCard: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroIconWrap: { width: 56, height: 56, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  heroStatus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  heroStatusText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.onColor },
  heroStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success[400] },
  heroDeviceName: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.onColor, marginTop: Spacing.md, textAlign: 'right' },
  heroDeviceSub: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'right' },
  heroMetrics: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md },
  heroMetric: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  heroMetricText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  resourceRow: { marginBottom: Spacing.md },
  resourceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  resourceLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.neutral[300] },
  resourceBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  resourceTrack: { flex: 1, height: 8, backgroundColor: Colors.neutral[800], borderRadius: 4, overflow: 'hidden' },
  resourceFill: { height: '100%', borderRadius: 4 },
  resourcePct: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[200] },
  resourceDetail: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500], marginTop: 2 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  progressTrack: { flex: 1, height: 10, backgroundColor: Colors.neutral[800], borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressPercent: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.success[400] },
  statusBreakdown: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400] },
  quickLinksRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  quickLink: { alignItems: 'center', gap: 4, flex: 1 },
  quickLinkIcon: { width: 48, height: 48, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  quickLinkLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  quickLinkCount: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500] },
  sectionLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm, paddingHorizontal: Spacing.xs },
});
