import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Modal, TextInput, Alert, ScrollView, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, storage } from '../../Firebase/FirebaseConfig'; 
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const services = [
  { id: '1', title: 'Tooth Extraction', sub: '(Bunot)', icon: require('../../Image/extraction.png'), path: '/Layout/Services/TE' },
  { id: '2', title: 'Tooth Restoration', sub: '(Pasta)', icon: require('../../Image/restoration.png'), path: '/Layout/Services/TR' },
  { id: '3', title: 'Oral Prophylaxis', sub: '(Linis)', icon: require('../../Image/prophylaxis.png'), path: '/Layout/Services/OP' },
  { id: '4', title: 'Complete Denture', sub: '(Pustiso sa lahat ng ngipin)', icon: require('../../Image/complete_denture.png'), path: '/Layout/Services/CD' },
  { id: '5', title: 'Fixed Partial Denture', sub: '(Nakapirming pustiso)', icon: require('../../Image/fixed_denture.png'), path: '/Layout/Services/FPD' },
  { id: '6', title: 'Removable Partial Denture', sub: '(Natatanggal na pustiso)', icon: require('../../Image/removable.png'), path: '/Layout/Services/RPD' },
  { id: '7', title: 'Bleaching', sub: '(Pagpaputi ng ngipin)', icon: require('../../Image/bleaching.png'), path: '/Layout/Services/BL' },
  { id: '8', title: 'Fluoride Application', sub: '(Proteksyon sa ngipin)', icon: require('../../Image/fluoride.png'), path: '/Layout/Services/FA' },
  { id: '9', title: 'Sealant Application', sub: '(Sealant sa ngipin)', icon: require('../../Image/sealant.png'), path: '/Layout/Services/SA' },
];

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [concernText, setConcernText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (auth.currentUser) setUserEmail(auth.currentUser.email || '');
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
  };

  const submitConcern = async () => {
    if (!concernText) return Alert.alert("Ops!", "Please write your concern.");
    setLoading(true);

    try {
      const imageUrls = await Promise.all(images.map(async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `concerns/${Date.now()}_${Math.random()}.jpg`;
        const sRef = storageRef(storage, filename);
        await uploadBytes(sRef, blob);
        return await getDownloadURL(sRef);
      }));

      const newConcernRef = push(dbRef(db, 'concerns'));
      await set(newConcernRef, {
        email: userEmail,
        concern: concernText,
        images: imageUrls,
        date: new Date().toISOString()
      });

      Alert.alert("Success", "Concern submitted successfully!");
      setModalVisible(false);
      setConcernText('');
      setImages([]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E1BEE7" />
      
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Image source={require('../../Image/Logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.headerTitle}>Which Dental Service do you need?</Text>
      </View>

      <FlatList
        data={services}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(item.path as any)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.otherButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.otherButtonText}>Other Concern</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Other Concerns</Text>
            <Text style={styles.subtitle}>If your concern is not in the list, tell us about it below.</Text>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.emailContainer}>
               <Ionicons name="mail" size={20} color="#7B1FA2" style={{marginRight: 10}}/>
               <Text style={styles.emailText}>{userEmail}</Text>
            </View>

            <Text style={styles.label}>Your Concern</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Type your concern here..." 
              multiline 
              value={concernText} 
              onChangeText={setConcernText} 
            />
            
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text style={styles.uploadButtonText}> Upload Photos</Text>
            </TouchableOpacity>

            <ScrollView horizontal style={styles.imageScroll}>
              {images.map((uri, i) => <Image key={i} source={{ uri }} style={styles.thumbnail} />)}
            </ScrollView>

            {loading ? <ActivityIndicator size="large" color="#4A148C" /> : (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                  <Text style={{color: '#666', fontWeight: 'bold'}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={submitConcern}>
                  <Text style={{color: '#FFF', fontWeight: 'bold'}}>Submit Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { alignItems: 'center', padding: 15, backgroundColor: '#E1BEE7', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 40 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logo: { width: 65, height: 65 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A148C', textAlign: 'center', paddingHorizontal: 20 },
  grid: { paddingHorizontal: 10, paddingBottom: 20, alignItems: 'center' },
  card: { width: 105, height: 150, backgroundColor: '#E1BEE7', margin: 6, borderRadius: 15, alignItems: 'center', padding: 8 },
  icon: { width: 60, height: 60, marginBottom: 8 },
  cardTitle: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#2C0657' },
  cardSub: { fontSize: 8, textAlign: 'center', color: '#4A148C', marginTop: 4 },
  otherButton: { backgroundColor: '#E1BEE7', padding: 20, margin: 20, borderRadius: 20, alignItems: 'center' },
  otherButtonText: { fontSize: 18, fontWeight: 'bold', color: '#4A148C' },
  
  modalView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#4A148C' },
  subtitle: { fontSize: 14, color: '#7B1FA2', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#4A148C', marginBottom: 8, marginTop: 10 },
  emailContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', padding: 12, borderRadius: 12, marginBottom: 5 },
  emailText: { color: '#4A148C', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', backgroundColor: '#F9F9F9' },
  uploadButton: { flexDirection: 'row', backgroundColor: '#BA68C8', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  uploadButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  imageScroll: { marginBottom: 20, height: 90 },
  thumbnail: { width: 80, height: 80, borderRadius: 12, marginRight: 10 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { padding: 18, borderRadius: 15, width: '48%', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#E0E0E0' },
  submitBtn: { backgroundColor: '#4A148C' }
});