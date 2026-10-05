
import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        language === 'en'
          ? 'Missing details'
          : 'जानकारी अधूरी है',
        language === 'en'
          ? 'Please enter your email and password.'
          : 'कृपया अपना ईमेल और पासवर्ड दर्ज करें।'
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert(
          language === 'en'
            ? 'Login failed'
            : 'लॉगिन विफल',
          error.message
        );
        return;
      }

      if (!data.user) {
        Alert.alert(
          language === 'en'
            ? 'Error'
            : 'त्रुटि',
          language === 'en'
            ? 'User account not found.'
            : 'उपयोगकर्ता खाता नहीं मिला।'
        );
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        Alert.alert(
          language === 'en'
            ? 'Profile error'
            : 'प्रोफ़ाइल त्रुटि',
          profileError.message
        );
        return;
      }

      if (profile?.role === 'artisan') {
        router.replace('/');
      } else if (profile?.role === 'buyer') {
        router.replace('/buyer');
      } else {
        Alert.alert(
          language === 'en'
            ? 'Invalid role'
            : 'अमान्य भूमिका',
          language === 'en'
            ? 'Your account role could not be identified.'
            : 'आपके खाते की भूमिका की पहचान नहीं हो सकी।'
        );
      }

    } catch (error) {
      console.log('LOGIN ERROR:', error);

      Alert.alert(
        language === 'en'
          ? 'Error'
          : 'त्रुटि',
        language === 'en'
          ? 'Something went wrong. Please try again.'
          : 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Language Switch */}

      <View style={styles.languageSwitch}>

        <Pressable
          onPress={() => setLanguage('en')}
          style={[
            styles.languageButton,
            language === 'en' &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              language === 'en' &&
                styles.selectedLanguageText,
            ]}
          >
            English
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setLanguage('hi')}
          style={[
            styles.languageButton,
            language === 'hi' &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              language === 'hi' &&
                styles.selectedLanguageText,
            ]}
          >
            हिंदी
          </Text>
        </Pressable>

      </View>

      {/* Heading */}

      <Text style={styles.title}>
        {t.welcomeBack}
      </Text>

      <Text style={styles.subtitle}>
        {t.signInToContinue}
      </Text>

      {/* Email */}

      <TextInput
        style={styles.input}
        placeholder={t.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}

      <TextInput
        style={styles.input}
        placeholder={t.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Sign In */}

      <Pressable
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? t.signingIn
            : t.signIn}
        </Text>
      </Pressable>

      {/* Create Account */}

      <View style={styles.signupContainer}>

        <Text style={styles.signupText}>
          {t.dontHaveAccount}
        </Text>

        <Pressable
          onPress={() =>
            router.push('/signup')
          }
        >
          <Text style={styles.signupLink}>
            {t.createAccount}
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8F3E8',
  },

  languageSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#F4EEFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 25,
  },

  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  selectedLanguage: {
    backgroundColor: '#4c8044',
  },

  languageText: {
    fontSize: 13,
    color: '#4c8044',
    fontWeight: '600',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#345b2e',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#345b2e',
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D9D1E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    fontSize: 15,
    color: '#345b2e',
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#4c8044',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  signupText: {
    fontSize: 14,
    color: '#77717D',
  },

  signupLink: {
    fontSize: 14,
    color: '#345b2e',
    fontWeight: '700',
    marginLeft: 5,
  },
});

