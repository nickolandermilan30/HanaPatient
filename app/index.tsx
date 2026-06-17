import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasAccepted = await AsyncStorage.getItem('hasAcceptedTerms');
      if (hasAccepted === 'true') {
        // Kung na-accept na dati, rekta na sa Register
        router.replace('/Layout/Register');
      } else {
        setLoading(false); // Manatili sa welcome screen
      }
    } catch (e) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.centerContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../Image/Logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>Your trusted partner in health and wellness management.</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={() => router.push('/Terms/Term2')}
      >
        <Text style={styles.buttonText}>START</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF', padding: 20, justifyContent: 'space-between' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  logo: { width: '100%', height: '100%' },
  textContainer: { alignItems: 'center', paddingHorizontal: 20 },
  subtitle: { fontSize: 16, color: '#7B1FA2', textAlign: 'center', lineHeight: 22 },
  button: {
    backgroundColor: '#6A1B9A', paddingVertical: 18, borderRadius: 30, alignItems: 'center',
    shadowColor: '#4A148C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
    elevation: 8, marginBottom: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});