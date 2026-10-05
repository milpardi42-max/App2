export type CourseLevelId = 0 | 1 | 2 | 3 | 4;

export interface CourseSentence {
  id: string;
  en: string;
  fa: string;
  pronunciation: string;
  pattern?: string;
  vocabulary: Array<{ word: string; meaning: string }>;
}

export interface SentenceLesson {
  id: string;
  levelId: CourseLevelId;
  order: number;
  title: string;
  subtitle: string;
  situation: string;
  durationMinutes: number;
  sentences: CourseSentence[];
  dialogue: Array<{ speaker: 'learner' | 'partner'; text: string; fa: string }>;
}

export interface CourseLevel {
  id: CourseLevelId;
  title: string;
  cefr: string;
  description: string;
  color: string;
  modules: string[];
}

export const COURSE_LEVELS: CourseLevel[] = [
  {
    id: 0,
    title: 'Foundation',
    cefr: 'شروع از صفر',
    description: 'صداها، خواندن ساده و جمله‌های ضروری',
    color: '#6366f1',
    modules: ['تلفظ و صداها', 'خواندن پایه', '۱۰۰ جمله ضروری', 'عبارت‌های فوری'],
  },
  {
    id: 1,
    title: 'Survival English',
    cefr: 'A1',
    description: 'مکالمه در موقعیت‌های ضروری روزمره',
    color: '#0ea5e9',
    modules: ['موقعیت‌های اصلی', 'الگوهای جمله', 'شنیدن و صحبت‌کردن'],
  },
  {
    id: 2,
    title: 'Everyday English',
    cefr: 'A2–B1',
    description: 'انگلیسی طبیعی برای زندگی روزمره',
    color: '#10b981',
    modules: ['موقعیت‌های واقعی', 'گفتگوها', 'خواندن و نوشتن'],
  },
  {
    id: 3,
    title: 'Communication English',
    cefr: 'B1–B2',
    description: 'روانی در گفتگو، نظر دادن و داستان‌گویی',
    color: '#f59e0b',
    modules: ['بحث و نظر', 'داستان‌گویی', 'ارتباط حرفه‌ای'],
  },
  {
    id: 4,
    title: 'Advanced English',
    cefr: 'B2–C1',
    description: 'انگلیسی دانشگاهی، کاری و پیشرفته',
    color: '#8b5cf6',
    modules: ['انگلیسی دانشگاهی', 'کسب‌وکار', 'IELTS و گفتار حرفه‌ای'],
  },
];

