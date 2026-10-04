import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { AppWindow, Search, Ban, CheckCircle2, Clock, HardDrive, Wifi } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, Typography, Spacing, Radius, CategoryLabels } from '@/lib/theme';
import { useInstalledApps } from '@/lib/useData';
import { useDeviceContext } from '@/lib/DeviceContext';
import { toPersianDigits, formatBytes, formatMinutes, timeAgo } from '@/lib/format';
import type { AppCategory } from '@/lib/types';

type CategoryFilter = 'all' | AppCategory;

const categoryFilters: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'social', label: 'شبکه اجتماعی' },
  { key: 'communication', label: 'ارتباطات' },
  { key: 'productivity', label: 'بهره‌وری' },
  { key: 'entertainment', label: 'سرگرمی' },
  { key: 'finance', label: 'مالی' },
  { key: 'system', label: 'سیستمی' },
];

export default function AppsScreen() {
  const { selectedDeviceId } = useDeviceContext();
  const { data: apps, loading, toggleBlock, reload } = useInstalledApps(selectedDeviceId);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filtered = apps.filter((app) => {
    const matchesSearch = search.trim() === '' || app.name.includes(search) || app.package_name.includes(search);
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalScreenTime = apps.reduce((sum, a) => sum + a.screen_time_minutes, 0);
  const totalDataUsage = apps.reduce((sum, a) => sum + a.data_usage_bytes, 0);
  const blockedCount = apps.filter((a) => a.is_blocked).length;

  const onRefresh = () => { setRefreshing(true); reload(); setRefreshing(false); };

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent[400]} />}
    >
      <ScreenHeader title="مدیریت برنامه‌ها" subtitle="نظارت و کنترل برنامه‌های نصب شده" icon={AppWindow} />

      <View style={styles.body}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{toPersianDigits(apps.length)}</Text>
            <Text style={styles.summaryLabel}>کل برنامه‌ها</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.warning[400] }]}>{toPersianDigits(blockedCount)}</Text>
            <Text style={styles.summaryLabel}>مسدود شده</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.accent[400] }]}>{formatMinutes(totalScreenTime)}</Text>
            <Text style={styles.summaryLabel}>زمان استفاده</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.primary[400] }]}>{formatBytes(totalDataUsage)}</Text>
            <Text style={styles.summaryLabel}>مصرف داده</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={18} color={Colors.neutral[500]} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی برنامه..."
            placeholderTextColor={Colors.neutral[500]}
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {categoryFilters.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterChip, activeCategory === f.key && styles.filterChipActive]}
              onPress={() => setActiveCategory(f.key)}
            >
              <Text style={[styles.filterText, activeCategory === f.key && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* App List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <AppWindow size={40} color={Colors.neutral[600]} strokeWidth={1.5} />
            <Text style={styles.emptyText}>برنامه‌ای یافت نشد</Text>
          </View>
        ) : (
          filtered.map((app) => (
            <View key={app.id} style={styles.appCard}>
              <View style={[styles.appIcon, { backgroundColor: app.icon_color + '30' }]}>
                <Text style={[styles.appIconText, { color: app.icon_color }]}>{app.name.charAt(0)}</Text>
              </View>
              <View style={styles.appInfo}>
                <View style={styles.appTopRow}>
                  <Text style={styles.appName}>{app.name}</Text>
                  {app.is_system && <Text style={styles.systemBadge}>سیستمی</Text>}
                  {app.is_blocked && (
                    <View style={styles.blockedBadge}>
                      <Ban size={10} color={Colors.error[400]} strokeWidth={2.5} />
                      <Text style={styles.blockedText}>مسدود</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.appCategory}>{CategoryLabels[app.category] || app.category}</Text>
                <View style={styles.appMetrics}>
                  <View style={styles.metric}>
                    <Clock size={12} color={Colors.neutral[500]} strokeWidth={2} />
                    <Text style={styles.metricText}>{formatMinutes(app.screen_time_minutes)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <HardDrive size={12} color={Colors.neutral[500]} strokeWidth={2} />
                    <Text style={styles.metricText}>{formatBytes(app.size_bytes)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Wifi size={12} color={Colors.neutral[500]} strokeWidth={2} />
                    <Text style={styles.metricText}>{formatBytes(app.data_usage_bytes)}</Text>
                  </View>
                </View>
                {app.last_used && (
                  <Text style={styles.lastUsed}>آخرین استفاده: {timeAgo(app.last_used)}</Text>
                )}
              </View>
              <Pressable
                style={[styles.blockBtn, app.is_blocked ? styles.unblockBtn : styles.blockBtnActive]}
                onPress={() => toggleBlock(app.id, !app.is_blocked)}
              >
                {app.is_blocked ? (
                  <CheckCircle2 size={18} color={Colors.success[400]} strokeWidth={2} />
                ) : (
                  <Ban size={18} color={Colors.error[400]} strokeWidth={2} />
                )}
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  loadingContainer: { flex: 1, backgroundColor: Colors.neutral[950], justifyContent: 'center', alignItems: 'center', direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[850],
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  summaryLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400], marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, backgroundColor: Colors.neutral[800] },
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
  searchInput: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[0], paddingVertical: 4 },
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
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[850],
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  appIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  appIconText: { fontFamily: Typography.fontFamily, fontSize: 22, fontWeight: Typography.weights.bold },
  appInfo: { flex: 1, gap: 4 },
  appTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  appName: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  systemBadge: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.neutral[500], backgroundColor: Colors.neutral[800], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  blockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.error[500] + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  blockedText: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.error[400], fontWeight: Typography.weights.medium },
  appCategory: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500] },
  appMetrics: { flexDirection: 'row', gap: Spacing.md, marginTop: 2 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metricText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400] },
  lastUsed: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600] },
  blockBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral[800] },
  blockBtnActive: { backgroundColor: Colors.error[500] + '15' },
  unblockBtn: { backgroundColor: Colors.success[500] + '15' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[500] },
});
