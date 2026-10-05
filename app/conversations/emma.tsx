import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowRight, Bot, Languages, Lightbulb, Mic, Send, Sparkles, Volume2 } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';

type ChatMessage = { id: string; from: 'emma' | 'learner'; text: string; translation?: string };

const initialMessages: ChatMessage[] = [
  { id: '1', from: 'emma', text: 'Hi! I’m Emma, your English practice partner.', translation: 'سلام! من اِما هستم، همراه تمرین انگلیسی شما.' },
  { id: '2', from: 'emma', text: 'Let’s practice introducing ourselves. What is your name?', translation: 'بیایید معرفی خودمان را تمرین کنیم. اسم شما چیست؟' },
];

const suggestions = ['My name is Sara.', 'Hello Emma! Nice to meet you.', 'I am ready to practice.'];

export default function EmmaChat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [showTools, setShowTools] = useState(false);

  const send = (value = input) => {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: `${Date.now()}-me`, from: 'learner', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-emma`, from: 'emma', text: 'Nice to meet you! Where are you from?', translation: 'از آشنایی خوشحالم! اهل کجا هستید؟' },
      ]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, 550);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}><ArrowRight size={20} color={Colors.neutral[200]} /></Pressable>
        <View style={styles.avatar}><Text style={styles.avatarEmoji}>👩🏻‍🏫</Text><View style={styles.online} /></View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}><Text style={styles.name}>Emma</Text><Bot size={14} color={Colors.accent[400]} /></View>
          <Text style={styles.status}>آنلاین · مربی هوش مصنوعی</Text>
        </View>
        <Pressable style={styles.voiceCall}><Mic size={19} color={Colors.primary[300]} /></Pressable>
      </View>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messageContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        <View style={styles.topicChip}><Sparkles size={13} color={Colors.accent[400]} /><Text style={styles.topicText}>موضوع امروز: معرفی خود</Text></View>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.from === 'learner' ? styles.mine : styles.theirs]}>
            <Text style={styles.messageText}>{message.text}</Text>
            {message.translation ? <Text style={styles.translation}>{message.translation}</Text> : null}
            {message.from === 'emma' ? (
              <Pressable style={styles.listen} onPress={() => Speech.speak(message.text, { language: 'en-US', rate: .78 })}>
                <Volume2 size={14} color={Colors.primary[300]} /><Text style={styles.listenText}>پخش</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.coachArea}>
        <Pressable style={styles.coachToggle} onPress={() => setShowTools((value) => !value)}>
          <Sparkles size={15} color={Colors.warning[400]} />
          <Text style={styles.coachToggleText}>کمک خصوصی Emma</Text>
          <Text style={styles.coachToggleHint}>{showTools ? 'بستن' : 'پیشنهاد پاسخ'}</Text>
        </Pressable>
        {showTools ? (
          <View style={styles.tools}>
            <View style={styles.toolRow}><Lightbulb size={15} color={Colors.warning[400]} /><Text style={styles.toolText}>یکی از پاسخ‌ها را انتخاب کنید یا پاسخ خودتان را بنویسید.</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
              {suggestions.map((suggestion) => <Pressable key={suggestion} style={styles.suggestion} onPress={() => setInput(suggestion)}><Text style={styles.suggestionText}>{suggestion}</Text></Pressable>)}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <View style={styles.composer}>
        <Pressable style={styles.helper}><Languages size={19} color={Colors.neutral[400]} /></Pressable>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="پیام انگلیسی بنویسید…"
          placeholderTextColor={Colors.neutral[600]}
          multiline
          textAlign="right"
        />
        <Pressable style={[styles.send, !input.trim() && styles.sendDisabled]} disabled={!input.trim()} onPress={() => send()}>
          <Send size={18} color={Colors.onColor} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral[950] },
  header: { paddingTop: 50, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, minHeight: 104, backgroundColor: Colors.neutral[900], borderBottomWidth: 1, borderBottomColor: Colors.neutral[800], flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  back: { width: 39, height: 39, borderRadius: Radius.md, backgroundColor: Colors.neutral[850], alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.accent[500] + '20', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarEmoji: { fontSize: 27 },
  online: { position: 'absolute', left: 0, bottom: 2, width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.success[500], borderWidth: 2, borderColor: Colors.neutral[900] },
  headerText: { flex: 1 },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.neutral[100] },
  status: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[400], textAlign: 'right', marginTop: 2 },
  voiceCall: { width: 39, height: 39, borderRadius: Radius.full, backgroundColor: Colors.primary[500] + '15', alignItems: 'center', justifyContent: 'center' },
  messages: { flex: 1 },
  messageContent: { padding: Spacing.md, gap: Spacing.sm },
  topicChip: { alignSelf: 'center', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.accent[500] + '10', flexDirection: 'row-reverse', gap: 5, alignItems: 'center', marginBottom: Spacing.md },
  topicText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.accent[300] },
  bubble: { maxWidth: '86%', borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  theirs: { alignSelf: 'flex-start', backgroundColor: Colors.neutral[850], borderColor: Colors.neutral[700], borderBottomLeftRadius: 5 },
  mine: { alignSelf: 'flex-end', backgroundColor: Colors.primary[600], borderColor: Colors.primary[500], borderBottomRightRadius: 5 },
  messageText: { fontSize: 16, lineHeight: 23, color: Colors.neutral[50], textAlign: 'left' },
  translation: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[400], textAlign: 'right', lineHeight: 19, marginTop: 7, paddingTop: 7, borderTopWidth: 1, borderTopColor: Colors.neutral[700] + '80' },
  listen: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 7, alignSelf: 'flex-end' },
  listenText: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.primary[300] },
  coachArea: { backgroundColor: Colors.neutral[900], borderTopWidth: 1, borderTopColor: Colors.neutral[800] },
  coachToggle: { minHeight: 38, paddingHorizontal: Spacing.md, flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  coachToggleText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.warning[300], textAlign: 'right' },
  coachToggleHint: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600] },
  tools: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  toolRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 7 },
  toolText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500] },
  suggestions: { gap: 7 },
  suggestion: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary[500] + '45', backgroundColor: Colors.primary[500] + '0C', paddingHorizontal: 11, paddingVertical: 7 },
  suggestionText: { fontSize: 12, color: Colors.primary[200] },
  composer: { padding: Spacing.sm, paddingBottom: 18, backgroundColor: Colors.neutral[900], flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 7 },
  helper: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.neutral[850], alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 42, maxHeight: 100, borderRadius: 21, backgroundColor: Colors.neutral[850], borderWidth: 1, borderColor: Colors.neutral[700], paddingHorizontal: Spacing.md, paddingVertical: 10, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[100] },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.accent[500], alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: .4 },
});
