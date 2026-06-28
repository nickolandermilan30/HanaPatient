import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Modal, TextInput, Alert, ScrollView, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, storage } from '../../Firebase/FirebaseConfig'; 
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

const services = [
  { id: '1', title: 'Tooth Extraction', sub: 'Bunot', icon: require('../../Image/extraction.png'), path: '/Layout/Services/TE' },
  { id: '2', title: 'Tooth Restoration', sub: 'Pasta', icon: require('../../Image/restoration.png'), path: '/Layout/Services/TR' },
  { id: '3', title: 'Oral Prophylaxis', sub: 'Linis', icon: require('../../Image/prophylaxis.png'), path: '/Layout/Services/OP' },
  { id: '4', title: 'Complete Denture', sub: 'Pustiso', icon: require('../../Image/complete_denture.png'), path: '/Layout/Services/CD' },
  { id: '5', title: 'Fixed Partial Denture', sub: 'Fixed Pustiso', icon: require('../../Image/fixed_denture.png'), path: '/Layout/Services/FPD' },
  { id: '6', title: 'Removable Partial Denture', sub: 'Removable', icon: require('../../Image/removable.png'), path: '/Layout/Services/RPD' },
  { id: '7', title: 'Bleaching', sub: 'Pagpaputi', icon: require('../../Image/bleaching.png'), path: '/Layout/Services/BL' },
  { id: '8', title: 'Fluoride', sub: 'Proteksyon', icon: require('../../Image/fluoride.png'), path: '/Layout/Services/FA' },
  { id: '9', title: 'Sealant', sub: 'Sealant', icon: require('../../Image/sealant.png'), path: '/Layout/Services/SA' },
];

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [concernText, setConcernText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (auth.currentUser) setUserEmail(auth.currentUser.email || '');
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLogoutModalVisible(false);
      router.replace('/');
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
  };

  const removeImage = (uriToRemove: string) => {
    setImages(prev => prev.filter(uri => uri !== uriToRemove));
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
      await set(newConcernRef, { email: userEmail, concern: concernText, images: imageUrls, date: new Date().toISOString() });
      Alert.alert("Success", "Concern submitted!");
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
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.actionBox}>
          <TouchableOpacity onPress={() => router.push('/Layout/Account')} style={styles.iconCircle}>
            <Ionicons name="person" size={22} color="#4A148C" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={styles.iconCircle}>
            <Ionicons name="log-out" size={22} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoCircle}>
          <Image source={require('../../Image/Logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.headerTitle}>Dental Services</Text>

        {/* BAGO: Applied Service Button */}
        <TouchableOpacity 
          style={styles.appliedBtn} 
          onPress={() => router.push('/Layout/ServiceApply')}
        >
          <Ionicons name="document-text" size={18} color="#4A148C" />
          <Text style={styles.appliedBtnText}> Applied Services</Text>
        </TouchableOpacity>
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
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFF" />
        <Text style={styles.otherButtonText}> Other Concern</Text>
      </TouchableOpacity>

      {/* Modals remain the same... */}
      <Modal animationType="fade" transparent={true} visible={logoutModalVisible}>
        <View style={styles.centeredModal}>
          <View style={styles.logoutBox}>
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutText}>Are you sure you want to exit?</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setLogoutModalVisible(false)}>
                <Text style={{fontWeight: 'bold', color: '#555'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#4A148C' }]} onPress={handleLogout}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Other Concern</Text>
            <TextInput style={styles.input} placeholder="Detail your concern..." multiline value={concernText} onChangeText={setConcernText} />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text style={styles.uploadButtonText}> Attach Photos</Text>
            </TouchableOpacity>
            <ScrollView horizontal style={styles.imageScroll}>
              {images.map((uri, i) => (
                <TouchableOpacity key={i} onPress={() => removeImage(uri)}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <View style={styles.removeBadge}><Ionicons name="close" size={20} color="#FFF"/></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={{fontWeight: 'bold', color: '#555'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#4A148C' }]} onPress={submitConcern}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{color: '#FFF', fontWeight: 'bold'}}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { paddingHorizontal: 25, paddingTop: 50, paddingBottom: 30, backgroundColor: '#E1BEE7', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center' },
  actionBox: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logo: { width: 60, height: 60 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  // BAGO: Estilo ng Applied Service Button
  appliedBtn: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  appliedBtnText: { color: '#4A148C', fontWeight: 'bold', marginLeft: 5 },
  grid: { padding: 10 },
  card: { width: '30%', backgroundColor: '#FFF', margin: 5, borderRadius: 15, alignItems: 'center', padding: 10, elevation: 3 },
  icon: { width: 40, height: 40, marginBottom: 5 },
  cardTitle: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#000000' },
  cardSub: { fontSize: 8, textAlign: 'center', color: '#888', marginTop: 2 },
  otherButton: { flexDirection: 'row', backgroundColor: '#E1BEE7', padding: 18, margin: 20, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  otherButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  centeredModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  logoutBox: { width: '85%', backgroundColor: '#FFF', padding: 30, borderRadius: 30, alignItems: 'center' },
  logoutTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A148C' },
  logoutText: { marginVertical: 15 },
  modalView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, height: '75%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top' },
  uploadButton: { flexDirection: 'row', backgroundColor: '#E1BEE7', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  uploadButtonText: { color: '#ffffff', fontWeight: 'bold', marginLeft: 8 },
  thumbnail: { width: 70, height: 70, borderRadius: 15, marginRight: 10 },
  removeBadge: { position: 'absolute', right: 10, top: 0, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center' },
  imageScroll: { marginBottom: 20 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btn: { padding: 15, borderRadius: 15, width: '48%', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F0F0' }
});