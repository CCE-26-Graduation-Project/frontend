import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { RecentChip } from '../components/RecentChip';
import { Icon } from '../components/Icon';
import { AttachmentPreview } from '../components/AttachmentPreview';
import { theme } from '../constants/theme';
import { useImageAttachment } from '../hooks/useImageAttachment';

const RECENT = ['iPhone 15 Pro', 'Sony headphones', 'Coffee table', 'Nike Air Max'];

const SUGGESTIONS = [
  { icon: 'clock' as const, text: 'iPhone 15 Pro', recent: true },
  { icon: 'clock' as const, text: 'iPhone 15', recent: true },
  { icon: 'flame' as const, text: 'iPhone 15 Pro Max', trending: true },
  { icon: 'search' as const, text: 'iPhone 15 case', muted: true },
  { icon: 'folder' as const, text: 'iPhone — Electronics', folder: true },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = React.useState('');
  const inputRef = useRef<TextInput>(null);
  const attachment = useImageAttachment();

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Hand text and/or an attached image to the results screen, which runs the matching
  // search (text → searchByText, image → searchByImage, both → searchMultimodal).
  function submit(text: string, imageUri: string | null = attachment.uri) {
    const q = text.trim();
    if (!q && !imageUri) return;
    router.push({
      pathname: '/results',
      params: { query: q, imageUri: imageUri ?? '' },
    });
  }

  // Attach a single photo, then go straight to results (combined with any typed text).
  async function handleAttach() {
    const picked = await attachment.pick();
    if (picked) submit(query, picked);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={theme.colors.text1} />
        </Pressable>

        <View style={styles.inputWrapper}>
          <Feather name="search" size={18} color={theme.colors.text2} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search any product…"
            placeholderTextColor={theme.colors.text2}
            returnKeyType="search"
            onSubmitEditing={() => submit(query)}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={18} color={theme.colors.text2} />
            </Pressable>
          )}
          {/* Attach a photo to search by image */}
          <Pressable onPress={handleAttach} hitSlop={8} disabled={attachment.picking}>
            <Feather name="paperclip" size={18} color={theme.colors.text2} />
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} style={styles.cancelBtn} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {/* Attached image preview */}
      {attachment.uri && (
        <View style={styles.attachmentBar}>
          <AttachmentPreview uri={attachment.uri} onRemove={attachment.clear} />
        </View>
      )}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recent chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {RECENT.map((label) => (
              <RecentChip
                key={label}
                label={label}
                onPress={() => submit(label)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Live suggestions */}
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <Pressable
              key={i}
              style={[styles.suggestionRow, i < SUGGESTIONS.length - 1 && styles.suggestionBorder]}
              onPress={() => submit(s.text)}
            >
              <Icon
                name={s.icon}
                size={18}
                color={s.trending ? theme.colors.savings : theme.colors.text2}
              />
              <Text
                style={[styles.suggestionText, { color: s.muted ? theme.colors.text2 : theme.colors.text1 }]}
                numberOfLines={1}
              >
                {s.text}
              </Text>
              {s.recent && <Feather name="x" size={16} color={theme.colors.text2} />}
              {s.folder && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>Category</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    paddingHorizontal: theme.spacing.s4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bg2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
    ...theme.shadows.card,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text1,
    letterSpacing: -0.06,
  },
  cancelBtn: {
    height: 36,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.text1,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    letterSpacing: -0.05,
  },
  attachmentBar: {
    paddingHorizontal: theme.spacing.s4,
    paddingTop: 4,
    paddingBottom: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: theme.spacing.s3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text1,
    letterSpacing: -0.08,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestions: {
    marginTop: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.s4,
    minHeight: 44,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  suggestionText: {
    flex: 1,
    fontSize: 17,
    letterSpacing: -0.08,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: theme.colors.text1,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});
