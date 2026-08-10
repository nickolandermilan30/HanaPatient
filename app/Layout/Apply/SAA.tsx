import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { auth, db } from '../../../Firebase/FirebaseConfig';
import { ref, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function SAA() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  const [selectedTeeth, setSelectedTeeth] = useState<{ [key: string]: string[] }>({
    upperRight: [],
    upperLeft: [],
    lowerRight: [],
    lowerLeft: [],
  });

  const [modalVisible, setModalVisible] = useState<{ key: string | null }>({ key: null });

  const toothOptions: { [key: string]: string[] } = {
    upperRight: ["Central Incisor", "Lateral Incisor", "Canine", "1st Premolar", "2nd Premolar", "1st Molar", "2nd Molar", "3rd Molar"],
    upperLeft: ["Central Incisor", "Lateral Incisor", "Canine", "1st Premolar", "2nd Premolar", "1st Molar", "2nd Molar", "3rd Molar"],
    lowerRight: ["3rd Molar", "2nd Molar", "1st Molar", "2nd Premolar", "1st Premolar", "Canine", "Lateral Incisor", "Central Incisor"],
    lowerLeft: ["3rd Molar", "2nd Molar", "1st Molar", "2nd Premolar", "1st Premolar", "Canine", "Lateral Incisor", "Central Incisor"]
  };

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

  const handleToggleTooth = (key: string, item: string) => {
    setSelectedTeeth(prev => {
      const currentList = prev[key] || [];
      if (currentList.includes(item)) {
        return { ...prev, [key]: currentList.filter(tooth => tooth !== item) };
      } else {
        return { ...prev, [key]: [...currentList, item] };
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0) {
      Alert.alert("Error", "Please attach at least one image.");
      return;
    }

    const totalSelected = Object.values(selectedTeeth).reduce((sum, list) => sum + list.length, 0);
    if (totalSelected === 0) {
      Alert.alert("Error", "Please select at least one tooth across any quadrant.");
      return;
    }

    setLoading(true);
    try {
      const storage = getStorage();
      const uploadedUrls = await Promise.all(
        selectedImages.map(async (uri) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const filename = `sealants_application/${Date.now()}_${Math.random()}.jpg`;
          const imageRef = storageRef(storage, filename);
          await uploadBytes(imageRef, blob);
          return await getDownloadURL(imageRef);
        })
      );

      const dbRef = ref(db, 'Tooth concern');
      const newRequestRef = push(dbRef);
      
      await set(newRequestRef, {
        user: userEmail,
        type: "Sealants Application",
        selectedTeeth: selectedTeeth,
        imageUris: uploadedUrls,
        timestamp: new Date().toISOString()
      });

      setLoading(false);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("Error", "Failed to upload images and submit request.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4A148C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sealants Application</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>Logged in as:</Text>
          <Text style={styles.userEmail}>{userEmail || 'No user logged in'}</Text>
        </View>

        <Text style={styles.questionText}>Which teeth need sealant application?</Text>

        <View style={styles.buttonRow}>
          {renderButton('upperRight', 'Upper Right', selectedTeeth, setModalVisible)}
          {renderButton('upperLeft', 'Upper Left', selectedTeeth, setModalVisible)}
        </View>

        <View style={styles.imageContainer}>
          <Image source={require('../../../assets/Important/Anatomy.png')} style={styles.anatomyImage} resizeMode="contain" />
        </View>

        <View style={styles.buttonRow}>
          {renderButton('lowerRight', 'Lower Right', selectedTeeth, setModalVisible)}
          {renderButton('lowerLeft', 'Lower Left', selectedTeeth, setModalVisible)}
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

      {/* MULTI-SELECT TOOTH MODAL */}
      <Modal visible={!!modalVisible.key} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Teeth ({modalVisible.key ? labelMapping[modalVisible.key] : ''})</Text>
            <Text style={styles.modalSubInstructions}>Tap to check/uncheck multiple teeth</Text>
            <FlatList 
              data={modalVisible.key ? toothOptions[modalVisible.key] : []}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const key = modalVisible.key!;
                const isSelected = selectedTeeth[key]?.includes(item);
                return (
                  <TouchableOpacity 
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]} 
                    onPress={() => handleToggleTooth(key, item)}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>{item}</Text>
                    <Ionicons 
                      name={isSelected ? "checkbox" : "square-outline"} 
                      size={22} 
                      color={isSelected ? "#4A148C" : "#999"} 
                    />
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible({ key: null })}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={successModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.successTitle}>Request Submitted!</Text>
            <Text style={styles.successSub}>Your Sealants application request has been sent successfully.</Text>
            <TouchableOpacity 
              style={[styles.closeButton, { width: '100%', marginTop: 20 }]} 
              onPress={() => { setSuccessModalVisible(false); router.back(); }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const labelMapping: { [key: string]: string } = {
  upperRight: 'Upper Right',
  upperLeft: 'Upper Left',
  lowerRight: 'Lower Right',
  lowerLeft: 'Lower Left'
};

function renderButton(key: string, label: string, selectedTeeth: any, setModalVisible: any) {
  const chosenList = selectedTeeth[key] || [];
  const displayText = chosenList.length > 0 ? `${label} (${chosenList.length})` : label;

  return (
    <TouchableOpacity style={[styles.button, chosenList.length > 0 && styles.buttonActive]} onPress={() => setModalVisible({ key })}>
      <Text style={[styles.buttonText, chosenList.length > 0 && styles.buttonTextActive]} numberOfLines={1}>{displayText}</Text>
      <Ionicons name="chevron-down" size={16} color={chosenList.length > 0 ? "#FFF" : "#4A148C"} />
    </TouchableOpacity>
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
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', textAlign: 'center', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  button: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '48%', borderWidth: 1, borderColor: '#E1BEE7' },
  buttonActive: { backgroundColor: '#4A148C', borderColor: '#4A148C' },
  buttonText: { color: '#4A148C', fontWeight: 'bold', fontSize: 12, flex: 1, marginRight: 5 },
  buttonTextActive: { color: '#FFF' },
  imageContainer: { width: '100%', height: 200, marginVertical: 10 },
  anatomyImage: { width: '100%', height: '100%' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 20, elevation: 3 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  uploadBox: { height: 90, borderStyle: 'dashed', borderWidth: 2, borderColor: '#4A148C', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3E5F5', marginBottom: 10 },
  uploadText: { marginTop: 5, color: '#4A148C', fontWeight: '600' },
  imagePreviewList: { flexDirection: 'row', marginTop: 10 },
  previewContainer: { position: 'relative', marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -2, right: -5, backgroundColor: '#FFF', borderRadius: 10 },
  submitButton: { backgroundColor: '#4A148C', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center', color: '#4A148C' },
  modalSubInstructions: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 15 },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 8, marginVertical: 2 },
  modalItemSelected: { backgroundColor: '#F3E5F5' },
  modalItemText: { color: '#333', fontSize: 15 },
  modalItemTextSelected: { color: '#4A148C', fontWeight: 'bold' },
  closeButton: { marginTop: 15, backgroundColor: '#4A148C', padding: 15, borderRadius: 12, alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A148C', marginTop: 10 },
  successSub: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 }
});