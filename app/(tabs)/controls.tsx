import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Pressable, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Command,
  Lock,
  MapPin,
  Camera,
  Volume2,
  Sun,
  BellRing,
  MessageSquare,
  Trash2,
  RefreshCw,
  Shield,
  Cloud,
  Plane,
  BellOff,
  Power,
  CheckCircle2,
  Clock,
  Send,
  X,
  Eye,
  MonitorSmartphone,
} from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { useRemoteCommands, useSettings } from '@/lib/useData';
import { useDeviceContext } from '@/lib/DeviceContext';
import { toPersianDigits, timeAgo } from '@/lib/format';
import type { CommandType } from '@/lib/types';
import { LucideIcon } from 'lucide-react-native';

interface QuickCommand {
  type: CommandType;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: [string, string];
  needsParam?: boolean;
}

const quickCommands: QuickCommand[] = [
  { type: 'lock', label: 'قفل دستگاه', description: 'قفل فوری دستگاه از راه دور', icon: Lock, gradient: [Colors.error[500], Colors.error[700]] },
  { type: 'location', label: 'موقعیت', description: 'گرفتن موقعیت مکانی', icon: MapPin, gradient: [Colors.accent[500], Colors.accent[700]] },
  { type: 'screenshot', label: 'اسکرین‌شات', description: 'گرفتن عکس از صفحه', icon: Camera, gradient: [Colors.primary[500], Colors.primary[700]] },
  { type: 'ring', label: 'به صدا درآوردن', description: 'به صدا درآوردن دستگاه', icon: BellRing, gradient: [Colors.warning[500], Colors.warning[700]] },
  { type: 'scan', label: 'اسکن امنیتی', description: 'اسکن کامل دستگاه', icon: Shield, gradient: [Colors.success[500], Colors.success[700]] },
  { type: 'backup', label: 'پشتیبان‌گیری', description: 'پشتیبان‌گیری کامل', icon: Cloud, gradient: [Colors.primary[400], Colors.primary[600]] },
  { type: 'clear_cache', label: 'پاکسازی حافظه', description: 'پاک کردن حافظه پنهان', icon: RefreshCw, gradient: [Colors.accent[400], Colors.accent[600]] },
  { type: 'reboot', label: 'راه‌اندازی مجدد', description: 'ری‌استارت دستگاه', icon: Power, gradient: [Colors.neutral[400], Colors.neutral[200]] },
];

const statusConfig: Record<string, { color: string; label: string; icon: LucideIcon }> = {
  pending: { color: Colors.warning[400], label: 'در انتظار', icon: Clock },
  executing: { color: Colors.accent[400], label: 'در حال اجرا', icon: RefreshCw },
  completed: { color: Colors.success[400], label: 'موففق', icon: CheckCircle2 },
  failed: { color: Colors.error[400], label: 'ناموفق', icon: X },
};

const commandLabels: Record<string, string> = {
  lock: 'قفل دستگاه',
  wipe: 'پاک کردن کامل',
  reboot: 'راه‌اندازی مجدد',
  screenshot: 'اسکرین‌شات',
  location: 'گرفتن موقعیت',
  ring: 'به صدا درآوردن',
  message: 'نمایش پیام',
  block_app: 'مسدود کردن برنامه',
  unblock_app: 'آزاد کردن برنامه',
  clear_cache: 'پاکسازی حافظه',
  backup: 'پشتیبان‌گیری',
  scan: 'اسکن امنیتی',
  airplane_mode: 'حالت پرواز',
  brightness: 'تنظیم روشنایی',
  volume: 'تنظیم صدا',
  install_app: 'نصب برنامه',
  uninstall_app: 'حذف برنامه',
};

