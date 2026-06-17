import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Term5() {
  const router = useRouter();
  const [isBottomReached, setIsBottomReached] = useState(false);

  // Function para i-check kung nasa dulo na ang scroll
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20; // threshold para masiguro na nasa dulo na
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setIsBottomReached(true);
    }
  };

  const handleAgree = async () => {
  try {
    await AsyncStorage.setItem('hasAcceptedTerms', 'true');
    router.replace('/Layout/Register'); // Gamitin ang replace para hindi na makabalik sa Terms
  } catch (e) {
    console.error("Failed to save agreement", e);
  }
};

  return (
    <View style={styles.modalContainer}>
      <View style={styles.card}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Para smooth ang detection
        >
          <Image 
            source={require('../../Image/Logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Terms & Conditions</Text>
          
          <Text style={styles.description}>
            <Text style={styles.boldText}>8. Account Suspension or Termination</Text>{'\n'}
            HanaPatient reserves the right to suspend, restrict, or terminate access to the application if a user:{'\n'}
            • Violates these Terms and Conditions;{'\n'}
            • Provides false information;{'\n'}
            • Engages in misuse of the platform; or{'\n'}
            • Conducts activities that may compromise the security, integrity, or operation of the application.{'\n\n'}
            
            <Text style={styles.boldText}>9. Changes to These Terms</Text>{'\n'}
            HanaPatient may revise these Terms and Conditions at any time. Updated versions will be posted within the application. Continued use of the application after such changes constitutes acceptance of the revised Terms.{'\n\n'}

            <Text style={styles.boldText}>10. Contact Information</Text>{'\n'}
            For concerns regarding your information, appointments, or these Terms and Conditions, please contact the HanaPatient Administration Team through the contact information provided within the application.{'\n\n'}

            <Text style={styles.boldText}>User Agreement</Text>{'\n'}
            By selecting "I Agree" and using HanaPatient, you acknowledge that:{'\n'}
            • ☑ You have read and understood these Terms and Conditions.{'\n'}
            • ☑ You consent to the collection and use of your information for dental case management purposes.{'\n'}
            • ☑ You understand that your information will only be accessible to authorized dental clinicians, faculty supervisors, and designated personnel of Ago Medical and Educational Center (AMEC).{'\n'}
            • ☑ You acknowledge that some dental procedures may require multiple visits and agree to cooperate in completing the treatment plan recommended by your assigned dental clinician.{'\n'}
            • ☑ You voluntarily agree to participate in the services provided through HanaPatient.
          </Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          
          {/* Continue button na disable kung hindi pa na-scroll sa baba */}
         <TouchableOpacity 
  style={[styles.navButton, { opacity: isBottomReached ? 1 : 0.3 }]} 
  onPress={handleAgree} // Tawagin ang function na ito
  disabled={!isBottomReached}
>
  <Text style={styles.buttonText}>Agree</Text>
</TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  card: { width: '100%', maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 5 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A148C', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: '#333', textAlign: 'left', lineHeight: 24 },
  boldText: { fontWeight: 'bold', color: '#000' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  navButton: { paddingVertical: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#6A1B9A' },
});