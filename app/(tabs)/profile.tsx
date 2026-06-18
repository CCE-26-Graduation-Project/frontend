import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';
import { isSignedIn, signIn, signUp, signOut } from '../../services/auth';
import { useFavourites } from '../../contexts/FavouritesContext';
import type { AuthUser } from '../../services/types';

const NAV_TOTAL_HEIGHT = 114;

const MENU_ITEMS = [
  { icon: 'bell' as const, label: 'Price alert settings' },
  { icon: 'globe' as const, label: 'Preferred stores' },
  { icon: 'star' as const, label: 'Snoop Plus' },
];

type AuthState = 'loading' | 'signedIn' | 'signedOut';
type FormMode = 'signin' | 'signup';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favourites } = useFavourites();

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check session on mount
  useEffect(() => {
    isSignedIn()
      .then((yes) => setAuthState(yes ? 'signedIn' : 'signedOut'))
      .catch(() => setAuthState('signedOut'));
  }, []);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const u = await signIn(email.trim(), password);
      setUser(u);
      setAuthState('signedIn');
      setEmail('');
      setPassword('');
    } catch {
      setFormError('Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password]);

  const handleSignUp = useCallback(async () => {
    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const u = await signUp(email.trim(), password);
      setUser(u);
      setAuthState('signedIn');
      setEmail('');
      setPassword('');
    } catch {
      setFormError('Could not create account. The email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // Best-effort — clear local state regardless
    }
    setUser(null);
    setAuthState('signedOut');
  }, []);

  const displayName = user?.email
    ? user.email.split('@')[0]
    : null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authState === 'loading') {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.colors.bg1 }]}>
        <ActivityIndicator color={theme.colors.text2} />
      </View>
    );
  }

  // ── Signed out — show login / signup form ─────────────────────────────────
  if (authState === 'signedOut') {
    return (
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 8, paddingBottom: NAV_TOTAL_HEIGHT + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Text style={styles.title}>Profile</Text>
          </View>

          <View style={styles.authHero}>
            <SnoopCharacter expression="thinking" size={90} />
            <Text style={styles.authHeading}>
              {formMode === 'signin' ? 'Welcome back' : 'Create an account'}
            </Text>
            <Text style={styles.authSubheading}>
              {formMode === 'signin'
                ? 'Sign in to sync your favourites and alerts.'
                : 'Save favourites and get price alerts across devices.'}
            </Text>
          </View>

          {/* Mode tabs */}
          <View style={styles.modeTabs}>
            <Pressable
              style={[styles.modeTab, formMode === 'signin' && styles.modeTabActive]}
              onPress={() => { setFormMode('signin'); setFormError(''); }}
            >
              <Text style={[styles.modeTabText, formMode === 'signin' && styles.modeTabTextActive]}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeTab, formMode === 'signup' && styles.modeTabActive]}
              onPress={() => { setFormMode('signup'); setFormError(''); }}
            >
              <Text style={[styles.modeTabText, formMode === 'signup' && styles.modeTabTextActive]}>
                Create account
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={theme.colors.text2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.text2}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color={theme.colors.text2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.text2}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={formMode === 'signin' ? handleSignIn : handleSignUp}
              />
            </View>

            {formError ? (
              <Text style={styles.errorText}>{formError}</Text>
            ) : null}

            <Pressable
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={formMode === 'signin' ? handleSignIn : handleSignUp}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {formMode === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Signed in ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg1 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: NAV_TOTAL_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <SnoopCharacter expression="happy" size={80} />
          </View>
          <Text style={styles.name}>{displayName ?? 'User'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            [String(favourites.length), 'Favourites'],
            ['47', 'Stores checked'],
            ['0', 'Alerts set'],
          ].map(([val, lbl]) => (
            <View key={lbl} style={styles.stat}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuDivider]}
            >
              <View style={styles.menuIcon}>
                <Feather name={item.icon} size={18} color={theme.colors.text1} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={theme.colors.text2} />
            </Pressable>
          ))}

          {/* Sign out row */}
          <Pressable style={[styles.menuRow, styles.menuDividerTop]} onPress={handleSignOut}>
            <View style={[styles.menuIcon, styles.menuIconDanger]}>
              <Feather name="log-out" size={18} color="#E53935" />
            </View>
            <Text style={[styles.menuLabel, { color: '#E53935' }]}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { flexGrow: 1 },
  topBar: {
    height: 52,
    paddingHorizontal: theme.spacing.s4,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.3,
  },

  // ── Auth form ──────────────────────────────────────────────────────────────
  authHero: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s5,
    gap: 8,
  },
  authHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.26,
  },
  authSubheading: {
    fontSize: 15,
    color: theme.colors.text2,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
  },
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.s4,
    backgroundColor: theme.colors.bg2,
    borderRadius: theme.radius.compact,
    padding: 4,
    marginBottom: theme.spacing.s4,
  },
  modeTab: {
    flex: 1,
    height: 38,
    borderRadius: theme.radius.compact - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.rest,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text2,
  },
  modeTabTextActive: {
    color: theme.colors.text1,
    fontWeight: '600',
  },
  form: {
    marginHorizontal: theme.spacing.s4,
    gap: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.compact,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    paddingHorizontal: 14,
    height: 50,
    ...theme.shadows.rest,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text1,
    height: 50,
  },
  errorText: {
    fontSize: 13,
    color: '#E53935',
    textAlign: 'center',
    lineHeight: 18,
  },
  submitBtn: {
    height: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.text1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    ...theme.shadows.card,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.1,
  },

  // ── Signed-in profile ──────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s6,
    gap: 8,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.26,
  },
  email: {
    fontSize: 15,
    color: theme.colors.text2,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.s4,
    backgroundColor: theme.colors.bg2,
    borderRadius: theme.radius.card,
    paddingVertical: theme.spacing.s4,
    marginBottom: theme.spacing.s5,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text1,
    letterSpacing: -0.26,
  },
  statLbl: {
    fontSize: 12,
    color: theme.colors.text2,
    textAlign: 'center',
  },
  menu: {
    marginHorizontal: theme.spacing.s4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    ...theme.shadows.rest,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.s4,
    minHeight: 44,
    gap: 12,
  },
  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  menuDividerTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.compact,
    backgroundColor: theme.colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconDanger: {
    backgroundColor: '#FEECEC',
  },
  menuLabel: {
    flex: 1,
    fontSize: 17,
    color: theme.colors.text1,
    letterSpacing: -0.08,
  },
});
