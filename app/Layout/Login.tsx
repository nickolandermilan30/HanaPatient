import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../Firebase/FirebaseConfig'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // States para sa Forgot Password Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/Layout/Home');
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert("Success", "Password reset email sent! Check your inbox.");
      setModalVisible(false);
      setResetEmail('');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Forgot Password Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSub}>Enter your email to receive a reset link.</Text>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.loginButton} onPress={handlePasswordReset}>
              <Text style={styles.loginButtonText}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image source={require('../../Image/Logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.logInTitle}>Log in</Text>
        <Text style={styles.subTitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.forgotPassword}>Forgot Password</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/Layout/Register')}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E1BEE7' },
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 240, height: 240, borderRadius: 125, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3 },
  logo: { width: 130, height: 130 },
  bottomSection: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 40, paddingTop: 50 },
  logInTitle: { fontSize: 32, fontWeight: 'bold', color: '#4A148C', textAlign: 'center' },
  subTitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#F5F5F5', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 30, marginBottom: 20, fontSize: 16, width: '100%' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 20, borderRadius: 30, marginBottom: 20 },
  passwordInput: { flex: 1, paddingVertical: 15, fontSize: 16 },
  loginButton: { backgroundColor: '#6A1B9A', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginBottom: 20, width: '100%' },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  forgotPassword: { textAlign: 'center', color: '#6A1B9A', fontWeight: '600', marginBottom: 20 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  noAccountText: { color: '#666', fontSize: 14 },
  registerButtonText: { color: '#6A1B9A', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 25, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  modalSub: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  cancelText: { color: '#666', fontWeight: 'bold', marginTop: 10 }
});