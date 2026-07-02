import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Modal,
  Animated,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SnoopCharacter } from '../../components/SnoopCharacter';
import { theme } from '../../constants/theme';
import { signIn, signUp, signOut, deleteAccount, AuthError } from '../../services/auth';
import { deleteSearchHistory } from '../../services/search';
import { NetworkError } from '../../services/apiClient';
import { useFavourites } from '../../contexts/FavouritesContext';
import { useAuth } from '../../contexts/AuthContext';

const NAV_TOTAL_HEIGHT = 114;

const SUCCESS_DISPLAY_MS = 1600;
// Gap between the loading modal closing and the success modal opening.
// RN's Modal can silently fail to (re)present when another Modal (or a
// native Alert) is still mid-dismiss — a real close/reopen cycle with a
// short gap sidesteps that instead of relying on in-place content swaps.
const MODAL_HANDOFF_MS = 220;

function LoadingOverlay({ text }: { text: string | null }) {
  return (
    <Modal visible={!!text} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.statusCard}>
          <ActivityIndicator color={theme.colors.text1} size="small" />
          <Text style={styles.signOutText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

function SuccessOverlay({ text }: { text: string | null }) {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (text) {
      scale.setValue(0.6);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();
    }
  }, [text, scale]);

  return (
    <Modal visible={!!text} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.statusCard}>
          <Animated.View style={[styles.successBadge, { transform: [{ scale }] }]}>
            <Feather name="check" size={26} color="#fff" />
          </Animated.View>
          <Text style={styles.signOutText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

type FormMode = 'signin' | 'signup';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favourites, reloadFavourites, clearFavourites } = useFavourites();
  const { user, loading: authLoading, setUser } = useAuth();

  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const handoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStatusTimers = useCallback(() => {
    if (handoffTimer.current) clearTimeout(handoffTimer.current);
    if (successTimer.current) clearTimeout(successTimer.current);
  }, []);

  // Closes the loading modal, waits for it to fully dismiss, then opens a
  // fresh success modal — see MODAL_HANDOFF_MS comment above.
  const showSuccess = useCallback((text: string) => {
    clearStatusTimers();
    setLoadingText(null);
    handoffTimer.current = setTimeout(() => {
      setSuccessText(text);
      successTimer.current = setTimeout(() => setSuccessText(null), SUCCESS_DISPLAY_MS);
    }, MODAL_HANDOFF_MS);
  }, [clearStatusTimers]);

  useEffect(() => () => clearStatusTimers(), [clearStatusTimers]);

  const authState: 'loading' | 'signedIn' | 'signedOut' =
    authLoading ? 'loading' : user ? 'signedIn' : 'signedOut';

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
  }, [email, password, reloadFavourites, setUser]);

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
  }, [email, password, reloadFavourites, setUser]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    setLoadingText('Signing out…');
    try {
      await signOut();
    } catch {
      // best-effort — always clear local state
    }
    clearFavourites();
    setUser(null);
    setSigningOut(false);
    showSuccess('Signed out successfully');
  }, [clearFavourites, setUser, showSuccess]);

  const confirmDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all associated data — favourites and search history — and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);
            // Deferred so the native Alert has fully dismissed before our
            // Modal tries to present — presenting immediately can silently
            // no-op on iOS while the alert's dismiss animation is in flight.
            InteractionManager.runAfterInteractions(async () => {
              setLoadingText('Deleting account…');
              try {
                await deleteAccount();
                clearFavourites();
                setUser(null);
                showSuccess('Account deleted successfully');
              } catch (err) {
                setLoadingText(null);
                const message = err instanceof AuthError
                  ? err.message
                  : 'Could not delete your account. Please check your connection and try again.';
                Alert.alert('Deletion failed', message);
              } finally {
                setDeleting(false);
              }
            });
          },
        },
      ],
    );
  }, [clearFavourites, setUser, showSuccess]);

  const confirmDeleteSearchHistory = useCallback(() => {
    Alert.alert(
      'Delete search history?',
      'This permanently deletes your search history. Your favourites will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setClearingHistory(true);
            // See comment in confirmDeleteAccount — same Alert-dismiss race.
            InteractionManager.runAfterInteractions(async () => {
              setLoadingText('Deleting search history…');
              try {
                await deleteSearchHistory();
                showSuccess('Search history deleted successfully');
              } catch (err) {
                setLoadingText(null);
                const message = err instanceof AuthError
                  ? err.message
                  : 'Could not delete your search history. Please check your connection and try again.';
                Alert.alert('Deletion failed', message);
              } finally {
                setClearingHistory(false);
              }
            });
          },
        },
      ],
    );
  }, [showSuccess]);

  const displayName = user?.name ?? (user?.email ? user.email.split('@')[0] : null);

  // ── Loading ───────────────────────────────────────────────────────────────
  let content: React.ReactNode;
  if (authState === 'loading') {
    content = (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.colors.bg1 }]}>
        <ActivityIndicator color={theme.colors.text2} />
      </View>
    );
  } else if (authState === 'signedOut') {
    // ── Signed out — show login / signup form ───────────────────────────────
    content = (
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
  } else {
    // ── Signed in ───────────────────────────────────────────────────────────
    content = (
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
          <Pressable style={styles.menuRow} onPress={handleSignOut} disabled={signingOut}>
            <View style={[styles.menuIcon, styles.menuIconDanger]}>
              {signingOut ? (
                <ActivityIndicator color="#E53935" size="small" />
              ) : (
                <Feather name="log-out" size={18} color="#E53935" />
              )}
            </View>
            <Text style={[styles.menuLabel, { color: '#E53935' }]}>Sign out</Text>
          </Pressable>
        </View>

        {/* Search history deletion */}
        <View style={[styles.menu, { marginTop: theme.spacing.s4 }]}>
          <Pressable
            style={styles.menuRow}
            onPress={confirmDeleteSearchHistory}
            disabled={clearingHistory}
          >
            <View style={styles.menuIcon}>
              {clearingHistory ? (
                <ActivityIndicator color={theme.colors.text1} size="small" />
              ) : (
                <Feather name="clock" size={18} color={theme.colors.text1} />
              )}
            </View>
            <Text style={styles.menuLabel}>Delete Search History</Text>
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

  return (
    <>
      {content}
      <LoadingOverlay text={loadingText} />
      <SuccessOverlay text={successText} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { flexGrow: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    paddingVertical: 22,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
    ...theme.shadows.card,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text1,
    textAlign: 'center',
  },
  successBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
