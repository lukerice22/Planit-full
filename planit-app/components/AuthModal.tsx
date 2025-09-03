import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  useWindowDimensions,
  Alert,
  ScrollView
} from 'react-native';
import { Asset } from 'expo-asset';
import { auth, db } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PlanitAuthModal({ visible, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp'); // start in Sign Up mode
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const modalWidth = width > 500 ? 400 : width * 0.85;

  // Preload hero images
  useEffect(() => {
    const preloadImages = async () => {
      await Promise.all([
        Asset.fromModule(require('@/assets/images/BigSur_optimized.jpg')).downloadAsync(),
        Asset.fromModule(require('@/assets/images/Desert-background_optimized.jpg')).downloadAsync(),
      ]);
    };
    preloadImages();
  }, []);

  // Hero image logic
  const bgImage =
    mode === 'signIn'
      ? require('@/assets/images/BigSur_optimized.jpg')
      : require('@/assets/images/Desert-background_optimized.jpg');

  // Fun tags + quotes
  const baseTags = [
    'Trips are temporary, Planit is forever',
    'Life’s better with a carry-on 🧳',
    'Weekend trip warrior',
    'Jobs fill your pocket, adventures fill your soul',
    'Pin it. Planit. Live it.',
    'Adventure awaits! ✈️',
    '🌴 Sunsets are better abroad.',
    "🚶 I'm walkin' here!",
    '🗺️ Sometimes wrong turns lead to the best stories.',
    'The journey of a thousand miles begins with a single step. – Lao Tzu',
    'Exploration is the essence of the human spirit. – Frank Borman',
  ];

  const tag = useMemo(() => {
    const isEasterEgg = Math.floor(Math.random() * 100) === 0;
    return isEasterEgg
      ? 'WINNER! to claim your free trip Click here 🎁'
      : baseTags[Math.floor(Math.random() * baseTags.length)];
  }, [mode, visible]);

  // Google Sign-In Setup
  const redirectUri = makeRedirectUri({ scheme: 'planitapp' });
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '207239909657-ru99oue2vllr7up5f9l9tdj7tqmrud8t.apps.googleusercontent.com',
    iosClientId: '207239909657-u142rae1egj7ub24a9nn0drohf30vj3h.apps.googleusercontent.com',
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (!idToken) {
        setError('No ID token returned from Google');
        return;
      }

      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential)
        .then(userCred => console.log('Google signed in:', userCred.user.uid))
        .catch(err => {
          console.error(' Google sign-in error:', err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

  // Password validation
  const validatePassword = (pwd: string) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return pwd.length >= 8 && hasUpper && hasSpecial;
  };

  // Debounced username check
  useEffect(() => {
    if (mode === 'signIn' || !username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const lower = username.trim().toLowerCase();
    setCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, 'usernames', lower);
        const docSnap = await getDoc(docRef);
        setUsernameAvailable(!docSnap.exists());
      } catch (err) {
        console.error('Username check error:', err);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timer);
  }, [username, mode]);

  const handleSubmit = async () => {
    setError(null);

    if (mode === 'signUp') {
      if (!username.trim()) return setError('Please enter a username.');
      if (usernameAvailable === false) return setError('Username is already taken.');
      if (!validatePassword(password))
        return setError('Password must be 8+ chars, 1 uppercase, 1 special character.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
    }

    if (!email.trim()) return setError('Please enter a valid email.');
    if (!password) return setError('Please enter a password.');

    setLoading(true);
    try {
      if (mode === 'signIn') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);

        // Set display name for ExpandedNav
        await updateProfile(userCred.user, { displayName: username.trim() });

        // Reserve username
        const lower = username.trim().toLowerCase();
        await setDoc(doc(db, 'usernames', lower), { uid: userCred.user.uid });

        // Create user profile
        await setDoc(doc(db, 'users', userCred.user.uid), {
          username: username.trim(),
          email: email.trim(),
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') setError('That email looks invalid.');
      else if (err.code === 'auth/user-not-found') setError('No account found with that email.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (err.code === 'auth/email-already-in-use') setError('Email is already in use.');
      else setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleTagPress = () => {
    if (tag?.includes('WINNER!')) Alert.alert('just kidding');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardContainer, { width: modalWidth, maxHeight: '75%' }]}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            <ImageBackground
              source={bgImage}
              style={styles.heroImage}
              imageStyle={{ borderRadius: 12, resizeMode: 'cover' }}
            >
              <View style={styles.heroOverlay}>
                <Text style={styles.title}>
                  {mode === 'signIn'
                    ? 'Welcome back Explorer!\nSign in to continue.'
                    : 'Welcome to Planit!\nExplore more by signing up.'}
                </Text>
              </View>
            </ImageBackground>

            {mode === 'signUp' && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#999" style={styles.icon} />
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#999"
                  style={styles.input}
                  autoCapitalize="none"
                  textContentType="none"
                  autoComplete="off"
                  value={username}
                  onChangeText={(text) => setUsername(text.replace(/[^a-zA-Z0-9_]/g, ''))}
                />
                {checkingUsername && <ActivityIndicator size="small" color="#ff7a00" />}
                {usernameAvailable === false && <Text style={{ color: 'red', fontSize: 12 }}>Taken</Text>}
                {usernameAvailable && <Text style={{ color: 'green', fontSize: 12 }}>Available</Text>}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#999" style={styles.icon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="none"
                autoComplete="off"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.icon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                textContentType="oneTimeCode"
                autoComplete="off"
              />
            </View>

            {mode === 'signUp' && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.icon} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
              </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.submitText}>
                  {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={switchMode} style={styles.switchModeButton}>
              <Text style={styles.switchText}>
                {mode === 'signIn'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.guestButton}>
              <Text style={styles.guestText}>Continue as guest (limited functionality)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleTagPress}>
              <Text style={styles.quote}>{tag}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  keyboardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'flex-start', 
  },
  closeButton: { position: 'absolute', top: 2, right: 6, zIndex: 10, padding: 4 },
  closeText: { fontSize: 15, color: 'grey' },
  heroImage: { width: '100%', height: 140, marginBottom: 15 },
  heroOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12, paddingHorizontal: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    backgroundColor: '#f9f9f9', marginBottom: 12, paddingHorizontal: 10,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, padding: 12, fontSize: 16, color: '#333' },
  submitButton: {
    width: '100%', backgroundColor: '#ff7a00', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 16,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  googleButton: {
    width: '100%', borderWidth: 1, borderColor: '#ff7a00', borderRadius: 10,
    padding: 12, alignItems: 'center', marginBottom: 12, backgroundColor: '#fff',
  },
  googleText: { color: '#ff7a00', fontWeight: '700', fontSize: 16 },
  switchModeButton: { marginTop: 10, marginBottom: 20 },
  switchText: { color: '#ff7a00', fontWeight: '600', textAlign: 'center' },
  guestButton: { marginBottom: 10 },
  guestText: { color: '#999', fontSize: 12, textAlign: 'center' },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
  quote: { marginTop: 16, fontSize: 14, color: '#555', textAlign: 'center', fontStyle: 'italic' },
});