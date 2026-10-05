import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Languages, Send, ShieldCheck, Sparkles, UserRound } from 'lucide-react-native';
import {
  currentChatUserId,
  listMessages,
  sendTextMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
  type DirectMessage,
} from '@/lib/conversations';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';

export default function HumanConversationScreen() {
  const router = useRouter();
  const { conversationId, name } = useLocalSearchParams<{ conversationId: string; name?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoach, setShowCoach] = useState(false);

  const addMessage = (message: DirectMessage) => {
    setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
  };

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof subscribeToMessages> | null = null;
    Promise.all([listMessages(conversationId), currentChatUserId()])
      .then(([rows, userId]) => {
        if (!active) return;
        setMessages(rows);
        setMyId(userId);
        channel = subscribeToMessages(conversationId, addMessage);
        setError(null);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'گفتگو باز نشد.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      void unsubscribeFromMessages(channel);
    };
  }, [conversationId]);

  const send = async () => {
    const clean = input.trim();
    if (!clean || sending) return;
    setSending(true);
    setInput('');
    try {
      addMessage(await sendTextMessage(conversationId, clean));
      setError(null);
    } catch (cause) {
      setInput(clean);
      setError(cause instanceof Error ? cause.message : 'پیام ارسال نشد.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}><ArrowRight size={20} color={Colors.neutral[200]} /></Pressable>
        <View style={styles.avatar}><UserRound size={22} color={Colors.primary[300]} /></View>
        <View style={styles.headerText}><Text style={styles.name}>{name || 'مخاطب واقعی'}</Text><Text style={styles.status}>گفتگوی خصوصی</Text></View>
        <ShieldCheck size={20} color={Colors.success[400]} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary[400]} /><Text style={styles.centerText}>در حال بازکردن گفتگو…</Text></View>
      ) : (
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messageContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          <View style={styles.privateNote}><ShieldCheck size={14} color={Colors.success[400]} /><Text style={styles.privateText}>فقط شما و این مخاطب پیام‌ها را می‌بینید.</Text></View>
          {!messages.length ? (
            <View style={styles.empty}><Text style={styles.emptyEmoji}>👋</Text><Text style={styles.emptyTitle}>گفتگو را شروع کنید</Text><Text style={styles.emptyDesc}>یک سلام ساده انگلیسی بهترین شروع است.</Text></View>
          ) : messages.map((message) => {
            const mine = message.senderId === myId;
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={styles.messageText}>{message.body}</Text>
                <Text style={styles.time}>{new Date(message.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {showCoach ? (
        <View style={styles.coach}>
          <View style={styles.coachTitleRow}><Sparkles size={15} color={Colors.warning[400]} /><Text style={styles.coachTitle}>دستیار خصوصی</Text></View>
          <Text style={styles.coachText}>جمله فارسی خود را بنویسید؛ در مرحله اتصال هوش مصنوعی، ترجمه و اصلاح قبل از ارسال اینجا نمایش داده می‌شود.</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.composer}>
        <Pressable style={styles.helper} onPress={() => setShowCoach((value) => !value)}><Languages size={19} color={showCoach ? Colors.warning[400] : Colors.neutral[400]} /></Pressable>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="پیام انگلیسی بنویسید…" placeholderTextColor={Colors.neutral[600]} multiline textAlign="right" />
        <Pressable style={[styles.send, (!input.trim() || sending) && styles.disabled]} disabled={!input.trim() || sending} onPress={() => void send()}>
          {sending ? <ActivityIndicator size="small" color={Colors.onColor} /> : <Send size={18} color={Colors.onColor} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral[950] },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, minHeight: 104, backgroundColor: Colors.neutral[900], borderBottomWidth: 1, borderBottomColor: Colors.neutral[800], flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  back: { width: 39, height: 39, borderRadius: Radius.md, backgroundColor: Colors.neutral[850], alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary[500] + '15', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  name: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[100], textAlign: 'right' },
  status: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[400], textAlign: 'right', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  centerText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500] },
  messages: { flex: 1 },
  messageContent: { flexGrow: 1, padding: Spacing.md, gap: Spacing.sm },
  privateNote: { alignSelf: 'center', flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.success[500] + '0D', marginBottom: Spacing.md },
  privateText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[400] },
  empty: { flex: 1, minHeight: 330, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[200], marginTop: Spacing.md },
  emptyDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[600], marginTop: 4 },
  bubble: { maxWidth: '84%', borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  mine: { alignSelf: 'flex-end', backgroundColor: Colors.primary[600], borderColor: Colors.primary[500], borderBottomRightRadius: 5 },
  theirs: { alignSelf: 'flex-start', backgroundColor: Colors.neutral[850], borderColor: Colors.neutral[700], borderBottomLeftRadius: 5 },
  messageText: { fontSize: 16, lineHeight: 23, color: Colors.neutral[50], textAlign: 'left' },
  time: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.neutral[400], marginTop: 5, textAlign: 'left' },
  coach: { padding: Spacing.md, backgroundColor: Colors.warning[500] + '0B', borderTopWidth: 1, borderTopColor: Colors.warning[500] + '20' },
  coachTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  coachTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: Colors.warning[300] },
  coachText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500], textAlign: 'right', lineHeight: 18, marginTop: 4 },
  error: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.error[300], textAlign: 'center', paddingHorizontal: Spacing.md, paddingTop: 6, backgroundColor: Colors.neutral[900] },
  composer: { padding: Spacing.sm, paddingBottom: 18, backgroundColor: Colors.neutral[900], flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 7 },
  helper: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.neutral[850], alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 42, maxHeight: 100, borderRadius: 21, backgroundColor: Colors.neutral[850], borderWidth: 1, borderColor: Colors.neutral[700], paddingHorizontal: Spacing.md, paddingVertical: 10, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[100] },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: .4 },
});