export const SENTENCE_LESSONS: SentenceLesson[] = [
  {
    id: 'foundation-introducing-yourself',
    levelId: 0,
    order: 1,
    title: 'معرفی خود',
    subtitle: 'اولین گفتگوی ساده و واقعی',
    situation: 'برای اولین بار با یک نفر آشنا شده‌اید و می‌خواهید خودتان را معرفی کنید.',
    durationMinutes: 8,
    sentences: [
      {
        id: 's1',
        en: 'Hello, my name is Sara.',
        fa: 'سلام، اسم من سارا است.',
        pronunciation: 'هِلو، مای نِیم ایز سارا',
        pattern: 'My name is + name',
        vocabulary: [{ word: 'name', meaning: 'اسم' }],
      },
      {
        id: 's2',
        en: 'What is your name?',
        fa: 'اسم شما چیست؟',
        pronunciation: 'وات ایز یور نِیم؟',
        pattern: 'What is your + noun?',
        vocabulary: [{ word: 'your', meaning: 'مال شما / ـتان' }],
      },
      {
        id: 's3',
        en: 'Nice to meet you.',
        fa: 'از آشنایی با شما خوشحالم.',
        pronunciation: 'نایس تو میت یو',
        vocabulary: [
          { word: 'nice', meaning: 'خوب / خوشایند' },
          { word: 'meet', meaning: 'ملاقات کردن' },
        ],
      },
      {
        id: 's4',
        en: 'I am from Iran.',
        fa: 'من اهل ایران هستم.',
        pronunciation: 'آی اَم فرام ایران',
        pattern: 'I am from + place',
        vocabulary: [{ word: 'from', meaning: 'از / اهل' }],
      },
      {
        id: 's5',
        en: 'Where are you from?',
        fa: 'شما اهل کجا هستید؟',
        pronunciation: 'وِر آر یو فرام؟',
        pattern: 'Where are you from?',
        vocabulary: [{ word: 'where', meaning: 'کجا' }],
      },
    ],
    dialogue: [
      { speaker: 'partner', text: 'Hello! My name is Emma. What is your name?', fa: 'سلام! اسم من اِما است. اسم شما چیست؟' },
      { speaker: 'learner', text: 'Hello, my name is Sara.', fa: 'سلام، اسم من سارا است.' },
      { speaker: 'partner', text: 'Nice to meet you. Where are you from?', fa: 'از آشنایی خوشحالم. اهل کجا هستید؟' },
      { speaker: 'learner', text: 'Nice to meet you too. I am from Iran.', fa: 'من هم از آشنایی خوشحالم. اهل ایران هستم.' },
    ],
  },
  {
    id: 'foundation-asking-for-help',
    levelId: 0,
    order: 2,
    title: 'درخواست کمک',
    subtitle: 'جمله‌های ضروری وقتی کمک می‌خواهید',
    situation: 'در یک مکان جدید هستید و برای پیدا کردن مسیر یا فهمیدن صحبت دیگران کمک می‌خواهید.',
    durationMinutes: 9,
    sentences: [
      { id: 's1', en: 'Can you help me?', fa: 'می‌توانید به من کمک کنید؟', pronunciation: 'کَن یو هِلپ می؟', pattern: 'Can you + verb?', vocabulary: [{ word: 'help', meaning: 'کمک کردن' }] },
      { id: 's2', en: 'I do not understand.', fa: 'متوجه نمی‌شوم.', pronunciation: 'آی دو نات آندِراِستَند', vocabulary: [{ word: 'understand', meaning: 'متوجه شدن' }] },
      { id: 's3', en: 'Please speak slowly.', fa: 'لطفاً آهسته صحبت کنید.', pronunciation: 'پلیز اسپیک اِسلولی', vocabulary: [{ word: 'slowly', meaning: 'به‌آرامی' }] },
      { id: 's4', en: 'Could you say that again?', fa: 'می‌شود دوباره بگویید؟', pronunciation: 'کود یو سِی ذَت اَگِن؟', vocabulary: [{ word: 'again', meaning: 'دوباره' }] },
      { id: 's5', en: 'Thank you for your help.', fa: 'برای کمکتان ممنونم.', pronunciation: 'تَنک یو فُر یور هِلپ', vocabulary: [{ word: 'thank you', meaning: 'متشکرم' }] },
    ],
    dialogue: [
      { speaker: 'learner', text: 'Excuse me. Can you help me?', fa: 'ببخشید. می‌توانید کمکم کنید؟' },
      { speaker: 'partner', text: 'Of course. What do you need?', fa: 'البته. چه چیزی لازم دارید؟' },
      { speaker: 'learner', text: 'Please speak slowly. I do not understand.', fa: 'لطفاً آهسته صحبت کنید. متوجه نمی‌شوم.' },
    ],
  },
  {
    id: 'foundation-buying-something',
    levelId: 0,
    order: 3,
    title: 'خرید ساده',
    subtitle: 'پرسیدن قیمت و خرید یک کالا',
    situation: 'وارد فروشگاه شده‌اید و می‌خواهید قیمت یک کالا را بپرسید و آن را بخرید.',
    durationMinutes: 10,
    sentences: [
      { id: 's1', en: 'How much is this?', fa: 'این چقدر است؟', pronunciation: 'هاو ماچ ایز ذیس؟', vocabulary: [{ word: 'how much', meaning: 'چقدر / چه قیمتی' }] },
      { id: 's2', en: 'I would like this one.', fa: 'من این یکی را می‌خواهم.', pronunciation: 'آی وود لایک ذیس وان', pattern: 'I would like + noun', vocabulary: [{ word: 'would like', meaning: 'مایل بودن / خواستن' }] },
      { id: 's3', en: 'Do you have a smaller size?', fa: 'اندازه کوچک‌تر دارید؟', pronunciation: 'دو یو هَو اَ اِسمالِر سایز؟', vocabulary: [{ word: 'size', meaning: 'اندازه' }] },
      { id: 's4', en: 'Can I pay by card?', fa: 'می‌توانم با کارت پرداخت کنم؟', pronunciation: 'کَن آی پِی بای کارد؟', vocabulary: [{ word: 'pay', meaning: 'پرداخت کردن' }] },
      { id: 's5', en: 'That is all, thank you.', fa: 'همین است، متشکرم.', pronunciation: 'ذَت ایز آل، تَنک یو', vocabulary: [{ word: 'all', meaning: 'همه / تمام' }] },
    ],
    dialogue: [
      { speaker: 'learner', text: 'Excuse me, how much is this?', fa: 'ببخشید، این چقدر است؟' },
      { speaker: 'partner', text: 'It is ten dollars.', fa: 'ده دلار است.' },
      { speaker: 'learner', text: 'Great. I would like this one.', fa: 'عالی است. این یکی را می‌خواهم.' },
    ],
  },
];

export const getSentenceLesson = (id: string) => SENTENCE_LESSONS.find((lesson) => lesson.id === id);
