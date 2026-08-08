import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { db, storage } from '../../../Firebase/FirebaseConfig';
import { ref as dbRef, remove, get } from 'firebase/database';
import { ref as storageRef, listAll, deleteObject } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';

interface TargetItem {
  id: string;
  name: string;
  type: 'db' | 'storage';
  path: string;
}

const TARGET_ITEMS: TargetItem[] = [
  // Database Nodes
  { id: 'db_approved', name: 'Database: Approved Records', type: 'db', path: 'Approved' },
  { id: 'db_rejected', name: 'Database: Rejected Records', type: 'db', path: 'Rejected' },
  { id: 'db_tooth', name: 'Database: Tooth Concern', type: 'db', path: 'Tooth concern' },
  { id: 'db_concerns', name: 'Database: General Concerns', type: 'db', path: 'concerns' },
  // Storage Folders
  { id: 'st_bleaching', name: 'Storage: Bleaching Files', type: 'storage', path: 'bleaching' },
  { id: 'st_concerns', name: 'Storage: Concerns Files', type: 'storage', path: 'concerns' },
  { id: 'st_dentures', name: 'Storage: Dentures Files', type: 'storage', path: 'dentures' },
  { id: 'st_extractions', name: 'Storage: Extractions Files', type: 'storage', path: 'extractions' },
  { id: 'st_fixed', name: 'Storage: Fixed Partial Denture Files', type: 'storage', path: 'fixed_partial_denture' },
  { id: 'st_fluoride', name: 'Storage: Fluoride Files', type: 'storage', path: 'fluoride' },
  { id: 'st_prophylaxis', name: 'Storage: Prophylaxis Files', type: 'storage', path: 'prophylaxis' },
  { id: 'st_removable', name: 'Storage: Removable Partial Denture Files', type: 'storage', path: 'removable_partial_denture' },
  { id: 'st_restorations', name: 'Storage: Restorations Files', type: 'storage', path: 'restorations' },
  { id: 'st_sealants', name: 'Storage: Sealants Application Files', type: 'storage', path: 'sealants_application' },
];

