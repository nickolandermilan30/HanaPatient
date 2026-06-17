import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Term1() {
  const router = useRouter();

  return (
    <View style={styles.modalContainer}>
      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image 
            source={require('../../Image/Logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>What is HanaPatient?</Text>
          <Text style={styles.description}>
            HanaPatient is a patient contact management application developed to assist dental clinicians 
            in efficiently finding and managing patients according to specific clinical case requirements. 
            The application serves as a centralized platform where patient information can be organized, 
            stored, and accessed conveniently, reducing the time and effort required in manual patient searching.
            {'\n\n'}
            The app was created in response to the challenges faced by dental clinicians in locating suitable 
            patients for clinical cases and academic requirements. By streamlining patient identification, 
            and communication HanaPatient helps lessen the burden on clinicians, improves workflow efficiency, 
            and supports the timely completion of clinical requirements. Ultimately, the application aims 
            to enhance patient management practices and contribute to a more organized and productive 
            clinical learning environment.
          </Text>
        </ScrollView>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('./Term2')} // Dito ang navigation papuntang Term2
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Gamitin ang parehong styles object sa ibaba

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '85%', // Para hindi lumampas sa screen
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
});