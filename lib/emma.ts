import { ensureChatIdentity } from './conversations';
import { supabase } from './supabase';

export interface EmmaInputMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface EmmaCorrection {
  original: string;
  improved: string;
  explanationFa: string;
}

export interface EmmaReply {
  reply: string;
  translation: string;
  correction: EmmaCorrection | null;
  suggestions: string[];
}

export async function askEmma(
  messages: EmmaInputMessage[],
  options: { level?: string; situation?: string } = {},
): Promise<EmmaReply> {
  await ensureChatIdentity();
  const { data, error } = await supabase.functions.invoke('emma-chat', {
    body: {
      messages: messages.slice(-12),
      level: options.level || 'Foundation',
      situation: options.situation || 'introducing yourself',
    },
  });
  if (error) throw new Error('سرویس Emma هنوز روی سرور فعال نشده است.');
  if (data?.error) throw new Error(String(data.error));
  if (!data?.reply) throw new Error('پاسخی از Emma دریافت نشد.');
  return {
    reply: String(data.reply),
    translation: String(data.translation || ''),
    correction: data.correction || null,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions.map(String).slice(0, 3) : [],
  };
}
