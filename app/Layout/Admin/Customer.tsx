import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Image, Dimensions } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Modals
import GenConern from './Modal/GenConern';
import Bleaching from './Modal/Bleaching';
import Sealant from './Modal/Sealant';
import PartialDenture from './Modal/PartialDenture';
import Fixed from './Modal/Fixed';
import Fluoride from './Modal/Fluoride';
import Extraction from './Modal/Extraction';
import Restoration from './Modal/Restoration';
import OralProphylaxis from './Modal/OralProphylaxis';
import CompleteDenture from './Modal/CompleteDenture';

const { width } = Dimensions.get('window');

interface ConcernItem {
  id: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  patientName: string;
  imageUris?: string[];
  [key: string]: any;
}

// Component para sa pag-handle ng image loading
const LoadingImage = ({ uri }: { uri: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.largeImgContainer}>
      {loading && <ActivityIndicator style={styles.loader} color="#999" />}
      <Image 
        source={{ uri }} 
        style={styles.largeImg} 
        resizeMode="cover" 
        onLoad={() => setLoading(false)} 
      />
    </View>
  );
};

export default function Customer() {
  const [concerns, setConcerns] = useState<ConcernItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConcernItem | null>(null);

  useEffect(() => {
    const nodes = [
      { path: 'concerns', type: 'General', status: 'Pending' },
      { path: 'Tooth concern', type: 'Tooth', status: 'Pending' },
      { path: 'Approved', type: 'Status', status: 'Approved' },
      { path: 'Rejected', type: 'Status', status: 'Rejected' },
    ];

    const usersRef = ref(db, 'users');
    onValue(usersRef, (uSnap) => {
      const users = uSnap.val() || {};
      nodes.forEach(node => {
        onValue(ref(db, node.path), (snapshot) => {
          const data = snapshot.val() || {};
          const formatted = Object.keys(data).map(k => ({
            ...data[k],
            id: k,
            status: node.status,
            type: data[k].type || node.type,
            patientName: Object.values(users).find((u: any) => u.email === (data[k].email || data[k].user)) 
                         ? `${(Object.values(users).find((u: any) => u.email === (data[k].email || data[k].user)) as any).firstName} ${(Object.values(users).find((u: any) => u.email === (data[k].email || data[k].user)) as any).lastName}` 
                         : 'Unknown'
          }));
          setConcerns(prev => [...prev.filter(p => p.status !== node.status), ...formatted]);
        });
      });
    });
  }, []);

  const StatusDetailModal = ({ item, color, icon, title }: { item: ConcernItem, color: string, icon: string, title: string }) => {
    const exclude = ['id', 'status', 'patientName', 'imageUris', 'type', 'user', 'timestamp', 'processedAt'];
    const details = Object.entries(item).filter(([key, val]) => !exclude.includes(key) && val !== null && typeof val !== 'object');
    const nested = Object.entries(item).filter(([key, val]) => typeof val === 'object' && val !== null && !Array.isArray(val) && key !== 'imageUris');

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderTopColor: color }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon as any} size={40} color={color} />
            </View>
            <Text style={[styles.modalTitle, { color }]}>{title}</Text>
            <Text style={styles.patientName}>{item.patientName}</Text>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Basic Information</Text>
              <Text style={styles.detailRow}>Service: <Text style={styles.boldText}>{item.type}</Text></Text>
              {details.map(([k, v]) => (
                <Text key={k} style={styles.detailRow}>{k.replace(/([A-Z])/g, ' $1')}: <Text style={styles.boldText}>{String(v)}</Text></Text>
              ))}
            </View>

            {nested.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Specific Details</Text>
                {nested.map(([k, v]) => (
                  <View key={k} style={styles.nestedBox}>
                    <Text style={styles.nestedTitle}>{k.replace(/([A-Z])/g, ' $1')}</Text>
                    {Object.entries(v as object).map(([sk, sv]) => (
                      <Text key={sk} style={styles.nestedVal}>• {sk.replace(/([A-Z])/g, ' $1')}: <Text style={{fontWeight:'700'}}>{String(sv)}</Text></Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionHeader}>Supporting Photos</Text>
            {item.imageUris?.map((uri, i) => <LoadingImage key={i} uri={uri} />)}
          </ScrollView>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: color }]} onPress={() => setModalVisible(false)}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderModalContent = (item: ConcernItem) => {
    if (activeTab === 'Approved') return <StatusDetailModal item={item} color="#4CAF50" icon="checkmark-circle" title="Approved Request" />;
    if (activeTab === 'Rejected') return <StatusDetailModal item={item} color="#F44336" icon="close-circle" title="Rejected Request" />;
    
    const props = { item, onClose: () => setModalVisible(false) };
    const maps: any = { 'Tooth Extraction': Extraction, 'Tooth Restoration': Restoration, 'Oral Prophylaxis': OralProphylaxis, 'Complete Denture Application': CompleteDenture, 'Fixed Partial Denture': Fixed, 'Removable Partial Denture': PartialDenture, 'Bleaching': Bleaching, 'Fluoride Application': Fluoride, 'Sealants Application': Sealant };
    const Component = maps[item.type] || GenConern;
    return <Component {...props} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Records</Text>
      <View style={styles.tabContainer}>
        {(['Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && { backgroundColor: tab === 'Pending' ? '#2196F3' : tab === 'Approved' ? '#4CAF50' : '#F44336' }]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && { color: '#FFF' }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {concerns.filter(c => c.status === activeTab).map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
            <View style={[styles.iconBox, { backgroundColor: activeTab === 'Approved' ? '#e8f5e9' : activeTab === 'Rejected' ? '#ffebee' : '#e3f2fd' }]}>
              <Ionicons name={activeTab === 'Approved' ? 'checkmark-circle' : activeTab === 'Rejected' ? 'close-circle' : 'time'} size={24} color={activeTab === 'Pending' ? '#2196F3' : activeTab === 'Approved' ? '#4CAF50' : '#F44336'} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.patientName}</Text>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        {selectedItem && renderModalContent(selectedItem)}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { fontSize: 26, fontWeight: '800', margin: 20, marginTop: 50 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontWeight: '600', color: '#666' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', flexDirection: 'row', padding: 18, borderRadius: 20, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { marginLeft: 15 },
  name: { fontSize: 16, fontWeight: '700' },
  typeText: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 15 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, maxHeight: '90%', borderTopWidth: 8 },
  iconBadge: { alignSelf: 'center', padding: 15, borderRadius: 20, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 5 },
  patientName: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#333', marginBottom: 20 },
  sectionContainer: { backgroundColor: '#F8F9FB', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  sectionHeader: { fontSize: 14, fontWeight: '800', color: '#444', marginBottom: 10, textTransform: 'uppercase' },
  detailRow: { fontSize: 14, color: '#666', marginBottom: 5 },
  boldText: { color: '#000', fontWeight: '700' },
  nestedBox: { backgroundColor: '#FFF', padding: 10, borderRadius: 10, marginBottom: 5, borderWidth: 0.5, borderColor: '#DDD' },
  nestedTitle: { fontSize: 12, fontWeight: 'bold', color: '#777', marginBottom: 4 },
  nestedVal: { fontSize: 13, color: '#333', marginBottom: 2 },
  largeImgContainer: { width: '100%', height: 220, marginBottom: 15, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#EEE', backgroundColor: '#f0f0f0', justifyContent: 'center' },
  largeImg: { width: '100%', height: '100%' },
  loader: { position: 'absolute', alignSelf: 'center' },
  closeBtn: { padding: 16, borderRadius: 20, alignItems: 'center', marginTop: 10 }
});