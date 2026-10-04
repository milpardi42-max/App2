import { StyleSheet, Text, View } from 'react-native';
import {
  Phone,
  MessageSquare,
  Download,
  Trash2,
  Bell,
  RefreshCw,
  FileUp,
  MonitorCog,
  Wifi,
  Battery,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { DeviceActivity, ActivityType } from '@/lib/types';
import { formatTime, formatDuration, formatBytes } from '@/lib/format';
import { LucideIcon } from 'lucide-react-native';

const typeIcons: Record<ActivityType, LucideIcon> = {
  call: Phone,
  message: MessageSquare,
  app_install: Download,
  app_uninstall: Trash2,
  notification: Bell,
  data_sync: RefreshCw,
  file_transfer: FileUp,
  system_update: MonitorCog,
  network: Wifi,
  battery: Battery,
};

const typeColors: Record<ActivityType, string> = {
  call: Colors.accent[400],
  message: Colors.success[400],
  app_install: Colors.primary[400],
  app_uninstall: Colors.error[400],
  notification: Colors.warning[400],
  data_sync: Colors.primary[300],
  file_transfer: Colors.accent[300],
  system_update: Colors.neutral[300],
  network: Colors.accent[400],
  battery: Colors.warning[400],
};

const typeLabels: Record<ActivityType, string> = {
  call: 'تماس',
  message: 'پیامک',
  app_install: 'نصب برنامه',
  app_uninstall: 'حذف برنامه',
  notification: 'اعلان',
  data_sync: 'همگام‌سازی',
  file_transfer: 'انتقال فایل',
  system_update: 'به‌روزرسانی',
  network: 'شبکه',
  battery: 'باتری',
};

const statusColors: Record<string, string> = {
  success: Colors.success[400],
  failed: Colors.error[400],
  blocked: Colors.warning[500],
  pending: Colors.neutral[400],
};

const statusLabels: Record<string, string> = {
  success: 'موفق',
  failed: 'ناموفق',
  blocked: 'مسدود',
  pending: 'در انتظار',
};

interface ActivityRowProps {
  activity: DeviceActivity;
}

export function ActivityRow({ activity }: ActivityRowProps) {
  const Icon = typeIcons[activity.type] || Bell;
  const color = typeColors[activity.type] || Colors.neutral[400];
  const isIncoming = activity.direction === 'incoming';
  const DirIcon = isIncoming ? ArrowDownLeft : ArrowUpRight;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.source} numberOfLines={1}>{activity.source}</Text>
          <View style={[styles.dirBadge, { backgroundColor: (isIncoming ? Colors.accent[500] : Colors.primary[500]) + '20' }]}>
            <DirIcon size={12} color={isIncoming ? Colors.accent[400] : Colors.primary[400]} strokeWidth={2.5} />
          </View>
        </View>
        {activity.description && (
          <Text style={styles.description} numberOfLines={1}>{activity.description}</Text>
        )}
        <View style={styles.bottomRow}>
          <Text style={styles.typeLabel}>{typeLabels[activity.type]}</Text>
          {activity.duration != null && activity.duration > 0 && (
            <Text style={styles.meta}>{formatDuration(activity.duration)}</Text>
          )}
          {activity.data_size != null && activity.data_size > 0 && (
            <Text style={styles.meta}>{formatBytes(activity.data_size)}</Text>
          )}
          <View style={[styles.statusDot, { backgroundColor: statusColors[activity.status] }]} />
          <Text style={[styles.statusLabel, { color: statusColors[activity.status] }]}>
            {statusLabels[activity.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.time}>{formatTime(activity.created_at)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral[850],
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  source: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    flex: 1,
    textAlign: 'right',
  },
  dirBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  description: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    textAlign: 'right',
  },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  typeLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[500],
  },
  meta: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400] },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginLeft: Spacing.xs },
  statusLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium },
  time: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500] },
});
