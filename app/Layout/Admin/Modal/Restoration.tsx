import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { db } from '../../../../Firebase/FirebaseConfig';

const classImages: { [key: string]: any } = {
  'Class I': require('../../../../assets/Oral/class1.png'),
  'Class II': require('../../../../assets/Oral/class2.png'),
  'Class III': require('../../../../assets/Oral/class3.png'),
  'Class IV': require('../../../../assets/Oral/class4.png'),
  'Class V': require('../../../../assets/Oral/class5.png'),
  'Class VI': require('../../../../assets/Oral/class6.png'),
};

export default function Restoration({ item, onClose }: { item: any, onClose: () => void }) {
  
  const updateStatus = async (status: string) => {
    try {
      const concernRef = ref(db, `Tooth concern/${item.id}`);
      await update(concernRef, { status: status });
      Alert.alert("Success", `Restoration concern has been ${status}.`);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Restoration Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{item?.patientName}</Text>
            
            <Text style={[styles.label, { marginTop: 15 }]}>Date Submitted</Text>
            <Text style={styles.value}>{item?.timestamp ? new Date(item.timestamp).toLocaleDateString('en-PH', { dateStyle: 'long' }) : 'N/A'}</Text>
          </View>

          <Text style={styles.sectionHeader}>Classification Details</Text>
          {/* Landscape Landscape Display */}
          <View style={styles.landscapeBox}>
            <Image source={classImages[item?.selectedClass]} style={styles.landscapeImage} />
            <View style={styles.landscapeInfo}>
              <Text style={styles.label}>Selected Category</Text>
              <Text style={styles.classText}>{item?.selectedClass || "Not specified"}</Text>
            </View>
          </View>

          {item.imageUris && item.imageUris.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Patient's Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {item.imageUris.map((uri: string, index: number) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.patientImage} />
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => updateStatus('Rejected')}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => updateStatus('Approved')}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderRadius: 30, elevation: 10, maxHeight: '85%' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#E91E63' },
  closeBtn: { backgroundColor: '#F0F0F0', padding: 8, borderRadius: 20 },
  infoCard: { backgroundColor: '#F8F4FF', padding: 15, borderRadius: 15, marginBottom: 20 },
  label: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 2 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#E91E63', marginBottom: 10 },
  
  // Landscape Styling
  landscapeBox: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderWidth: 2, 
    borderColor: '#E91E63', 
    padding: 10, 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  landscapeImage: { width: 140, height: 90, borderRadius: 12, resizeMode: 'cover' },
  landscapeInfo: { flex: 1, marginLeft: 15 },
  classText: { fontSize: 18, fontWeight: '900', color: '#E91E63' },
  
  imageScroll: { marginBottom: 20 },
  imageWrapper: { marginRight: 15 },
  patientImage: { width: 120, height: 120, borderRadius: 15, borderWidth: 2, borderColor: '#E91E63' },
  
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  btn: { flexDirection: 'row', padding: 16, borderRadius: 15, width: '47%', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#E91E63' },
  approveBtn: { backgroundColor: '#4CAF50' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});