export default function ControlsScreen() {
  const router = useRouter();
  const { selectedDeviceId } = useDeviceContext();
  const { data: commands, loading, sendCommand, reload } = useRemoteCommands(selectedDeviceId);
  const { settings, toggle } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [brightnessModal, setBrightnessModal] = useState(false);
  const [brightnessValue, setBrightnessValue] = useState('50');

  const onRefresh = () => { setRefreshing(true); reload(); setRefreshing(false); };

  const handleCommand = (cmd: QuickCommand) => {
    if (cmd.type === 'message') {
      setMessageModal(true);
      return;
    }
    if (cmd.type === 'brightness') {
      setBrightnessModal(true);
      return;
    }
    sendCommand(cmd.type);
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      sendCommand('message', { text: messageText });
      setMessageText('');
      setMessageModal(false);
    }
  };

  const sendBrightness = () => {
    sendCommand('brightness', { level: parseInt(brightnessValue) });
    setBrightnessModal(false);
  };

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
      <ScreenHeader title="کنترل از راه دور" subtitle="ارسال دستور و مدیریت دستگاه" icon={Command} />

      <View style={styles.body}>
        {/* The only additive controller surface needed for live phone-2 video. */}
        <Pressable
          style={[styles.liveScreenBtn, !selectedDeviceId && styles.liveScreenBtnDisabled]}
          disabled={!selectedDeviceId}
          onPress={() => router.push('/remote-screen' as never)}
        >
          <LinearGradient
            colors={[Colors.primary[500], Colors.accent[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.liveScreenIcon}
          >
            <MonitorSmartphone size={25} color={Colors.onColor} strokeWidth={2.1} />
          </LinearGradient>
          <View style={styles.liveScreenTextWrap}>
            <Text style={styles.liveScreenTitle}>نمایش زنده گوشی دوم</Text>
            <Text style={styles.liveScreenDesc}>
              {selectedDeviceId ? 'مشاهده صفحه با اجازه مستقیم گوشی دوم' : 'ابتدا یک گوشی متصل را انتخاب کنید'}
            </Text>
          </View>
          <Eye size={19} color={Colors.primary[300]} strokeWidth={2.1} />
        </Pressable>

        {/* Quick Commands Grid */}
        <Text style={styles.sectionLabel}>دستورات سریع</Text>
        <View style={styles.commandsGrid}>
          {quickCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <Pressable
                key={cmd.type}
                style={styles.commandCard}
                onPress={() => handleCommand(cmd)}
              >
                <LinearGradient colors={cmd.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.commandIcon}>
                  <Icon size={22} color={Colors.onColor} strokeWidth={2} />
                </LinearGradient>
                <Text style={styles.commandLabel}>{cmd.label}</Text>
                <Text style={styles.commandDesc} numberOfLines={1}>{cmd.description}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionLabel}>منطقه خطر</Text>
        <View style={styles.dangerRow}>
          <Pressable
            style={styles.dangerBtn}
            onPress={() => sendCommand('wipe')}
          >
            <Trash2 size={20} color={Colors.error[400]} strokeWidth={2} />
            <Text style={styles.dangerLabel}>پاک کردن کامل</Text>
          </Pressable>
          <Pressable
            style={styles.dangerBtn}
            onPress={() => sendCommand('message')}
          >
            <MessageSquare size={20} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.dangerLabel}>نمایش پیام</Text>
          </Pressable>
        </View>

        {/* Toggle Controls */}
        <Text style={styles.sectionLabel}>تنظیمات دستگاه</Text>
        <View style={styles.toggleList}>
          <ToggleRow
            icon={Plane}
            label="حالت پرواز"
            description="قطع تمام ارتباطات بی‌سیم"
            gradient={[Colors.primary[400], Colors.primary[600]]}
            isEnabled={settings.airplane_mode === 'true'}
            onToggle={() => toggle('airplane_mode')}
          />
          <ToggleRow
            icon={BellOff}
            label="مزاحم نشوید"
            description="قطع اعلان‌ها و تماس‌ها"
            gradient={[Colors.neutral[400], Colors.neutral[200]]}
            isEnabled={settings.do_not_disturb === 'true'}
            onToggle={() => toggle('do_not_disturb')}
          />
          <ToggleRow
            icon={Eye}
            label="مانیتورینگ برنامه‌ها"
            description="نظارت بر فعالیت برنامه‌ها"
            gradient={[Colors.accent[500], Colors.accent[700]]}
            isEnabled={settings.app_monitoring === 'true'}
            onToggle={() => toggle('app_monitoring')}
          />
          <ToggleRow
            icon={Shield}
            label="مسدودسازی تماس"
            description="مسدود کردن تماس‌های ناخواسته"
            gradient={[Colors.warning[500], Colors.warning[700]]}
            isEnabled={settings.call_blocking === 'true'}
            onToggle={() => toggle('call_blocking')}
          />
          <ToggleRow
            icon={Cloud}
            label="پشتیبان‌گیری خودکار"
            description="پشتیبان‌گیری خودکار از داده‌ها"
            gradient={[Colors.success[500], Colors.success[700]]}
            isEnabled={settings.auto_backup === 'true'}
            onToggle={() => toggle('auto_backup')}
          />
        </View>

        {/* Command History */}
        <Text style={styles.sectionLabel}>تاریخچه دستورات</Text>
        {commands.length === 0 ? (
          <View style={styles.emptyState}>
            <Command size={36} color={Colors.neutral[600]} strokeWidth={1.5} />
            <Text style={styles.emptyText}>هیچ دستوری ارسال نشده</Text>
          </View>
        ) : (
          commands.map((cmd) => {
            const config = statusConfig[cmd.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <View key={cmd.id} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyStatus, { backgroundColor: config.color + '20' }]}>
                    <StatusIcon size={16} color={config.color} strokeWidth={2} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyCommand}>{commandLabels[cmd.command_type] || cmd.command_type}</Text>
                    {cmd.result && <Text style={styles.historyResult} numberOfLines={2}>{cmd.result}</Text>}
                    <Text style={styles.historyTime}>{timeAgo(cmd.created_at)}</Text>
                  </View>
                </View>
                <View style={[styles.historyStatusBadge, { backgroundColor: config.color + '20' }]}>
                  <Text style={[styles.historyStatusText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Message Modal */}
      <Modal visible={messageModal} transparent animationType="fade" onRequestClose={() => setMessageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>نمایش پیام روی دستگاه</Text>
              <Pressable onPress={() => setMessageModal(false)}>
                <X size={22} color={Colors.neutral[400]} strokeWidth={2} />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="متن پیام را وارد کنید..."
              placeholderTextColor={Colors.neutral[500]}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              textAlign="right"
            />
            <Pressable style={styles.modalSendBtn} onPress={sendMessage}>
              <LinearGradient colors={[Colors.accent[500], Colors.accent[700]]} style={styles.modalSendGradient}>
                <Send size={18} color={Colors.onColor} strokeWidth={2} />
                <Text style={styles.modalSendText}>ارسال پیام</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Brightness Modal */}
      <Modal visible={brightnessModal} transparent animationType="fade" onRequestClose={() => setBrightnessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تنظیم روشنایی صفحه</Text>
              <Pressable onPress={() => setBrightnessModal(false)}>
                <X size={22} color={Colors.neutral[400]} strokeWidth={2} />
              </Pressable>
            </View>
            <View style={styles.brightnessRow}>
              <Sun size={20} color={Colors.warning[400]} strokeWidth={2} />
              <TextInput
                style={styles.brightnessInput}
                value={brightnessValue}
                onChangeText={setBrightnessValue}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={styles.brightnessPct}>٪</Text>
            </View>
            <Pressable style={styles.modalSendBtn} onPress={sendBrightness}>
              <LinearGradient colors={[Colors.accent[500], Colors.accent[700]]} style={styles.modalSendGradient}>
                <Text style={styles.modalSendText}>اعمال</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function ToggleRow({ icon: Icon, label, description, gradient, isEnabled, onToggle }: {
  icon: LucideIcon;
  label: string;
  description: string;
  gradient: [string, string];
  isEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.toggleCard}>
      <View style={styles.toggleLeft}>
        <LinearGradient colors={gradient} style={styles.toggleIcon}>
          <Icon size={18} color={Colors.onColor} strokeWidth={2} />
        </LinearGradient>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleDesc}>{description}</Text>
        </View>
      </View>
      <Pressable style={[styles.toggle, isEnabled ? styles.toggleOn : styles.toggleOff]} onPress={onToggle}>
        <View style={[styles.toggleKnob, isEnabled ? styles.knobOn : styles.knobOff]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  loadingContainer: { flex: 1, backgroundColor: Colors.neutral[950], justifyContent: 'center', alignItems: 'center', direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },
  liveScreenBtn: {
    minHeight: 82,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.primary[500] + '55',
    backgroundColor: Colors.primary[500] + '10',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  liveScreenBtnDisabled: { opacity: 0.5 },
  liveScreenIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  liveScreenTextWrap: { flex: 1 },
  liveScreenTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'right',
  },
  liveScreenDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
    textAlign: 'right',
    marginTop: 4,
  },
  sectionLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[300], marginBottom: Spacing.sm, marginTop: Spacing.sm, textAlign: 'right' },
  commandsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: Spacing.md },
  commandCard: { width: '48%', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, alignItems: 'center', gap: 6 },
  commandIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  commandLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  commandDesc: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500], textAlign: 'center' },
  dangerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  dangerBtn: { flex: 1, backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.error[500] + '30' },
  dangerLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.neutral[300] },
  toggleList: { gap: Spacing.sm, marginBottom: Spacing.md },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  toggleIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  toggleDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400], marginTop: 2, textAlign: 'right' },
  toggle: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: Colors.accent[500] },
  toggleOff: { backgroundColor: Colors.neutral[700] },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.onColor },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
  historyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, marginBottom: Spacing.sm },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  historyStatus: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { flex: 1 },
  historyCommand: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  historyResult: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400], marginTop: 2, textAlign: 'right' },
  historyTime: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600], marginTop: 2 },
  historyStatusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  historyStatusText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: Spacing.md },
  emptyText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[500] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, direction: 'rtl' },
  modalContent: { backgroundColor: Colors.neutral[850], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.lg, width: '100%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  modalInput: { backgroundColor: Colors.neutral[900], borderRadius: Radius.md, padding: Spacing.md, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[0], minHeight: 80, borderWidth: 1, borderColor: Colors.neutral[800], textAlign: 'right' },
  modalSendBtn: { marginTop: Spacing.md, borderRadius: Radius.md, overflow: 'hidden' },
  modalSendGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  modalSendText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.onColor },
  brightnessRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.neutral[900], borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  brightnessInput: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'center' },
  brightnessPct: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, color: Colors.neutral[400] },
});
