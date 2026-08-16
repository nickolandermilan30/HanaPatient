import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../../Firebase/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const { height } = Dimensions.get('window');

export default function Register() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  // treat anything above 700px (tablet/desktop/browser window) as "wide layout"
  const isWide = width >= 700;
  const cardMaxWidth = isWide ? 520 : '100%';

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', sex: '', age: '',
    dob: new Date(2000, 0, 1), address: '', contact: '', email: '', occupation: '',
    password: '', confirmPassword: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: '#ccc', progress: 0 });

  const validatePassword = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*]/.test(pass)) score++;

    if (pass.length === 0) setPasswordStrength({ label: '', color: '#ccc', progress: 0 });
    else if (score < 2) setPasswordStrength({ label: 'Weak', color: '#FF5252', progress: 0.33 });
    else if (score < 3) setPasswordStrength({ label: 'Fair', color: '#FFAB40', progress: 0.66 });
    else setPasswordStrength({ label: 'Strong', color: '#4CAF50', progress: 1 });
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
    if (key === 'password') validatePassword(value);
  };

  // ---- DOB handling: works on iOS / Android (native modal) AND Web (HTML input) ----
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setFormData({ ...formData, dob: selectedDate });
  };

  const onWebDateChange = (e: any) => {
    const value = e.target.value; // "YYYY-MM-DD"
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setFormData({ ...formData, dob: new Date(y, m - 1, d) });
    }
  };

  const formatDOB = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleRegister = async () => {
    if (Object.values(formData).some(val => val === '')) {
      Alert.alert("Ops!", "Please complete all fields.");
      return;
    }

    if (passwordStrength.label !== 'Strong') {
      Alert.alert("Security Alert", "Please use a stronger password (8+ chars, uppercase, and numbers).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await set(ref(db, 'users/' + userCredential.user.uid), {
        ...formData, dob: formData.dob.toISOString(), role: 'user'
      });
      Alert.alert("Success", "Account created!");
      router.push('/Layout/RegisterFillUp');
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={28} color="#7B1FA2" />
          </View>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subHeaderText}>Join our beautiful community</Text>
        </View>

        <View style={[styles.card, { maxWidth: cardMaxWidth, width: isWide ? cardMaxWidth : '100%' }]}>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={isWide ? styles.rowWide : undefined}>
            <TextInput
              style={[styles.input, isWide && styles.inputHalf]}
              placeholder="First Name"
              placeholderTextColor="#A98BB0"
              onChangeText={(v) => handleInputChange('firstName', v)}
            />
            <TextInput
              style={[styles.input, isWide && styles.inputHalf]}
              placeholder="Middle Name"
              placeholderTextColor="#A98BB0"
              onChangeText={(v) => handleInputChange('middleName', v)}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#A98BB0"
            onChangeText={(v) => handleInputChange('lastName', v)}
          />

          <View style={isWide ? styles.rowWide : undefined}>
            <View style={[styles.dropdownContainer, isWide && styles.inputHalf]}>
              <RNPickerSelect
                onValueChange={(v) => handleInputChange('sex', v)}
                items={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                placeholder={{ label: 'Select Sex', value: null }}
                style={pickerSelectStyles}
              />
            </View>

            <TextInput
              style={[styles.input, isWide && styles.inputHalf]}
              placeholder="Age"
              placeholderTextColor="#A98BB0"
              keyboardType="numeric"
              onChangeText={(v) => handleInputChange('age', v)}
            />
          </View>

          {/* ---- Date of Birth: native picker on mobile, HTML input on web ---- */}
          {isWeb ? (
            <View style={styles.webDateWrapper}>
              <Ionicons name="calendar-outline" size={18} color="#9C4FB0" style={styles.inputIcon} />
              {/* @ts-ignore - plain HTML input, valid on react-native-web */}
              <input
                type="date"
                value={formData.dob.toISOString().split('T')[0]}
                onChange={onWebDateChange}
                style={webDateInputStyle}
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#9C4FB0" style={styles.inputIcon} />
              <Text style={styles.dateText}>{formatDOB(formData.dob)}</Text>
            </TouchableOpacity>
          )}

          {!isWeb && showDatePicker && (
            <DateTimePicker
              value={formData.dob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}
          {!isWeb && showDatePicker && Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.iosDateDone} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.iosDateDoneText}>Done</Text>
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Contact & Security</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A98BB0"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(v) => handleInputChange('email', v)}
          />

          <View style={isWide ? styles.rowWide : undefined}>
            <TextInput
              style={[styles.input, isWide && styles.inputHalf]}
              placeholder="Contact Number"
              placeholderTextColor="#A98BB0"
              keyboardType="phone-pad"
              onChangeText={(v) => handleInputChange('contact', v)}
            />
            <TextInput
              style={[styles.input, isWide && styles.inputHalf]}
              placeholder="Occupation"
              placeholderTextColor="#A98BB0"
              onChangeText={(v) => handleInputChange('occupation', v)}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Address"
            placeholderTextColor="#A98BB0"
            onChangeText={(v) => handleInputChange('address', v)}
          />

          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#9C4FB0" style={styles.inputIcon} />
            <TextInput
              style={styles.passInput}
              placeholder="Password"
              placeholderTextColor="#A98BB0"
              secureTextEntry={!showPass}
              onChangeText={(v) => handleInputChange('password', v)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
              <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#BA68C8" />
            </TouchableOpacity>
          </View>

          {formData.password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${passwordStrength.progress * 100}%`, backgroundColor: passwordStrength.color }]} />
              </View>
              <View style={styles.strengthRow}>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label} Password</Text>
                <Text style={styles.hintText}>8+ chars • Uppercase • Number</Text>
              </View>
            </View>
          )}

          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#9C4FB0" style={styles.inputIcon} />
            <TextInput
              style={styles.passInput}
              placeholder="Confirm Password"
              placeholderTextColor="#A98BB0"
              secureTextEntry={!showConfirmPass}
              onChangeText={(v) => handleInputChange('confirmPassword', v)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPass ? "eye-off" : "eye"} size={20} color="#BA68C8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>Next Step</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRedirect} onPress={() => router.push('/Layout/Login')}>
            <Text style={styles.loginRedirectText}>I already have an account? <Text style={styles.loginRedirectBold}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Plain style object for the web <input type="date">
const webDateInputStyle: any = {
  flex: 1,
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: 15,
  color: '#4A2C57',
  fontFamily: 'inherit',
  padding: 0,
};

const pickerSelectStyles = {
  inputIOS: { fontSize: 15, paddingVertical: 14, color: '#4A2C57' },
  inputAndroid: { fontSize: 15, paddingVertical: 10, color: '#4A2C57' },
  inputWeb: { fontSize: 15, paddingVertical: 14, color: '#4A2C57', border: 'none', outline: 'none' } as any,
  placeholder: { color: '#A98BB0' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9C4FB0' },
  scrollContent: { paddingBottom: height * 0.06, alignItems: 'center' },
  scrollContentWide: { paddingTop: 24 },

  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20, alignItems: 'center' },
  logoCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  headerText: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
  subHeaderText: { color: '#F3E1F7', marginTop: 6, fontSize: 14 },

  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 18,
    padding: 22,
    borderRadius: 24,
    shadowColor: '#4A0072',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#BA68C8', marginRight: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#7B1FA2', textTransform: 'uppercase', letterSpacing: 0.5 },

  rowWide: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },

  input: {
    backgroundColor: '#FAF5FB',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#EBD9EF',
    fontSize: 15,
    color: '#4A2C57',
  },
  dropdownContainer: {
    backgroundColor: '#FAF5FB',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#EBD9EF',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },

  dateInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF5FB', paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 14, marginBottom: 12, borderWidth: 1.2, borderColor: '#EBD9EF',
  },
  dateText: { color: '#4A2C57', fontSize: 15 },
  iosDateDone: { alignSelf: 'flex-end', marginBottom: 12, marginTop: -6, paddingHorizontal: 6 },
  iosDateDoneText: { color: '#7B1FA2', fontWeight: '700', fontSize: 14 },

  webDateWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF5FB', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14, marginBottom: 12, borderWidth: 1.2, borderColor: '#EBD9EF',
  },

  inputIcon: { marginRight: 10 },

  passwordContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF5FB', borderRadius: 14, marginBottom: 6,
    borderWidth: 1.2, borderColor: '#EBD9EF', paddingHorizontal: 16,
  },
  passInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#4A2C57' },
  eyeIcon: { paddingLeft: 10 },

  strengthContainer: { marginBottom: 14, marginTop: 4 },
  progressTrack: { height: 5, borderRadius: 5, backgroundColor: '#EEE', overflow: 'hidden' },
  progressBar: { height: 5, borderRadius: 5 },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  strengthText: { fontSize: 12, fontWeight: '700' },
  hintText: { fontSize: 11, color: '#A98BB0' },

  nextButton: {
    flexDirection: 'row', gap: 8,
    backgroundColor: '#9C4FB0', paddingVertical: 15, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
    shadowColor: '#7B1FA2', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  loginRedirect: { marginTop: 18, alignItems: 'center' },
  loginRedirectText: { color: '#8A6B90', fontSize: 13 },
  loginRedirectBold: { color: '#7B1FA2', fontWeight: '700', textDecorationLine: 'underline' },
});