import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { db } from '../../../../Firebase/FirebaseConfig';

export default function CompleteDenture({ item, onClose }: { item: any, onClose: () => void }) {
  
  const updateStatus = async (status: string) => {
    try {
      const concernRef = ref(db, `Tooth concern/${item.id}`);
      await update(concernRef, { status: status });
      Alert.alert("Success", `Request has been ${status}.`);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Denture Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{item?.patientName}</Text>
          </View>

          <View style={styles.detailsBox}>
            <Text style={styles.label}>Denture Type</Text>
            <Text style={styles.boldValue}>{item?.selectedDentureType || "N/A"}</Text>
            
            <Text style={[styles.label, { marginTop: 15 }]}>Phone Owner</Text>
            <Text style={styles.value}>{item?.phoneOwner || "N/A"}</Text>
            
            <Text style={[styles.label, { marginTop: 15 }]}>Relative Name (if applicable)</Text>
            <Text style={styles.value}>{item?.relativeFbName || "N/A"}</Text>

            <Text style={[styles.label, { marginTop: 15 }]}>Can visit 3-4 times?</Text>
            <Text style={styles.boldValue}>{item?.visiting3to4Times || "N/A"}</Text>
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
            <Text style={styles.btnText}> Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => updateStatus('Approved')}>
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
  detailsBox: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 20 },
  label: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 2 },
  boldValue: { fontSize: 16, fontWeight: '900', color: '#E91E63', marginTop: 2 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#E91E63', marginBottom: 10 },
  imageScroll: { marginBottom: 20 },
  imageWrapper: { marginRight: 15 },
  patientImage: { width: 120, height: 120, borderRadius: 15, borderWidth: 2, borderColor: '#E91E63' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 16, borderRadius: 15, width: '47%', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#E91E63' },
  approveBtn: { backgroundColor: '#4CAF50' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});