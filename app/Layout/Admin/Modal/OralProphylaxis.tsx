import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '../../../../Firebase/FirebaseConfig';

const levelImages: { [key: string]: any } = {
  'Slight': require('../../../../assets/Teeth/Slight.png'),
  'Moderate': require('../../../../assets/Teeth/Moderate.png'),
  'Severe': require('../../../../assets/Teeth/Severe.png'),
};

export default function OralProphylaxis({ item, onClose }: { item: any, onClose: () => void }) {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Function para ilipat ang data sa Approved o Rejected node kasama ang optional reason
  const moveDataToStatus = async (status: 'Approved' | 'Rejected', reason: string = '') => {
    try {
      // 1. Reference sa kasalukuyang record sa "Tooth concern"
      const oldRef = ref(db, `Tooth concern/${item.id}`);
      // 2. Reference sa destinasyon (Approved o Rejected node)
      const newRef = ref(db, `${status}/${item.id}`);

      // Kunin ang data mula sa Firebase
      const snapshot = await get(oldRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Payload na isasave sa database
        const updatedData = {
          ...data,
          status: status,
          processedAt: new Date().toISOString(),
          ...(status === 'Rejected' && { rejectionReason: reason }) // Isasama ang reason kung Rejected
        };

        // I-save sa bagong location
        await set(newRef, updatedData);
        
        // Burahin ang data sa lumang location (Tooth concern)
        await remove(oldRef);
        
        Alert.alert("Success", `Prophylaxis request has been moved to ${status}.`);
        setRejectModalVisible(false);
        onClose();
      } else {
        Alert.alert("Error", "Record not found.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to move data.");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Prophylaxis Details</Text>
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

          <Text style={styles.sectionHeader}>Tartar/Stain Level</Text>
          <View style={styles.landscapeBox}>
            <Image 
              source={levelImages[item?.selectedLevel]} 
              style={styles.landscapeImage} 
            />
            <View style={styles.landscapeInfo}>
              <Text style={styles.label}>Severity Level</Text>
              <Text style={styles.classText}>{item?.selectedLevel || "Not specified"}</Text>
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
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setRejectModalVisible(true)}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => moveDataToStatus('Approved')}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.btnText}> Approve</Text>
          </TouchableOpacity>
        </View>

        {/* REJECTION REASON MODAL */}
        <Modal
          visible={rejectModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.reasonCard}>
              <Text style={styles.reasonTitle}>Reason for Rejection</Text>
              <Text style={styles.reasonSubtitle}>Please provide a reason why this concern is being rejected.</Text>
              
              <TextInput
                style={styles.textInput}
                placeholder="Type reason here..."
                placeholderTextColor="#999"
                multiline={true}
                value={rejectionReason}
                onChangeText={setRejectionReason}
              />

              <View style={styles.reasonActionButtons}>
                <TouchableOpacity 
                  style={[styles.reasonBtn, styles.cancelBtn]} 
                  onPress={() => setRejectModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.reasonBtn, styles.confirmRejectBtn]} 
                  onPress={() => {
                    if (!rejectionReason.trim()) {
                      Alert.alert("Required", "Please enter a rejection reason.");
                      return;
                    }
                    moveDataToStatus('Rejected', rejectionReason);
                  }}
                >
                  <Text style={styles.confirmBtnText}>Submit Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  landscapeBox: { flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E91E63', padding: 10, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
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
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  // Rejection Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  reasonCard: { backgroundColor: '#FFF', width: '100%', padding: 20, borderRadius: 20, elevation: 5 },
  reasonTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  reasonSubtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  textInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 14, backgroundColor: '#FAFAFA', marginBottom: 20 },
  reasonActionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  reasonBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F0F0', marginRight: 10 },
  cancelBtnText: { color: '#333', fontWeight: '600' },
  confirmRejectBtn: { backgroundColor: '#E91E63', marginLeft: 10 },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold' }
});