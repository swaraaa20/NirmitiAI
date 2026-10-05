import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { supabase } from '../services/supabase';
import { router } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [role, setRole] =
    useState<'artisan' | 'buyer'>('artisan');

  const [loading, setLoading] = useState(false);

  const {
    language,
    setLanguage,
  } = useLanguage();

  const isEnglish = language === 'en';

  const handleSignup = async () => {
    if (
      !fullName ||
      !email ||
      !password ||
      !phone
    ) {
      Alert.alert(
        isEnglish
          ? 'Missing details'
          : 'जानकारी अधूरी है',
        isEnglish
          ? 'Please fill in all fields.'
          : 'कृपया सभी फ़ील्ड भरें।'
      );

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert(
        isEnglish
          ? 'Invalid email'
          : 'अमान्य ईमेल',
        isEnglish
          ? 'Please enter a valid email address.'
          : 'कृपया एक मान्य ईमेल पता दर्ज करें।'
      );

      return;
    }

    if (password.length < 6) {
      Alert.alert(
        isEnglish
          ? 'Weak password'
          : 'कमज़ोर पासवर्ड',
        isEnglish
          ? 'Password must be at least 6 characters.'
          : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
      );

      return;
    }

    if (phone.length !== 10) {
      Alert.alert(
        isEnglish
          ? 'Invalid phone number'
          : 'अमान्य फ़ोन नंबर',
        isEnglish
          ? 'Please enter a valid 10-digit phone number.'
          : 'कृपया एक मान्य 10 अंकों का फ़ोन नंबर दर्ज करें।'
      );

      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert(
          isEnglish
            ? 'Signup failed'
            : 'पंजीकरण विफल',
          error.message
        );

        return;
      }

      if (!data.user) {
        Alert.alert(
          isEnglish
            ? 'Error'
            : 'त्रुटि',
          isEnglish
            ? 'User account was not created.'
            : 'उपयोगकर्ता खाता नहीं बनाया गया।'
        );

        return;
      }

      const {
        error: profileError,
      } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
          phone: phone,
        });

      if (profileError) {
        console.log(
          'PROFILE ERROR:',
          profileError
        );

        Alert.alert(
          isEnglish
            ? 'Profile error'
            : 'प्रोफ़ाइल त्रुटि',
          JSON.stringify(
            profileError,
            null,
            2
          )
        );

        return;
      }

      Alert.alert(
        isEnglish
          ? 'Account created!'
          : 'खाता बन गया!',
        isEnglish
          ? 'Welcome to निर्मितिAI.'
          : 'निर्मितिAI में आपका स्वागत है।'
      );

      router.replace('/login');

    } catch (error) {
      console.log(
        'SIGNUP ERROR:',
        error
      );

      Alert.alert(
        isEnglish
          ? 'Error'
          : 'त्रुटि',
        isEnglish
          ? 'Something went wrong.'
          : 'कुछ गलत हो गया।'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.languageSwitch}>

        <Pressable
          onPress={() => setLanguage('en')}
          style={[
            styles.languageButton,
            isEnglish &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              isEnglish &&
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
            !isEnglish &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              !isEnglish &&
                styles.selectedLanguageText,
            ]}
          >
            हिंदी
          </Text>
        </Pressable>

      </View>

      <View style={styles.logoSection}>

        <Text style={styles.logo}>
          निर्मिति<Text style={styles.ai}>AI</Text>
        </Text>

        <Text style={styles.tagline}>
          {isEnglish
            ? 'Made at home. Ready for the world.'
            : 'घर पर बनाया, दुनिया तक पहुँचाया।'}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.title}>
          {isEnglish
            ? 'Create your account'
            : 'अपना खाता बनाएं'}
        </Text>

        <Text style={styles.subtitle}>
          {isEnglish
            ? 'Start your journey with निर्मितिAI'
            : 'निर्मितिAI के साथ अपनी यात्रा शुरू करें'}
        </Text>

        <Text style={styles.label}>
          {isEnglish
            ? 'Full Name'
            : 'पूरा नाम'}
        </Text>

        <TextInput
          placeholder={
            isEnglish
              ? 'Enter your name'
              : 'अपना नाम दर्ज करें'
          }
          placeholderTextColor="#9A958C"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />

        <Text style={styles.label}>
          {isEnglish
            ? 'Phone Number'
            : 'फ़ोन नंबर'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={
            isEnglish
              ? 'Enter 10-digit number'
              : '10 अंकों का नंबर दर्ज करें'
          }
          placeholderTextColor="#9A958C"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>
          {isEnglish
            ? 'Email'
            : 'ईमेल'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={
            isEnglish
              ? 'Enter your email'
              : 'अपना ईमेल दर्ज करें'
          }
          placeholderTextColor="#9A958C"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>
          {isEnglish
            ? 'Password'
            : 'पासवर्ड'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={
            isEnglish
              ? 'Create a password'
              : 'पासवर्ड बनाएं'
          }
          placeholderTextColor="#9A958C"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.roleTitle}>
          {isEnglish
            ? 'How will you use निर्मितिAI?'
            : 'आप निर्मितिAI का उपयोग कैसे करेंगे?'}
        </Text>

        <View style={styles.roleContainer}>

          <Pressable
            style={[
              styles.roleCard,
              role === 'artisan' &&
                styles.selectedRole,
            ]}
            onPress={() =>
              setRole('artisan')
            }
          >

            <Text style={styles.roleEmoji}>
              🏡
            </Text>

            <Text
              style={[
                styles.roleHeading,
                role === 'artisan' &&
                  styles.selectedRoleText,
              ]}
            >
              {isEnglish
                ? 'Maker'
                : 'मेकर'}
            </Text>

            <Text style={styles.roleDescription}>
              {isEnglish
                ? 'Sell what I make at home'
                : 'घर पर बनाई चीज़ें बेचें'}
            </Text>

          </Pressable>

          <Pressable
            style={[
              styles.roleCard,
              role === 'buyer' &&
                styles.selectedRole,
            ]}
            onPress={() =>
              setRole('buyer')
            }
          >

            <Text style={styles.roleEmoji}>
              🛍️
            </Text>

            <Text
              style={[
                styles.roleHeading,
                role === 'buyer' &&
                  styles.selectedRoleText,
              ]}
            >
              {isEnglish
                ? 'Buyer'
                : 'खरीदार'}
            </Text>

            <Text style={styles.roleDescription}>
              {isEnglish
                ? 'Discover products made at home'
                : 'घर पर बने उत्पाद खोजें'}
            </Text>

          </Pressable>

        </View>

        <Pressable
          style={[
            styles.button,
            loading &&
              styles.disabledButton,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? isEnglish
                ? 'Creating account...'
                : 'खाता बनाया जा रहा है...'
              : isEnglish
                ? 'Create Account'
                : 'खाता बनाएं'}
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          {isEnglish
            ? 'By joining निर्मितिAI, you become part of a community supporting homegrown businesses.'
            : 'निर्मितिAI से जुड़कर आप घर से चलने वाले व्यवसायों को बढ़ावा देने वाले समुदाय का हिस्सा बनते हैं।'}
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F7F4E9',
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 35,
  },

  languageSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#E7EBDD',
    borderRadius: 22,
    padding: 4,
    marginBottom: 28,
  },

  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
  },

  selectedLanguage: {
    backgroundColor: '#456B42',
  },

  languageText: {
    fontSize: 13,
    color: '#68705F',
    fontWeight: '600',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: 22,
  },

  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#456B42',
    letterSpacing: 0.5,
  },

  ai: {
    color: '#B78B3C',
  },

  tagline: {
    marginTop: 7,
    fontSize: 13,
    color: '#777267',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFDF6',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5E0D2',
    shadowColor: '#3E4937',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#343A2F',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777267',
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4C5145',
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D9D5C9',
    borderRadius: 13,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    fontSize: 15,
    color: '#343A2F',
  },

  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#343A2F',
    marginTop: 3,
    marginBottom: 11,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  roleCard: {
    flex: 1,
    minHeight: 125,
    padding: 13,
    borderWidth: 1,
    borderColor: '#D9D5C9',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRole: {
    backgroundColor: '#EEF3E8',
    borderColor: '#456B42',
    borderWidth: 2,
  },

  roleEmoji: {
    fontSize: 26,
    marginBottom: 5,
  },

  roleHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4C5145',
    marginBottom: 4,
  },

  selectedRoleText: {
    color: '#456B42',
  },

  roleDescription: {
    fontSize: 11,
    color: '#817A70',
    textAlign: 'center',
    lineHeight: 15,
  },

  button: {
    height: 53,
    borderRadius: 14,
    backgroundColor: '#456B42',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  footerText: {
    marginTop: 17,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: '#8A847A',
  },

});