export default function Clear() {
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemCounts, setItemCounts] = useState<{ [key: string]: number | string }>({});
  const [progressText, setProgressText] = useState('Initializing deletion...');
  const [progressCount, setProgressCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch count/item sizes whenever selector modal opens
  useEffect(() => {
    if (selectorModalVisible) {
      fetchItemCounts();
    }
  }, [selectorModalVisible]);

  const fetchItemCounts = async () => {
    setCountsLoading(true);
    const newCounts: { [key: string]: number | string } = {};

    for (const item of TARGET_ITEMS) {
      try {
        if (item.type === 'db') {
          const snapshot = await get(dbRef(db, item.path));
          if (snapshot.exists()) {
            const val = snapshot.val();
            const count = typeof val === 'object' && val !== null ? Object.keys(val).length : 1;
            newCounts[item.id] = `${count} entry/entries`;
          } else {
            newCounts[item.id] = '0 entries';
          }
        } else if (item.type === 'storage') {
          const folderRef = storageRef(storage, item.path);
          const res = await listAll(folderRef);
          const fileCount = res.items.length;
          newCounts[item.id] = `${fileCount} file(s)`;
        }
      } catch (err) {
        newCounts[item.id] = 'Unavailable';
      }
    }

    setItemCounts(newCounts);
    setCountsLoading(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === TARGET_ITEMS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(TARGET_ITEMS.map(item => item.id));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const proceedToConfirmation = () => {
    if (selectedIds.length === 0) {
      Alert.alert('Notice', 'Please select at least one item to delete.');
      return;
    }
    setSelectorModalVisible(false);
    setConfirmModalVisible(true);
  };

  const executeDeletion = async () => {
    setConfirmModalVisible(false);
    setLoadingModalVisible(true);
    setProgressCount(0);
    setTotalItems(selectedIds.length);

    try {
      let currentDone = 0;

      for (const id of selectedIds) {
        const target = TARGET_ITEMS.find(t => t.id === id);
        if (!target) continue;

        setProgressText(`Deleting ${target.name}...`);

        if (target.type === 'db') {
          const nodeRef = dbRef(db, target.path);
          await remove(nodeRef);
        } else if (target.type === 'storage') {
          try {
            const folderRef = storageRef(storage, target.path);
            const res = await listAll(folderRef);
            const filePromises = res.items.map((itemRef) => deleteObject(itemRef));
            await Promise.all(filePromises);
          } catch (err) {
            console.log(`Error clearing storage folder ${target.path}:`, err);
          }
        }

        currentDone++;
        setProgressCount(currentDone);
      }

      setLoadingModalVisible(false);
      setSelectedIds([]);
      Alert.alert('Success', 'Selected data and storage files have been permanently cleared.');
    } catch (error: any) {
      setLoadingModalVisible(false);
      Alert.alert('Error', error.message || 'An error occurred while clearing data.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="trash-bin" size={50} color="#D32F2F" />
        </View>
        <Text style={styles.title}>Data Management & Cleanup</Text>
        <Text style={styles.description}>
          Selectively or fully clear operational database nodes and associated storage files. User accounts will remain secure.
        </Text>

        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => setSelectorModalVisible(true)}
        >
          <Ionicons name="checkbox-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.clearButtonText}>Select Data to Clear</Text>
        </TouchableOpacity>
      </View>

      {/* 1. Selector Modal with Checkboxes and Content Count */}
      <Modal animationType="slide" transparent={true} visible={selectorModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.largeModalView}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Choose Target Data</Text>
              <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn}>
                <Text style={styles.selectAllText}>
                  {selectedIds.length === TARGET_ITEMS.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Check the items you want to permanently wipe out:</Text>

            {countsLoading ? (
              <View style={styles.countsLoaderContainer}>
                <ActivityIndicator size="small" color="#4A148C" />
                <Text style={styles.countsLoaderText}>Checking data sizes...</Text>
              </View>
            ) : (
              <ScrollView style={styles.checklistContainer} showsVerticalScrollIndicator={false}>
                {TARGET_ITEMS.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  const countLabel = itemCounts[item.id] !== undefined ? itemCounts[item.id] : 'Checking...';
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.checkItemRow, isSelected && styles.checkItemRowSelected]} 
                      onPress={() => toggleItem(item.id)}
                    >
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={22} 
                        color={isSelected ? "#D32F2F" : "#888"} 
                      />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.checkItemText, isSelected && styles.checkItemTextSelected]}>
                          {item.name}
                        </Text>
                        <Text style={styles.checkItemSubText}>
                          Content size: <Text style={{fontWeight: '700', color: '#555'}}>{countLabel}</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setSelectorModalVisible(false)}>
                <Text style={{color: '#4A148C', fontWeight: 'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={proceedToConfirmation} disabled={countsLoading}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Proceed ({selectedIds.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Final Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={confirmModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.warningIconBadge}>
              <Ionicons name="warning" size={40} color="#D32F2F" />
            </View>
            <Text style={styles.modalTitle}>Irreversible Action</Text>
            <Text style={styles.modalText}>
              You have selected <Text style={{fontWeight: '700', color: '#D32F2F'}}>{selectedIds.length} item(s)</Text> to delete. Once deleted, this information cannot be recovered. Are you absolutely sure?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setConfirmModalVisible(false)}>
                <Text style={{color: '#4A148C', fontWeight: 'bold'}}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={executeDeletion}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Yes, Delete Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Loading Counter Animation Modal */}
      <Modal animationType="fade" transparent={true} visible={loadingModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModalView}>
            <ActivityIndicator size="large" color="#D32F2F" style={{ marginBottom: 15 }} />
            <Text style={styles.loadingTitle}>Cleaning Up App Data...</Text>
            <Text style={styles.loadingCounterText}>
              Processing {progressCount} of {totalItems} tasks
            </Text>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: totalItems > 0 ? `${(progressCount / totalItems) * 100}%` : '0%' }
                ]} 
              />
            </View>
            <Text style={styles.loadingSubText}>{progressText}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', width: '100%', maxWidth: 400, padding: 25, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  iconContainer: { backgroundColor: '#FFEBEE', padding: 20, borderRadius: 50, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 10, textAlign: 'center' },
  description: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  clearButton: { flexDirection: 'row', backgroundColor: '#D32F2F', width: '100%', paddingVertical: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  clearButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  modalView: { width: '100%', maxWidth: 340, padding: 25, backgroundColor: 'white', borderRadius: 20, alignItems: 'center' },
  largeModalView: { width: '100%', maxWidth: 400, maxHeight: '85%', padding: 20, backgroundColor: 'white', borderRadius: 24 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 5 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#333' },
  modalSubtitle: { fontSize: 12, color: '#777', marginBottom: 15 },
  selectAllBtn: { backgroundColor: '#F0E6FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  selectAllText: { color: '#4A148C', fontSize: 12, fontWeight: '700' },
  countsLoaderContainer: { paddingVertical: 40, alignItems: 'center' },
  countsLoaderText: { marginTop: 10, fontSize: 13, color: '#666' },
  checklistContainer: { width: '100%', maxHeight: 320, marginBottom: 15 },
  checkItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EEE' },
  checkItemRowSelected: { backgroundColor: '#FFF5F5', borderColor: '#FFCDD2' },
  checkItemText: { fontSize: 13, color: '#444', fontWeight: '600' },
  checkItemTextSelected: { color: '#D32F2F', fontWeight: '700' },
  checkItemSubText: { fontSize: 11, color: '#888', marginTop: 2 },
  warningIconBadge: { backgroundColor: '#FFEBEE', padding: 15, borderRadius: 40, marginBottom: 12 },
  modalText: { marginBottom: 20, textAlign: 'center', color: '#666', fontSize: 14, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'space-between', marginTop: 5 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#EEE', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#D32F2F', alignItems: 'center' },
  loadingModalView: { width: '100%', maxWidth: 320, padding: 30, backgroundColor: 'white', borderRadius: 20, alignItems: 'center' },
  loadingTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 5 },
  loadingCounterText: { fontSize: 14, fontWeight: '700', color: '#D32F2F', marginBottom: 15 },
  progressBarBackground: { width: '100%', height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#D32F2F', borderRadius: 4 },
  loadingSubText: { fontSize: 11, color: '#888', textAlign: 'center' }
});