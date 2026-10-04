import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Fingerprint,
  Eye,
  Bug,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wifi,
  Bluetooth,
  MapPin,
  Phone,
  Smartphone,
  Info,
} from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { useSecurityEvents, useDeviceInfo, useContacts } from '@/lib/useData';
import { useDeviceContext } from '@/lib/DeviceContext';
import { formatPersianDate, toPersianDigits, timeAgo } from '@/lib/format';
import type { SecuritySeverity } from '@/lib/types';
import { LucideIcon } from 'lucide-react-native';

const severityConfig: Record<SecuritySeverity, { color: string; bg: string; label: string; icon: LucideIcon }> = {
  info: { color: Colors.accent[400], bg: Colors.accent[500] + '20', label: 'اطلاع', icon: Info },
  warning: { color: Colors.warning[400], bg: Colors.warning[500] + '20', label: 'هشدار', icon: AlertTriangle },
  critical: { color: Colors.error[400], bg: Colors.error[500] + '20', label: 'بحرانی', icon: XCircle },
};

const eventIcons: Record<string, LucideIcon> = {
  lock: Lock,
  unlock: Unlock,
  failed_attempt: Fingerprint,
  app_permission: Eye,
  suspicious_activity: Bug,
  scan: ScanLine,
};

export default function SecurityScreen() {
  const { selectedDeviceId } = useDeviceContext();
  const { data: events, loading, resolve, reload } = useSecurityEvents(selectedDeviceId);
  const { info: device } = useDeviceInfo(selectedDeviceId);
  const { data: contacts, toggleBlock: toggleContactBlock } = useContacts(selectedDeviceId);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'threats' | 'permissions' | 'contacts'>('threats');

  const onRefresh = () => { setRefreshing(true); reload(); setRefreshing(false); };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent[400]} />
      </View>
    );
  }

  const unresolved = events.filter((e) => !e.resolved);
  const warnings = events.filter((e) => e.severity === 'warning' && !e.resolved);
  const critical = events.filter((e) => e.severity === 'critical' && !e.resolved);
  const score = Math.max(0, 100 - unresolved.length * 10 - critical.length * 15);
  const blockedContacts = contacts.filter((c) => c.is_blocked);

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent[400]} />}
    >
      <ScreenHeader title="مرکز امنیت" subtitle="وضعیت امنیتی و مدیریت تهدیدها" icon={ShieldCheck} />

      <View style={styles.body}>
        {/* Security Score */}
        <LinearGradient
          colors={score >= 70 ? [Colors.success[600], Colors.success[800]] : score >= 40 ? [Colors.warning[500], Colors.warning[700]] : [Colors.error[500], Colors.error[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <View style={styles.scoreTop}>
            <View style={styles.scoreIconWrap}>
              {score >= 70 ? <ShieldCheck size={28} color={Colors.onColor} strokeWidth={2} /> : <ShieldAlert size={28} color={Colors.onColor} strokeWidth={2} />}
            </View>
            <View>
              <Text style={styles.scoreLabel}>امتیاز امنیتی</Text>
              <Text style={styles.scoreValue}>{toPersianDigits(score)} از ۱۰۰</Text>
            </View>
          </View>
          <View style={styles.scoreBar}>
            <View style={styles.scoreBarTrack}>
              <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: Colors.onColor }]} />
            </View>
          </View>
          <Text style={styles.scoreStatus}>
            {score >= 70 ? 'دستگاه شما امن است' : score >= 40 ? 'نیاز به بررسی وجود دارد' : 'دستگاه در معرض خطر است'}
          </Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <View style={[styles.quickStatIcon, { backgroundColor: Colors.error[500] + '20' }]}>
              <XCircle size={18} color={Colors.error[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickStatValue}>{toPersianDigits(critical.length)}</Text>
            <Text style={styles.quickStatLabel}>بحرانی</Text>
          </View>
          <View style={styles.quickStat}>
            <View style={[styles.quickStatIcon, { backgroundColor: Colors.warning[500] + '20' }]}>
              <AlertTriangle size={18} color={Colors.warning[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickStatValue}>{toPersianDigits(warnings.length)}</Text>
            <Text style={styles.quickStatLabel}>هشدار</Text>
          </View>
          <View style={styles.quickStat}>
            <View style={[styles.quickStatIcon, { backgroundColor: Colors.success[500] + '20' }]}>
              <CheckCircle2 size={18} color={Colors.success[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickStatValue}>{toPersianDigits(events.filter((e) => e.resolved).length)}</Text>
            <Text style={styles.quickStatLabel}>حل شده</Text>
          </View>
          <View style={styles.quickStat}>
            <View style={[styles.quickStatIcon, { backgroundColor: Colors.primary[500] + '20' }]}>
              <Phone size={18} color={Colors.primary[400]} strokeWidth={2} />
            </View>
            <Text style={styles.quickStatValue}>{toPersianDigits(blockedContacts.length)}</Text>
            <Text style={styles.quickStatLabel}>مسدود شده</Text>
          </View>
        </View>

        {/* Device Security Status */}
        <Text style={styles.sectionLabel}>وضعیت امنیتی دستگاه</Text>
        <View style={styles.deviceSecurityCard}>
          <SecurityRow icon={Lock} label="قفل دستگاه" value={device.airplane_mode === 'true' ? 'قفل شده' : 'باز است'} color={Colors.success[400]} />
          <SecurityRow icon={Fingerprint} label="اثر انگشت" value="فعال" color={Colors.success[400]} />
          <SecurityRow icon={MapPin} label="خدمات موقعیت" value={device.location_enabled === 'true' ? 'فعال' : 'غیرفعال'} color={device.location_enabled === 'true' ? Colors.success[400] : Colors.warning[400]} />
          <SecurityRow icon={Wifi} label="اتصال وای‌فای" value={device.wifi_connected === 'true' ? device.wifi_name || 'متصل' : 'قطع'} color={device.wifi_connected === 'true' ? Colors.success[400] : Colors.error[400]} />
          <SecurityRow icon={Bluetooth} label="بلوتوث" value={device.bluetooth_enabled === 'true' ? 'فعال' : 'غیرفعال'} color={device.bluetooth_enabled === 'true' ? Colors.warning[400] : Colors.neutral[400]} />
          <SecurityRow icon={Smartphone} label="حالت پرواز" value={device.airplane_mode === 'true' ? 'فعال' : 'غیرفعال'} color={device.airplane_mode === 'true' ? Colors.warning[400] : Colors.neutral[400]} />
          <SecurityRow icon={ShieldCheck} label="VPN" value={device.vpn_connected === 'true' ? 'متصل' : 'قطع'} color={device.vpn_connected === 'true' ? Colors.success[400] : Colors.neutral[400]} />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <Pressable style={[styles.tab, activeTab === 'threats' && styles.tabActive]} onPress={() => setActiveTab('threats')}>
            <Text style={[styles.tabText, activeTab === 'threats' && styles.tabTextActive]}>تهدیدها</Text>
          </Pressable>
          <Pressable style={[styles.tab, activeTab === 'contacts' && styles.tabActive]} onPress={() => setActiveTab('contacts')}>
            <Text style={[styles.tabText, activeTab === 'contacts' && styles.tabTextActive]}>مخاطبین</Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === 'threats' && (
          <>
            <Text style={styles.sectionLabel}>رویدادهای امنیتی</Text>
            {events.map((event) => {
              const config = severityConfig[event.severity];
              const EventIcon = eventIcons[event.type] || ShieldAlert;
              const SevIcon = config.icon;
              return (
                <View key={event.id} style={[styles.eventCard, { borderLeftColor: config.color }]}>
                  <View style={[styles.eventIcon, { backgroundColor: config.bg }]}>
                    <EventIcon size={18} color={config.color} strokeWidth={2} />
                  </View>
                  <View style={styles.eventContent}>
                    <View style={styles.eventTop}>
                      <View style={[styles.severityBadge, { backgroundColor: config.bg }]}>
                        <SevIcon size={12} color={config.color} strokeWidth={2.5} />
                        <Text style={[styles.severityText, { color: config.color }]}>{config.label}</Text>
                      </View>
                      {event.resolved && (
                        <View style={styles.resolvedBadge}>
                          <CheckCircle2 size={12} color={Colors.success[400]} strokeWidth={2.5} />
                          <Text style={styles.resolvedText}>حل شده</Text>
                        </View>
                      )}
                    </View>
                    {event.description && <Text style={styles.eventDesc}>{event.description}</Text>}
                    <Text style={styles.eventTime}>{formatPersianDate(event.created_at)}</Text>
                    {!event.resolved && (
                      <Pressable style={styles.resolveBtn} onPress={() => resolve(event.id)}>
                        <Text style={styles.resolveBtnText}>علامت‌گذاری به عنوان حل شده</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {activeTab === 'contacts' && (
          <>
            <Text style={styles.sectionLabel}>مدیریت مخاطبین</Text>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={[styles.contactAvatar, { backgroundColor: contact.is_blocked ? Colors.error[500] + '20' : Colors.accent[500] + '20' }]}>
                  <Text style={[styles.contactAvatarText, { color: contact.is_blocked ? Colors.error[400] : Colors.accent[400] }]}>
                    {contact.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{toPersianDigits(contact.phone_number)}</Text>
                  {contact.last_contact && (
                    <Text style={styles.contactLast}>آخرین تماس: {timeAgo(contact.last_contact)}</Text>
                  )}
                </View>
                {contact.is_blocked ? (
                  <Pressable style={styles.unblockContactBtn} onPress={() => toggleContactBlock(contact.id, false)}>
                    <CheckCircle2 size={18} color={Colors.success[400]} strokeWidth={2} />
                  </Pressable>
                ) : (
                  <Pressable style={styles.blockContactBtn} onPress={() => toggleContactBlock(contact.id, true)}>
                    <XCircle size={18} color={Colors.error[400]} strokeWidth={2} />
                  </Pressable>
                )}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function SecurityRow({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <View style={styles.securityRow}>
      <View style={styles.securityRowLeft}>
        <Icon size={16} color={Colors.neutral[400]} strokeWidth={2} />
        <Text style={styles.securityRowLabel}>{label}</Text>
      </View>
      <View style={styles.securityRowRight}>
        <View style={[styles.securityDot, { backgroundColor: color }]} />
        <Text style={[styles.securityRowValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  loadingContainer: { flex: 1, backgroundColor: Colors.neutral[950], justifyContent: 'center', alignItems: 'center', direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },
  scoreCard: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.md },
  scoreTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  scoreIconWrap: { width: 56, height: 56, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  scoreLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: 'rgba(255,255,255,0.8)' },
  scoreValue: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.onColor, marginTop: 2 },
  scoreBar: { marginTop: Spacing.md },
  scoreBarTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreStatus: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: Spacing.sm, fontWeight: Typography.weights.medium },
  quickStatsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, marginBottom: Spacing.md },
  quickStat: { alignItems: 'center', gap: 4 },
  quickStatIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickStatValue: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  quickStatLabel: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[400] },
  sectionLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[300], marginBottom: Spacing.sm, marginTop: Spacing.sm, textAlign: 'right' },
  deviceSecurityCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, marginBottom: Spacing.md },
  securityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.neutral[800] },
  securityRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  securityRowLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[300] },
  securityRowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  securityDot: { width: 8, height: 8, borderRadius: 4 },
  securityRowValue: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  tabSelector: { flexDirection: 'row', backgroundColor: Colors.neutral[850], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.neutral[800], padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.accent[500] + '30' },
  tabText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.neutral[400] },
  tabTextActive: { color: Colors.accent[300] },
  eventCard: { flexDirection: 'row', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3 },
  eventIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  eventContent: { flex: 1, gap: 6 },
  eventTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  severityText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium },
  resolvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.success[500] + '20' },
  resolvedText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium, color: Colors.success[400] },
  eventDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[300], textAlign: 'right' },
  eventTime: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600] },
  resolveBtn: { alignSelf: 'flex-start', backgroundColor: Colors.accent[500] + '30', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: Colors.accent[400] + '50' },
  resolveBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium, color: Colors.accent[300] },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  contactAvatarText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  contactInfo: { flex: 1 },
  contactName: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  contactPhone: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400] },
  contactLast: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600], marginTop: 2 },
  blockContactBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.error[500] + '15', justifyContent: 'center', alignItems: 'center' },
  unblockContactBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.success[500] + '15', justifyContent: 'center', alignItems: 'center' },
});
