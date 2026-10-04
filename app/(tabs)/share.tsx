// "دریافت" tab — everything about getting app 2 (گوشی دوم) onto the other
// phone: the real APK download (QR + link), the pairing-code entry point,
// and quick access to the built-in English learning app.

import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Share, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Smartphone,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Link2,
  Package,
  Zap,
  KeyRound,
  GraduationCap,
} from 'lucide-react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { toPersianDigits } from '@/lib/format';
import { isSupabaseConfigured } from '@/lib/pairing';
import { clearRole } from '@/lib/role';

// The SAME APK file is installed on both phones — on first launch each phone
// picks its own role (panel vs. companion). The link opens the official
// downloads page where the newest file is always on top.
const RELEASES_URL = 'https://github.com/milpardi42-max/App1/releases';
const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=';

export default function ShareScreen() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const qrUrl = `${QR_API}${encodeURIComponent(RELEASES_URL)}`;

  const handleDownload = useCallback(() => {
    Linking.openURL(RELEASES_URL).catch(() => {
      // If the URL can't be opened, sharing still works as a fallback.
    });
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `اپلیکیشن «کنترل گوشی» را دانلود و نصب کنید؛ بعد از اولین اجرا نقش گوشی را انتخاب می‌کنید:\n${RELEASES_URL}`,
      });
    } catch {
      // noop
    }
  }, []);

  const switchRole = useCallback(async () => {
    await clearRole();
    router.replace('/welcome' as never);
  }, [router]);

  return (
    <ScrollView style={styles.screen}>
      <ScreenHeader
        title="دریافت اپ گوشی دوم"
        subtitle="نصب و اتصال برنامه روی گوشی دوم"
        icon={Smartphone}
      />

      <View style={styles.body}>
        {/* Hero */}
        <LinearGradient
          colors={[Colors.primary[600], Colors.accent[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconWrap}>
            <Smartphone size={32} color={Colors.onColor} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>برنامه گوشی دوم</Text>
          <Text style={styles.heroDesc}>
            همین یک فایل را روی گوشی دوم هم نصب کنید — خودش می‌پرسد کدام نقش را دارد و بعد وضعیت آن گوشی (باتری، اینترنت، حافظه، موقعیت مکانی…) را زنده به همین پنل می‌فرستد
          </Text>
        </LinearGradient>

        {/* Pairing code — the TV-style connection */}
        <Pressable style={styles.pairBtn} onPress={() => router.push('/pair' as never)}>
          <LinearGradient
            colors={[Colors.accent[500], Colors.accent[800]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pairBtnGradient}
          >
            <KeyRound size={22} color={Colors.onColor} strokeWidth={2.4} />
            <Text style={styles.pairBtnText}>نمایش کد اتصال (جفت‌سازی)</Text>
          </LinearGradient>
        </Pressable>

        {!configured && (
          <View style={styles.noticeCard}>
            <Zap size={16} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.noticeText}>
              برای اتصال واقعی دو گوشی، سرور باید فعال شود؛ بعد از فعال‌سازی، کد اتصال کار می‌کند.
            </Text>
          </View>
        )}

        {/* QR download */}
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <QrCode size={20} color={Colors.accent[400]} strokeWidth={2} />
            <Text style={styles.qrTitle}>دانلود با اسکن</Text>
          </View>
          <Text style={styles.qrDesc}>
            با دوربین گوشی دوم، این QR کد را اسکن کنید تا صفحه‌ی دانلود باز شود و فایل نصب را بگیرید
          </Text>
          <View style={styles.qrWrap}>
            <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
          </View>
          <View style={styles.qrBadge}>
            <Zap size={14} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.qrBadgeText}>فایل واقعی و رسمی — همیشه آخرین نسخه</Text>
          </View>
        </View>

        {/* Download + share actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={handleDownload}>
            <Download size={18} color={Colors.primary[400]} strokeWidth={2.2} />
            <Text style={styles.actionBtnText}>دانلود فایل</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <Share2 size={18} color={Colors.success[400]} strokeWidth={2.2} />
            <Text style={styles.actionBtnText}>ارسال لینک برای دیگران</Text>
          </Pressable>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>مراحل اتصال گوشی دوم</Text>
          <StepItem
            num={1}
            icon={QrCode}
            title="دانلود و نصب"
            desc="QR کد بالا را با گوشی دوم اسکن کنید یا لینک را برای آن بفرستید و فایل را نصب کنید"
          />
          <StepItem
            num={2}
            icon={Smartphone}
            title="انتخاب نقش"
            desc="در اولین اجرا روی گوشی دوم گزینه‌ی «گوشی دوم — ارسال وضعیت» را انتخاب کنید"
          />
          <StepItem
            num={3}
            icon={Link2}
            title="شروع اتصال"
            desc="روی گوشی دوم دکمه‌ی «اتصال به گوشی اول» را بزنید"
          />
          <StepItem
            num={4}
            icon={KeyRound}
            title="وارد کردن کد"
            desc="در همین گوشی «نمایش کد اتصال» را بزنید؛ کد ۶ رقمی را در گوشی دوم وارد کنید (یا QR آن را اسکن کنید)"
          />
          <StepItem
            num={5}
            icon={CheckCircle2}
            title="تأیید و اتصال"
            desc="درخواست اتصال روی همین گوشی می‌آید؛ با «تأیید»، ارسال اطلاعات زنده شروع می‌شود"
          />
        </View>

        {/* English learning entry */}
        <Pressable style={styles.langCard} onPress={() => router.push('/lang' as never)}>
          <LinearGradient
            colors={['#8b5cf6', '#5b21b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.langIconWrap}
          >
            <GraduationCap size={24} color={Colors.onColor} strokeWidth={2} />
          </LinearGradient>
          <View style={styles.langTextWrap}>
            <Text style={styles.langTitle}>آموزش زبان انگلیسی</Text>
            <Text style={styles.langDesc}>۱۲ درس واژه با فلش‌کارت، تلفظ صوتی و آزمون</Text>
          </View>
        </Pressable>

        {/* Agent features */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Package size={18} color={Colors.warning[400]} strokeWidth={2} />
            <Text style={styles.infoTitle}>امکانات برنامه گوشی دوم</Text>
          </View>
          <FeatureItem icon={Zap} text="یک فایل برای همه — قابل اشتراک‌گذاری برای هر کسی؛ هر گوشی نقش خودش را انتخاب می‌کند" />
          <FeatureItem icon={Link2} text="اتصال آسان با کد ۶ رقمی یا اسکن QR — مثل اتصال به تلویزیون هوشمند" />
          <FeatureItem icon={Smartphone} text="ارسال زنده‌ی وضعیت باتری، اینترنت، حافظه و موقعیت مکانی" />
          <FeatureItem icon={CheckCircle2} text="نمایش پیام و اجرای دستورات پنل مدیریت روی گوشی دوم" />
        </View>

        <Pressable onPress={switchRole} hitSlop={10} style={styles.switchRoleWrap}>
          <Text style={styles.switchRoleText}>تغییر نقش این گوشی (نمایش دوباره‌ی صفحه‌ی انتخاب)</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function StepItem({ num, icon: Icon, title, desc }: { num: number; icon: typeof QrCode; title: string; desc: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepLeft}>
        <View style={styles.stepNumWrap}>
          <Text style={styles.stepNum}>{toPersianDigits(num)}</Text>
        </View>
        <View style={styles.stepConnector} />
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Icon size={16} color={Colors.accent[400]} strokeWidth={2} />
          <Text style={styles.stepTitle}>{title}</Text>
        </View>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: typeof Zap; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Icon size={14} color={Colors.success[400]} strokeWidth={2} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  body: { padding: Spacing.md, paddingBottom: 100 },

  heroCard: { borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  heroIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  heroTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.onColor, textAlign: 'center' },
  heroDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },

  pairBtn: { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.md },
  pairBtnGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: Spacing.md + 2,
  },
  pairBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.onColor },

  noticeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning[500] + '12',
    borderWidth: 1,
    borderColor: Colors.warning[500] + '45',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  noticeText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.warning[400], lineHeight: 20, textAlign: 'right' },

  qrCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  qrHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  qrTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  qrDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
  qrWrap: { backgroundColor: Colors.onColor, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  qrImage: { width: 210, height: 210 },
  qrBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.warning[500] + '15', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  qrBadgeText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.warning[400], fontWeight: Typography.weights.medium },

  actionsRow: { flexDirection: 'row-reverse', gap: Spacing.sm, marginBottom: Spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  actionBtnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[100], fontWeight: Typography.weights.bold },

  stepsCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  stepsTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0], marginBottom: Spacing.lg },
  stepItem: { flexDirection: 'row-reverse', marginBottom: Spacing.md },
  stepLeft: { alignItems: 'center', marginLeft: Spacing.md },
  stepNumWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent[500] + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.accent[500] + '40' },
  stepNum: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.accent[400] },
  stepConnector: { width: 2, flex: 1, backgroundColor: Colors.neutral[800], marginTop: 4, minHeight: 20 },
  stepContent: { flex: 1, paddingBottom: Spacing.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  stepTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  stepDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], lineHeight: 20, textAlign: 'right' },

  langCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  langIconWrap: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  langTextWrap: { flex: 1 },
  langTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  langDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400], textAlign: 'right', marginTop: 2 },

  switchRoleWrap: { alignItems: 'center', paddingVertical: Spacing.sm },
  switchRoleText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    textDecorationLine: 'underline',
  },

  infoCard: { backgroundColor: Colors.neutral[850], borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral[800] },
  infoHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  infoTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  featureItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  featureIconWrap: { width: 24, height: 24, borderRadius: 6, backgroundColor: Colors.success[500] + '15', justifyContent: 'center', alignItems: 'center' },
  featureText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[300], flex: 1, lineHeight: 20, textAlign: 'right' },
});
