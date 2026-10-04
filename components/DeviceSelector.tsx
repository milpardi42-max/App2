import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { ChevronDown, Smartphone, Plus, X, CheckCircle2, Wifi, WifiOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { useDeviceContext } from '@/lib/DeviceContext';
import { supabase } from '@/lib/supabase';
import { toPersianDigits } from '@/lib/format';
import type { Device } from '@/lib/types';

export function DeviceSelector() {
  const { devices, selectedDeviceId, setSelectedDeviceId, reload } = useDeviceContext();
  const [open, setOpen] = useState(false);
  const [pairModal, setPairModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newDevicePhone, setNewDevicePhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const handleCreateDevice = useCallback(async () => {
    if (!newDeviceName.trim()) {
      setError('نام دستگاه را وارد کنید');
      return;
    }
    setSubmitting(true);
    setError('');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error: insertError } = await supabase
      .from('devices')
      .insert({
        device_name: newDeviceName,
        device_model: newDeviceModel || null,
        phone_number: newDevicePhone || null,
        pairing_code: code,
        is_paired: false,
        is_online: false,
      })
      .select('*')
      .single();

    if (insertError || !data) {
      setError('خطا در ایجاد دستگاه. دوباره تلاش کنید.');
      setSubmitting(false);
      return;
    }

    setGeneratedCode(code);
    setSubmitting(false);
    reload();
  }, [newDeviceName, newDeviceModel, newDevicePhone, reload]);

  const handleFinishPair = () => {
    setPairModal(false);
    setNewDeviceName('');
    setNewDeviceModel('');
    setNewDevicePhone('');
    setGeneratedCode('');
    setError('');
  };

  return (
    <>
      <Pressable style={styles.selector} onPress={() => setOpen(!open)}>
        <View style={styles.selectorLeft}>
          <View style={styles.deviceIcon}>
            <Smartphone size={16} color={Colors.accent[400]} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.deviceName} numberOfLines={1}>
              {selectedDevice?.device_name || 'دستگاهی انتخاب نشده'}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: selectedDevice?.is_online ? Colors.success[400] : Colors.neutral[500] }]} />
              <Text style={styles.statusText}>
                {selectedDevice?.is_online ? 'آنلاین' : 'آفلاین'}
              </Text>
            </View>
          </View>
        </View>
        <ChevronDown size={18} color={Colors.neutral[400]} strokeWidth={2} />
      </Pressable>

      {/* Device Dropdown */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>انتخاب دستگاه</Text>
              <Pressable onPress={() => setOpen(false)}>
                <X size={20} color={Colors.neutral[400]} strokeWidth={2} />
              </Pressable>
            </View>
            {devices.map((device) => (
              <Pressable
                key={device.id}
                style={[styles.deviceItem, device.id === selectedDeviceId && styles.deviceItemActive]}
                onPress={() => { setSelectedDeviceId(device.id); setOpen(false); }}
              >
                <View style={styles.deviceItemLeft}>
                  <View style={[styles.deviceItemIcon, { backgroundColor: device.is_online ? Colors.success[500] + '20' : Colors.neutral[700] }]}>
                    {device.is_online ? (
                      <Wifi size={16} color={Colors.success[400]} strokeWidth={2} />
                    ) : (
                      <WifiOff size={16} color={Colors.neutral[500]} strokeWidth={2} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.deviceItemName}>{device.device_name}</Text>
                    <Text style={styles.deviceItemModel}>{device.device_model || 'نامشخص'}</Text>
                  </View>
                </View>
                {device.id === selectedDeviceId && (
                  <CheckCircle2 size={18} color={Colors.accent[400]} strokeWidth={2} />
                )}
              </Pressable>
            ))}
            <Pressable style={styles.addDeviceBtn} onPress={() => { setOpen(false); setPairModal(true); }}>
              <Plus size={18} color={Colors.accent[400]} strokeWidth={2} />
              <Text style={styles.addDeviceText}>افزودن دستگاه جدید</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Pair New Device Modal */}
      <Modal visible={pairModal} transparent animationType="fade" onRequestClose={() => setPairModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => !generatedCode && setPairModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {generatedCode ? 'کد جفت‌سازی' : 'افزودن دستگاه جدید'}
              </Text>
              <Pressable onPress={() => { setPairModal(false); handleFinishPair(); }}>
                <X size={22} color={Colors.neutral[400]} strokeWidth={2} />
              </Pressable>
            </View>

            {generatedCode ? (
              <View style={styles.codeDisplay}>
                <Text style={styles.codeDisplayLabel}>کد زیر را در گوشی دوم وارد کنید:</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{toPersianDigits(generatedCode)}</Text>
                </View>
                <Text style={styles.codeHint}>
                  این کد را در برنامه گوشی دوم، در بخش جفت‌سازی وارد کنید تا دستگاه به پنل مدیریت متصل شود.
                </Text>
                <Pressable style={styles.doneBtn} onPress={handleFinishPair}>
                  <LinearGradient colors={[Colors.accent[500], Colors.accent[700]]} style={styles.doneBtnGradient}>
                    <Text style={styles.doneBtnText}>تایید و بستن</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>نام دستگاه *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="مثلاً: گوشی دوم من"
                    placeholderTextColor={Colors.neutral[500]}
                    value={newDeviceName}
                    onChangeText={setNewDeviceName}
                    textAlign="right"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>مدل دستگاه</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="مثلاً: Samsung Galaxy A52"
                    placeholderTextColor={Colors.neutral[500]}
                    value={newDeviceModel}
                    onChangeText={setNewDeviceModel}
                    textAlign="right"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>شماره تلفن</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="09123456789"
                    placeholderTextColor={Colors.neutral[500]}
                    value={newDevicePhone}
                    onChangeText={setNewDevicePhone}
                    keyboardType="numeric"
                    textAlign="right"
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Pressable style={styles.createBtn} onPress={handleCreateDevice} disabled={submitting}>
                  <LinearGradient colors={[Colors.accent[500], Colors.accent[700]]} style={styles.createBtnGradient}>
                    {submitting ? (
                      <ActivityIndicator size="small" color={Colors.onColor} />
                    ) : (
                      <Text style={styles.createBtnText}>ایجاد و دریافت کد جفت‌سازی</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  deviceIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.accent[500] + '20', justifyContent: 'center', alignItems: 'center' },
  deviceName: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[400] },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, direction: 'rtl' },
  dropdown: { backgroundColor: Colors.neutral[850], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.md, width: '100%', maxWidth: 400 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  dropdownTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  deviceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: Radius.md, marginBottom: 4 },
  deviceItemActive: { backgroundColor: Colors.accent[500] + '15' },
  deviceItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deviceItemIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deviceItemName: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  deviceItemModel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400] },
  addDeviceBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.neutral[800], justifyContent: 'center' },
  addDeviceText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: Colors.accent[400] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, direction: 'rtl' },
  modalContent: { backgroundColor: Colors.neutral[850], borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.neutral[800], padding: Spacing.lg, width: '100%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.neutral[300], marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.neutral[900], borderRadius: Radius.md, padding: Spacing.md, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[0], borderWidth: 1, borderColor: Colors.neutral[800], textAlign: 'right' },
  errorText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.error[400], marginBottom: Spacing.sm },
  createBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  createBtnGradient: { justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.md },
  createBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.onColor },
  codeDisplay: { alignItems: 'center' },
  codeDisplayLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Colors.neutral[300], marginBottom: Spacing.lg, textAlign: 'center' },
  codeBox: { backgroundColor: Colors.neutral[900], borderRadius: Radius.lg, paddingVertical: Spacing.xl, paddingHorizontal: Spacing.xxl, borderWidth: 2, borderColor: Colors.accent[500] + '50', marginBottom: Spacing.lg },
  codeText: { fontFamily: Typography.fontFamily, fontSize: 42, fontWeight: Typography.weights.bold, color: Colors.accent[400], letterSpacing: 8 },
  codeHint: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  doneBtn: { borderRadius: Radius.md, overflow: 'hidden', width: '100%' },
  doneBtnGradient: { justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.md },
  doneBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.onColor },
});
