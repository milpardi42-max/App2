import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { Activity, Search, Filter, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ActivityRow } from '@/components/ActivityRow';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { useDeviceContext } from '@/lib/DeviceContext';
import type { DeviceActivity, ActivityType } from '@/lib/types';
import { toPersianDigits } from '@/lib/format';

type FilterType = 'all' | ActivityType;

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'call', label: 'تماس‌ها' },
  { key: 'message', label: 'پیامک‌ها' },
  { key: 'app_install', label: 'نصب' },
  { key: 'app_uninstall', label: 'حذف' },
  { key: 'notification', label: 'اعلان' },
  { key: 'data_sync', label: 'همگام‌سازی' },
  { key: 'file_transfer', label: 'انتقال فایل' },
  { key: 'system_update', label: 'به‌روزرسانی' },
  { key: 'network', label: 'شبکه' },
];

export default function ActivityScreen() {
  const { selectedDeviceId } = useDeviceContext();
  const [activities, setActivities] = useState<DeviceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    if (!selectedDeviceId) { setLoading(false); return; }
    let query = supabase.from('device_activity').select('*').eq('device_id', selectedDeviceId).order('created_at', { ascending: false });
    if (activeFilter !== 'all') {
      query = query.eq('type', activeFilter);
    }
    if (search.trim()) {
      query = query.or(`source.ilike.%${search}%,description.ilike.%${search}%`);
    }
    const { data } = await query.limit(50);
    setActivities(data as DeviceActivity[]);
    setLoading(false);
    setRefreshing(false);
  }, [selectedDeviceId, activeFilter, search]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timeout);
  }, [loadData]);

  const incoming = activities.filter((a) => a.direction === 'incoming').length;
  const outgoing = activities.filter((a) => a.direction === 'outgoing').length;
  const blocked = activities.filter((a) => a.status === 'blocked').length;
  const failed = activities.filter((a) => a.status === 'failed').length;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.accent[400]} />}
    >
      <ScreenHeader title="فعالیت‌ها" subtitle="تمام ورودی‌ها و خروجی‌های دستگاه" icon={Activity} />

      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Search size={18} color={Colors.neutral[500]} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجو در فعالیت‌ها..."
            placeholderTextColor={Colors.neutral[500]}
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <ArrowDownLeft size={20} color={Colors.accent[400]} strokeWidth={2} />
            <Text style={styles.summaryValue}>{toPersianDigits(incoming)}</Text>
            <Text style={styles.summaryLabel}>ورودی</Text>
          </View>
          <View style={styles.summaryCard}>
            <ArrowUpRight size={20} color={Colors.primary[400]} strokeWidth={2} />
            <Text style={styles.summaryValue}>{toPersianDigits(outgoing)}</Text>
            <Text style={styles.summaryLabel}>خروجی</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.warning[500] + '40' }]}>
            <Filter size={20} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.summaryValue}>{toPersianDigits(blocked)}</Text>
            <Text style={styles.summaryLabel}>مسدود</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.error[500] + '40' }]}>
            <Filter size={20} color={Colors.error[400]} strokeWidth={2} />
            <Text style={styles.summaryValue}>{toPersianDigits(failed)}</Text>
            <Text style={styles.summaryLabel}>ناموفق</Text>
          </View>
        </View>

        {/* Activity List */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.accent[400]} style={styles.loader} />
        ) : activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={40} color={Colors.neutral[600]} strokeWidth={1.5} />
            <Text style={styles.emptyText}>هیچ فعالیتی یافت نشد</Text>
          </View>
        ) : (
          <>
            <Text style={styles.listLabel}>{toPersianDigits(activities.length)} مورد یافت شد</Text>
            {activities.map((act) => <ActivityRow key={act.id} activity={act} />)}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.neutral[0],
    paddingVertical: 4,
  },
  filterScroll: { marginBottom: Spacing.md, marginHorizontal: -Spacing.md },
  filterContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  filterChip: {
    backgroundColor: Colors.neutral[850],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  filterChipActive: { backgroundColor: Colors.accent[500] + '30', borderColor: Colors.accent[400] },
  filterText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400] },
  filterTextActive: { color: Colors.accent[300], fontWeight: Typography.weights.medium },
  summaryGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  summaryValue: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  summaryLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400] },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[500] },
  listLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[500], marginBottom: Spacing.sm },
});
