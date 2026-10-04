// English-learning mini-app ("app 2"): today's home.
// Kept fully separate from app 1 — this file is the only thing that owns this screen.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Flame,
  GraduationCap,
  BookOpenCheck,
  CalendarCheck2,
  Sparkles,
  LockOpen,
  Lock,
  Play,
  ArrowLeft,
  ClipboardList,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/lib/theme';
import { toPersianDigits } from '@/lib/format';
import { LESSONS, TOTAL_WORDS, type LangWord } from '@/lib/langContent';
import { getContinueLessonId, getLessonMastery, getOverview, type Overview } from '@/lib/langProgress';
import { AgentTopBar, LESSON_ICONS, ProgressBar, SpeakButton } from '@/components/LangShared';

function wordOfTheDay(): LangWord {
  const day = Math.floor(Date.now() / 86_400_000);
  const flat = LESSONS.flatMap((l) => l.words);
  return flat[day % flat.length];
}

export default function AgentHome() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [continueId, setContinueId] = useState(1);
  const [masteryMap, setMasteryMap] = useState<Record<number, number[]>>({});
  const today = wordOfTheDay();

  const reload = useCallback(async () => {
    const [o, cid] = await Promise.all([getOverview(), getContinueLessonId()]);
    setOverview(o);
    setContinueId(cid);
    const entries = await Promise.all(LESSONS.map(async (l) => [l.id, await getLessonMastery(l.id)] as const));
    setMasteryMap(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const continueLesson = useMemo(() => LESSONS.find((l) => l.id === continueId) ?? LESSONS[0], [continueId]);

  const openQuiz = (lessonId: number) => {
    router.push({ pathname: '/lang/quiz', params: { lessonId: String(lessonId) } } as never);
  };
  const openLesson = (lessonId: number) => {
    router.push({ pathname: '/lang/lesson', params: { lessonId: String(lessonId) } } as never);
  };

  return (
    <View style={styles.root}>
      <AgentTopBar title="آموزش زبان انگلیسی" subtitle="با ۱۲ درس و ۱۴۴ واژه‌ی پرکاربرد" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero — greeting + streak + XP */}
        <LinearGradient colors={[Colors.primary[600], Colors.primary[800]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroHello}>سلام، زبان‌آموز عزیز 👋</Text>
              <Text style={styles.heroSub}>هر روز چند واژه تازه — زبانت هر روز بهتر می‌شود</Text>
            </View>
            <View style={styles.heroBadge}>
              <Flame size={20} color={Colors.warning[400]} strokeWidth={2.5} />
              <Text style={styles.heroBadgeValue}>{toPersianDigits(overview?.streak ?? 0)}</Text>
              <Text style={styles.heroBadgeLabel}>روز متوالی</Text>
            </View>
          </View>
          <View style={styles.heroXpRow}>
            <View style={styles.heroXpChip}>
              <Sparkles size={14} color={Colors.accent[400]} strokeWidth={2.5} />
              <Text style={styles.heroXpText}>{toPersianDigits(overview?.xp ?? 0)} امتیاز</Text>
            </View>
            <View style={styles.heroXpChip}>
              <BookOpenCheck size={14} color={Colors.success[400]} strokeWidth={2.5} />
              <Text style={styles.heroXpText}>
                {toPersianDigits(overview?.wordsMastered ?? 0)} از {toPersianDigits(TOTAL_WORDS)} واژه یاد گرفته
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Word of the day */}
        <View style={styles.wotCard}>
          <View style={styles.wotHeader}>
            <CalendarCheck2 size={16} color={Colors.accent[500]} strokeWidth={2.3} />
            <Text style={styles.wotHeaderText}>واژه‌ی امروز</Text>
          </View>
          <View style={styles.wotBody}>
            <View style={styles.wotWordCol}>
              <Text style={styles.wotWord}>{today.en}</Text>
              <Text style={styles.wotMeaning}>{today.fa}</Text>
            </View>
            <SpeakButton text={today.en} color={Colors.accent[500]} />
          </View>
          <Text style={styles.wotExample}>{today.ex}</Text>
          <Text style={styles.wotExampleFa}>{today.exFa}</Text>
        </View>

        {/* Continue CTA */}
        <Pressable onPress={() => openLesson(continueLesson.id)}>
          <LinearGradient colors={continueLesson.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.continueCard}>
            <View style={styles.continueTextCol}>
              <Text style={styles.continueKicker}>ادامه بده</Text>
              <Text style={styles.continueTitle}>
                درس {toPersianDigits(continueLesson.id)} — {continueLesson.title}
              </Text>
              <Text style={styles.continueSub}>{continueLesson.subtitle}</Text>
            </View>
            <View style={styles.continuePlay}>
              <Play size={22} color={Colors.onColor} strokeWidth={2.5} fill={Colors.onColor} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Daily overview chips */}
        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{toPersianDigits(overview?.todayReviewed ?? 0)}</Text>
            <Text style={styles.statLabel}>تکرار امروز</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={[styles.statValue, { color: Colors.accent[600] }]}>{toPersianDigits(overview?.wordsSeen ?? 0)}</Text>
            <Text style={styles.statLabel}>واژه‌ی دیده‌شده</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={[styles.statValue, { color: Colors.success[500] }]}>{toPersianDigits(overview?.wordsMastered ?? 0)}</Text>
            <Text style={styles.statLabel}>یاد گرفته</Text>
          </View>
        </View>

        {/* Lessons */}
        <Text style={styles.sectionTitle}>درس‌ها ({toPersianDigits(LESSONS.length)})</Text>
        {LESSONS.map((lesson) => {
          const Icon = LESSON_ICONS[lesson.icon] ?? Sparkles;
          const mastery = masteryMap[lesson.id] ?? [];
          const seen = mastery.filter((m) => m >= 1).length;
          const pct = lesson.words.length ? seen / lesson.words.length : 0;
          const locked = lesson.id > continueId && seen === 0;
          return (
            <Pressable
              key={lesson.id}
              style={[styles.lessonCard, locked && styles.lessonCardLocked]}
              onPress={() => !locked && openLesson(lesson.id)}
            >
              <LinearGradient colors={lesson.gradient} style={styles.lessonIcon}>
                <Icon size={20} color={Colors.onColor} strokeWidth={2.2} />
              </LinearGradient>
              <View style={styles.lessonInfo}>
                <View style={styles.lessonTitleRow}>
                  <Text style={styles.lessonTitle}>
                    {toPersianDigits(lesson.id)}. {lesson.title}
                  </Text>
                  {locked ? (
                    <Lock size={14} color={Colors.neutral[400]} strokeWidth={2.2} />
                  ) : (
                    <LockOpen size={14} color={Colors.success[500]} strokeWidth={2.2} />
                  )}
                </View>
                <Text style={styles.lessonSub}>{lesson.subtitle}</Text>
                <View style={styles.lessonFooterRow}>
                  <ProgressBar value={pct} color={lesson.color} />
                </View>
                <Text style={styles.lessonProgressText}>
                  {toPersianDigits(seen)} از {toPersianDigits(lesson.words.length)} واژه
                </Text>
              </View>
              {!locked && pct >= 1 && (
                <Pressable style={[styles.lessonQuizBtn, { backgroundColor: lesson.color + '18', borderColor: lesson.color + '50' }]} onPress={() => openQuiz(lesson.id)}>
                  <ClipboardList size={15} color={lesson.color} strokeWidth={2.2} />
                  <Text style={[styles.lessonQuizText, { color: lesson.color }]}>آزمون</Text>
                </Pressable>
              )}
              {!locked && pct < 1 && (
                <View style={styles.lessonChevron}>
                  <ArrowLeft size={16} color={Colors.neutral[400]} strokeWidth={2.3} />
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={styles.footer}>
          <GraduationCap size={16} color={Colors.neutral[400]} strokeWidth={2} />
          <Text style={styles.footerText}>یادت نره — هر روز چند واژه، زبانت را بهتر می‌کند 🌱</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral[950], direction: 'rtl' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 60, gap: Spacing.md },

  hero: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  heroRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  heroTextCol: { flex: 1, alignItems: 'flex-end' },
  heroHello: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
    textAlign: 'right',
  },
  heroSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
    marginTop: 6,
    lineHeight: 18,
  },
  heroBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.md,
  },
  heroBadgeValue: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
    marginTop: 4,
  },
  heroBadgeLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  heroXpRow: { flexDirection: 'row-reverse', gap: Spacing.sm, flexWrap: 'wrap' },
  heroXpChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  heroXpText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.onColor,
    fontWeight: Typography.weights.medium,
  },

  wotCard: {
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  wotHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  wotHeaderText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accent[500],
  },
  wotBody: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  wotWordCol: { flex: 1, alignItems: 'flex-end' },
  wotWord: {
    fontFamily: Typography.fontFamily,
    fontSize: 30,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'right',
  },
  wotMeaning: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.neutral[300],
    textAlign: 'right',
    marginTop: 4,
  },
  wotExample: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[200],
    textAlign: 'left',
    marginTop: Spacing.sm,
  },
  wotExampleFa: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
    textAlign: 'right',
  },

  continueCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueTextCol: { flex: 1, alignItems: 'flex-end' },
  continueKicker: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
    fontWeight: Typography.weights.medium,
  },
  continueTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.onColor,
    textAlign: 'right',
    marginTop: 4,
  },
  continueSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    marginTop: 4,
  },
  continuePlay: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  statRow: { flexDirection: 'row-reverse', gap: Spacing.sm },
  statChip: {
    flex: 1,
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
  },
  statLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    color: Colors.neutral[400],
    textAlign: 'center',
  },

  sectionTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[100],
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  lessonCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.neutral[850],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    padding: Spacing.md,
    gap: Spacing.md,
  },
  lessonCardLocked: { opacity: 0.45 },
  lessonIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  lessonInfo: { flex: 1, alignItems: 'flex-end' },
  lessonTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  lessonTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'right',
  },
  lessonSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
    textAlign: 'right',
    marginTop: 2,
  },
  lessonFooterRow: { width: '100%', marginTop: Spacing.sm },
  lessonProgressText: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    color: Colors.neutral[500],
    textAlign: 'right',
    marginTop: 4,
  },
  lessonQuizBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  lessonQuizText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  lessonChevron: { paddingHorizontal: 4 },

  footer: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: Spacing.sm, paddingBottom: Spacing.lg },
  footerText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
  },
});
