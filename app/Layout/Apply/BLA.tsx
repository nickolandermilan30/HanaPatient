import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function BLA() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const shadeOptions = ["A1", "A2", "A3", "A3.5", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4", "D2", "D3", "D4"];

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email);
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0 || !selectedShade) {
      Alert.alert("Error", "Please select a shade and attach at least one image.");
      return;
    }

    setLoading(true);
    try {
      // 1. I-upload ang bawat image sa Firebase Storage
      const uploadedUrls = await Promise.all(
        selectedImages.map(async (uri) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const filename = `bleaching/${Date.now()}_${Math.random()}.jpg`;
          const imageRef = storageRef(getStorage(), filename);
          await uploadBytes(imageRef, blob);
          return await getDownloadURL(imageRef); // Dito nakukuha ang public URL
        })
      );

      // 2. I-save ang data sa Realtime Database
      const dbRef = ref(db, 'Tooth concern');
      const newRequestRef = push(dbRef);
      
      await set(newRequestRef, {
        user: userEmail,
        type: "Bleaching",
        selectedShade: selectedShade,
        imageUris: uploadedUrls, // Dito na papasok ang array ng mga public URL
        timestamp: new Date().toISOString()
      });

      Alert.alert("Success", "Request Submitted Successfully!");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to upload images and submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4A148C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bleaching</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>Logged in as:</Text>
          <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Reference</Text>
          <Image source={require('../../../assets/CD Apply/BT.png')} style={styles.referenceImage} resizeMode="contain" />
          
          <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Select Tooth Shade:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
            <Text style={styles.dropdownText}>{selectedShade || "Tap to select shade"}</Text>
            <Ionicons name="chevron-down" size={20} color="#4A148C" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Attach Images:</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
            <Ionicons name="camera" size={30} color="#4A148C" />
            <Text style={styles.uploadText}>Tap to add photos</Text>
          </TouchableOpacity>
          
          <ScrollView horizontal style={styles.imagePreviewList}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.previewContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Submit Request</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para sa Shade Selection */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Shade</Text>
            <FlatList 
              data={shadeOptions}
              numColumns={4}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.shadeItem} onPress={() => { setSelectedShade(item); setModalVisible(false); }}>
                  <FontAwesome5 name="tooth" size={24} color="#4A148C" />
                  <Text style={styles.shadeLabel}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A148C' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  userContainer: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  userLabel: { fontSize: 12, color: '#4A148C' },
  userEmail: { fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 10 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  referenceImage: { width: '100%', height: 200, borderRadius: 10 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderWidth: 1, borderColor: '#4A148C', borderRadius: 10, alignItems: 'center' },
  dropdownText: { color: '#4A148C', fontWeight: '600' },
  uploadBox: { height: 80, borderStyle: 'dashed', borderWidth: 2, borderColor: '#4A148C', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3E5F5' },
  uploadText: { marginTop: 5, color: '#4A148C', fontWeight: '600' },
  imagePreviewList: { marginTop: 15 },
  previewContainer: { position: 'relative', marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFF', borderRadius: 10 },
  submitButton: { backgroundColor: '#4A148C', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#4A148C' },
  shadeItem: { flex: 1, alignItems: 'center', margin: 10, padding: 10, backgroundColor: '#F3E5F5', borderRadius: 10 },
  shadeLabel: { marginTop: 5, fontWeight: 'bold', color: '#4A148C' },
  closeButton: { marginTop: 20, backgroundColor: '#4A148C', padding: 15, borderRadius: 10, alignItems: 'center' } 
});