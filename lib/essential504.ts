import { SENTENCE_LESSONS } from './courseContent';

/**
 * Internal rollout catalog for the 504-word layer.
 * These words never become a separate lesson type: they are introduced only
 * through the existing situation → sentence → dialogue → vocabulary flow.
 */
export const ESSENTIAL_504_ROLLOUT = [
  'keen',
  'qualify',
  'data',
  'talent',
  'vacant',
  'expensive',
  'minimum',
  'annual',
  'hardship',
  'abandon',
  'unaccustomed',
  'scarce',
  'essential',
  'devise',
  'persuade',
  'typical',
  'jealous',
  'tact',
  'conceal',
  'resent',
  'frigid',
  'humid',
  'dense',
  'predict',
  'peril',
  'numb',
  'survive',
  'unforeseen',
  'campus',
  'majority',
  'assemble',
  'debate',
  'approach',
  'employee',
  'client',
  'thorough',
  'detect',
  'neglect',
  'preserve',
  'obvious',
  'tradition',
  'rural',
  'explore',
  'reform',
  'postpone',
  'consent',
  'reluctant',
  'valid',
  'defect',
  'eliminate',
  'utilize',
  'comprehensive',
  'descend',
  'enormous',
  'vapor',
  'vanish',
  'topic',
  'burden',
  'evade',
  'probe',
  'deceive',
  'security',
  'sinister',
  'undoubtedly',
  'massive',
  'unique',
  'torrent',
  'gloomy',
  'amateur',
  'mediocre',
  'variety',
  'prominent',
  'circulate',
  'exaggerate',
  'villain',
  'weird',
  'recline',
  'tempt',
  'wager',
  'popular',
] as const;

export type Essential504Word = (typeof ESSENTIAL_504_ROLLOUT)[number];

export function getEssential504WordsForLesson(lessonId: string): string[] {
  const lesson = SENTENCE_LESSONS.find((item) => item.id === lessonId);
  if (!lesson) return [];

  return Array.from(
    new Set(
      lesson.sentences.flatMap((sentence) =>
        sentence.vocabulary
          .filter((item) => item.essential504)
          .map((item) => item.word.toLowerCase()),
      ),
    ),
  );
}

export function getEssential504Coverage() {
  const introduced = new Set(
    SENTENCE_LESSONS.flatMap((lesson) => getEssential504WordsForLesson(lesson.id)),
  );

  return {
    introduced: Array.from(introduced),
    introducedCount: introduced.size,
    totalTarget: 504,
    remainingCount: 504 - introduced.size,
  };
}
