// Welcome / role-picker — shown once on first launch.
// The same APK works as BOTH the manager panel (phone 1) and the reporting
// companion (phone 2); the user picks the role of THIS phone here.

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ShieldCheck, Smartphone, ChevronLeft, Sparkles } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { saveRole, type AppRole } from '@/lib/role';

export default function WelcomeScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState<AppRole | null>(null);

  const pick = async (role: AppRole) => {
    if (busy) return;
    setBusy(role);
    await saveRole(role);
    router.replace((role === 'agent' ? '/agent' : '/(tabs)') as never);
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <LinearGradient colors={[Colors.primary[600], Colors.accent[800]]} style={styles.logoWrap}>
          <ShieldCheck size={38} color={Colors.onColor} strokeWidth={2} />
        </LinearGradient>
        <Text style={styles.title}>کنترل گوشی</Text>
        <Text style={styles.subtitle}>
          یک برنامه — دو نقش. مشخص کنید این گوشی کدام است تا همیشه مستقیم وارد همان بخش شوید.
        </Text>
      </View>

      <View style={styles.cards}>
        <RoleCard
          colors={[Colors.primary[600], Colors.primary[800]]}
          icon={ShieldCheck}
          title="گوشی اول — پنل مدیریت"
          desc="همین گوشی مدیر است؛ گوشی‌های دوم را ببینید، کد اتصال بگیرید و وضعیت آن‌ها را زنده دنبال کنید"
          onPress={() => pick('dashboard')}
          loading={busy === 'dashboard'}
        />
        <RoleCard
          colors={[Colors.accent[500], Colors.accent[800]]}
          icon={Smartphone}
          title="گوشی دوم — ارسال وضعیت"
          desc="این گوشی به پنل مدیریت متصل می‌شود و وضعیت باتری، اینترنت، حافظه و موقعیت خود را گزارش می‌دهد"
          onPress={() => pick('agent')}
          loading={busy === 'agent'}
        />
      </View>

      <View style={styles.footer}>
        <Sparkles size={14} color={Colors.neutral[500]} strokeWidth={2} />
        <Text style={styles.footerText}>این انتخاب فقط یک بار پرسیده می‌شود و بعداً قابل تغییر است</Text>
      </View>
    </View>
  );
}

function RoleCard({
  colors,
  icon: Icon,
  title,
  desc,
  onPress,
  loading,
}: {
  colors: [string, string];
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress} disabled={loading}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
        <View style={styles.cardIconWrap}>
          <Icon size={30} color={Colors.onColor} strokeWidth={2} />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>
        <View style={styles.cardChevron}>
          <ChevronLeft size={22} color="rgba(255,255,255,0.9)" strokeWidth={2.4} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
    direction: 'rtl',
    padding: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxl + 24,
  },
  top: { alignItems: 'center', marginTop: Spacing.xxl },
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[400],
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },

  cards: { gap: Spacing.md },
  card: { borderRadius: Radius.xl, overflow: 'hidden' },
  cardGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
    textAlign: 'right',
  },
  cardDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
    marginTop: 4,
    lineHeight: 20,
  },
  cardChevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
});
