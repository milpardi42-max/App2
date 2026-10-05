import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Brain, CheckCircle2, ChevronLeft, Clock3, RefreshCw, Sparkles, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { AppBottomNav } from '@/components/AppBottomNav';
import { SENTENCE_LESSONS } from '@/lib/courseContent';
import { getCourseProgress, type CourseProgress } from '@/lib/courseProgress';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';
import { toPersianDigits } from '@/lib/format';

export default function ReviewHome() {
  const router = useRouter();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  useFocusEffect(useCallback(() => { void getCourseProgress().then(setProgress); }, []));

  const firstLesson = SENTENCE_LESSONS[0];
  const reviewCount = progress?.reviewSentenceIds.length || (progress?.completedLessonIds.length ? 5 : 0);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>مرور هوشمند</Text>
        <Text style={styles.subtitle}>فقط چیزهایی که واقعاً نیاز دارید</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.brain}><Brain size={34} color={Colors.accent[400]} /></View>
          <Text style={styles.summaryTitle}>{reviewCount ? `${toPersianDigits(reviewCount)} جمله برای مرور` : 'هنوز مروری ندارید'}</Text>
          <Text style={styles.summaryDesc}>{reviewCount ? 'حدود ۴ دقیقه زمان می‌برد. جمله‌های دشوار زودتر برمی‌گردند.' : 'پس از پایان اولین درس، جمله‌ها و لغات لازم اینجا نمایش داده می‌شوند.'}</Text>
          <Pressable
            style={[styles.startButton, !reviewCount && styles.disabled]}
            disabled={!reviewCount}
            onPress={() => router.push({ pathname: '/course/lesson', params: { id: firstLesson.id } } as never)}
          >
            <RefreshCw size={18} color={Colors.onColor} />
            <Text style={styles.startText}>شروع مرور امروز</Text>
          </Pressable>
          {reviewCount ? <View style={styles.time}><Clock3 size={13} color={Colors.neutral[500]} /><Text style={styles.timeText}>۴ دقیقه</Text></View> : null}
        </View>

        <Text style={styles.sectionTitle}>روش مرور</Text>
        <View style={styles.methodList}>
          <Method num="۱" title="جمله را به یاد بیاور" desc="ابتدا معنی یا موقعیت را می‌بینید." />
          <Method num="۲" title="پاسخ خود را بررسی کن" desc="جمله صحیح را بشنوید و مقایسه کنید." />
          <Method num="۳" title="میزان یادگیری را مشخص کن" desc="سیستم زمان مرور بعدی را تنظیم می‌کند." />
        </View>

        <Text style={styles.sectionTitle}>نمونه کارت مرور</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewTop}><Text style={styles.previewLabel}>جمله</Text><Pressable onPress={() => Speech.speak('Nice to meet you.', { language: 'en-US', rate: .78 })}><Volume2 size={20} color={Colors.primary[400]} /></Pressable></View>
          <Text style={styles.previewEn}>Nice to meet you.</Text>
          <Text style={styles.previewFa}>از آشنایی با شما خوشحالم.</Text>
          <View style={styles.vocabChip}><Sparkles size={13} color={Colors.warning[400]} /><Text style={styles.vocabText}>meet · ملاقات کردن</Text></View>
        </View>

        <View style={styles.note}><CheckCircle2 size={18} color={Colors.success[400]} /><Text style={styles.noteText}>لغات همیشه همراه جمله اصلی مرور می‌شوند؛ هیچ فهرست حفظی جداگانه‌ای نداریم.</Text></View>
      </ScrollView>
      <AppBottomNav />
    </View>
  );
}

function Method({ num, title, desc }: { num: string; title: string; desc: string }) {
  return <View style={styles.method}><View style={styles.methodNum}><Text style={styles.methodNumText}>{num}</Text></View><View style={styles.methodText}><Text style={styles.methodTitle}>{title}</Text><Text style={styles.methodDesc}>{desc}</Text></View><ChevronLeft size={17} color={Colors.neutral[700]} /></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral[950] },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, backgroundColor: Colors.neutral[900], borderBottomWidth: 1, borderBottomColor: Colors.neutral[800] },
  title: { fontFamily: Typography.fontFamily, fontSize: 26, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  subtitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], textAlign: 'right', marginTop: 3 },
  content: { padding: Spacing.md, paddingBottom: 28, gap: Spacing.md },
  summaryCard: { borderRadius: Radius.xl, padding: Spacing.xl, backgroundColor: Colors.neutral[850], borderWidth: 1, borderColor: Colors.accent[500] + '40', alignItems: 'center' },
  brain: { width: 74, height: 74, borderRadius: 37, backgroundColor: Colors.accent[500] + '15', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  summaryTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.neutral[100], textAlign: 'center' },
  summaryDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[500], textAlign: 'center', lineHeight: 22, marginTop: 6 },
  startButton: { width: '100%', minHeight: 50, borderRadius: Radius.lg, marginTop: Spacing.lg, backgroundColor: Colors.accent[500], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  startText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.onColor },
  disabled: { opacity: .4 },
  time: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 9 },
  timeText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500] },
  sectionTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[200], textAlign: 'right', marginTop: Spacing.sm },
  methodList: { borderRadius: Radius.xl, backgroundColor: Colors.neutral[900], borderWidth: 1, borderColor: Colors.neutral[800], overflow: 'hidden' },
  method: { minHeight: 72, padding: Spacing.md, flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral[850] },
  methodNum: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary[500] + '15', alignItems: 'center', justifyContent: 'center' },
  methodNumText: { fontFamily: Typography.fontFamily, color: Colors.primary[300], fontWeight: Typography.weights.bold },
  methodText: { flex: 1 },
  methodTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[200], textAlign: 'right' },
  methodDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[600], textAlign: 'right', marginTop: 3 },
  previewCard: { borderRadius: Radius.xl, padding: Spacing.lg, backgroundColor: Colors.neutral[850], borderWidth: 1, borderColor: Colors.neutral[800] },
  previewTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  previewLabel: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600] },
  previewEn: { fontSize: 22, fontWeight: '700', color: Colors.neutral[100], textAlign: 'center', marginTop: Spacing.md },
  previewFa: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[400], textAlign: 'center', marginTop: 7 },
  vocabChip: { alignSelf: 'center', flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: Radius.full, backgroundColor: Colors.warning[500] + '0F', paddingHorizontal: 10, paddingVertical: 6, marginTop: Spacing.md },
  vocabText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.warning[300] },
  note: { borderRadius: Radius.lg, backgroundColor: Colors.success[500] + '0D', padding: Spacing.md, flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8 },
  noteText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500], textAlign: 'right', lineHeight: 19 },
});
