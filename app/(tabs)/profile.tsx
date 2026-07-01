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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';
import { signIn, signUp, signOut, deleteAccount, getSignedInUser, AuthError } from '../../services/auth';
import { NetworkError } from '../../services/apiClient';
import { useFavourites } from '../../contexts/FavouritesContext';
import type { AuthUser } from '../../services/types';

const NAV_TOTAL_HEIGHT = 114;


type AuthState = 'loading' | 'signedIn' | 'signedOut';
type FormMode = 'signin' | 'signup';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favourites, reloadFavourites, clearFavourites } = useFavourites();

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // On mount: check stored JWT validity without a network call.
  // If valid, restore the user object from secure storage.
  useEffect(() => {
    getSignedInUser()
      .then((u) => {
        if (u) {
          setUser(u);
          setAuthState('signedIn');
        } else {
          setAuthState('signedOut');
        }
      })
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
      reloadFavourites(); // background — don't await, don't block the UI
    } catch (err) {
      if (err instanceof AuthError) {
        setFormError(err.message);
      } else if (err instanceof NetworkError) {
        setFormError('Cannot reach the server. Check your internet connection and try again.');
      } else {
        setFormError('Sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, reloadFavourites]);

  const handleSignUp = useCallback(async () => {
    if (!name.trim()) {
      setFormError('Please enter your name.');
      return;
    }
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
      const u = await signUp(email.trim(), password, name.trim());
      setUser(u);
      setAuthState('signedIn');
      setEmail('');
      setPassword('');
      reloadFavourites();
    } catch (err) {
      if (err instanceof AuthError) {
        setFormError(err.message);
      } else if (err instanceof NetworkError) {
        setFormError('Cannot reach the server. Check your internet connection and try again.');
      } else {
        setFormError('Could not create account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, reloadFavourites]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // best-effort — always clear local state
    }
    clearFavourites();
    setUser(null);
    setAuthState('signedOut');
  }, [clearFavourites]);

  const confirmDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all associated data — favourites and search history — and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              clearFavourites();
              setUser(null);
              setAuthState('signedOut');
            } catch (err) {
              const message = err instanceof AuthError
                ? err.message
                : 'Could not delete your account. Please check your connection and try again.';
              Alert.alert('Deletion failed', message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [clearFavourites]);

  const displayName = user?.name ?? (user?.email ? user.email.split('@')[0] : null);

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
              {formMode === 'signin' ? 'Welcome Back!' : 'Create an account'}
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
              onPress={() => { setFormMode('signin'); setFormError(''); setName(''); }}
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
            {formMode === 'signup' && (
              <View style={styles.inputWrap}>
                <Feather name="user" size={16} color={theme.colors.text2} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={theme.colors.text2}
                  value={name}
                  onChangeText={(t) => { setName(t); setFormError(''); }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            )}
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={theme.colors.text2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.text2}
                value={email}
                onChangeText={(t) => { setEmail(t); setFormError(''); }}
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
                onChangeText={(t) => { setPassword(t); setFormError(''); }}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={formMode === 'signin' ? handleSignIn : handleSignUp}
              />
            </View>

            {formError ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#E53935" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
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
          <View style={styles.stat}>
            <Text style={styles.statVal}>{String(favourites.length)}</Text>
            <Text style={styles.statLbl}>Favourites</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {/* Sign out row */}
          <Pressable style={styles.menuRow} onPress={handleSignOut}>
            <View style={[styles.menuIcon, styles.menuIconDanger]}>
              <Feather name="log-out" size={18} color="#E53935" />
            </View>
            <Text style={[styles.menuLabel, { color: '#E53935' }]}>Sign out</Text>
          </Pressable>
        </View>

        {/* Account deletion — required by App Store guidelines */}
        <View style={[styles.menu, { marginTop: theme.spacing.s4 }]}>
          <Pressable
            style={styles.menuRow}
            onPress={confirmDeleteAccount}
            disabled={deleting}
          >
            <View style={[styles.menuIcon, styles.menuIconDanger]}>
              {deleting ? (
                <ActivityIndicator color="#E53935" size="small" />
              ) : (
                <Feather name="trash-2" size={18} color="#E53935" />
              )}
            </View>
            <Text style={[styles.menuLabel, { color: '#E53935' }]}>Delete account</Text>
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEECEC',
    borderRadius: theme.radius.compact,
    padding: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#C62828',
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
