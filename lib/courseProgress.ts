import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'sentence_course_progress_v1';

export interface CourseProgress {
  completedLessonIds: string[];
  currentLessonId: string;
  reviewSentenceIds: string[];
  dailyGoalMinutes: number;
  todayMinutes: number;
  updatedAt: string;
}

const initial: CourseProgress = {
  completedLessonIds: [],
  currentLessonId: 'foundation-introducing-yourself',
  reviewSentenceIds: [],
  dailyGoalMinutes: 10,
  todayMinutes: 0,
  updatedAt: new Date(0).toISOString(),
};

async function readRaw(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(KEY);
  return AsyncStorage.getItem(KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(KEY, value);
    return;
  }
  await AsyncStorage.setItem(KEY, value);
}

export async function getCourseProgress(): Promise<CourseProgress> {
  try {
    const raw = await readRaw();
    return raw ? { ...initial, ...(JSON.parse(raw) as Partial<CourseProgress>) } : initial;
  } catch {
    return initial;
  }
}

export async function completeSentenceLesson(lessonId: string, nextLessonId?: string): Promise<CourseProgress> {
  const current = await getCourseProgress();
  const next: CourseProgress = {
    ...current,
    completedLessonIds: Array.from(new Set([...current.completedLessonIds, lessonId])),
    currentLessonId: nextLessonId ?? current.currentLessonId,
    todayMinutes: Math.min(current.dailyGoalMinutes, current.todayMinutes + 8),
    updatedAt: new Date().toISOString(),
  };
  await writeRaw(JSON.stringify(next));
  return next;
}

export async function addSentenceToReview(sentenceId: string): Promise<void> {
  const current = await getCourseProgress();
  await writeRaw(
    JSON.stringify({
      ...current,
      reviewSentenceIds: Array.from(new Set([...current.reviewSentenceIds, sentenceId])),
      updatedAt: new Date().toISOString(),
    }),
  );
}
