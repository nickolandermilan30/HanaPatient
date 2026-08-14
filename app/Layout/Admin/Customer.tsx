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
  userId?: string;
  imageUris?: string[];
  rejectionReason?: string;
  [key: string]: any;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  address?: string;
  age?: string;
  contact?: string;
  dob?: string;
  occupation?: string;
  sex?: string;
  medicalHistory?: {
    allergies?: { [key: string]: boolean };
    health?: boolean;
    hospitalized?: boolean;
    hospitalizedDetail?: string;
    medicalTreatment?: boolean;
    medicalTreatmentDetail?: string;
    medication?: boolean;
    medicationDetail?: string;
    othersDetail?: string;
    seriousIllness?: boolean;
    seriousIllnessDetail?: string;
    smoking?: boolean;
    [key: string]: any;
  };
  medicalHistoryPart2?: {
    conditions?: { [key: string]: boolean };
    [key: string]: any;
  };
  womenInfo?: any;
  [key: string]: any;
}

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
  const [usersMap, setUsersMap] = useState<{ [key: string]: UserProfile }>({});
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConcernItem | null>(null);

  // Loading indicator state para sa tab switching / reloading
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Patient Details Modal States
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  useEffect(() => {
    const nodes = [
      { path: 'concerns', type: 'General Concern', status: 'Pending' },
      { path: 'Tooth concern', type: 'Tooth Concern', status: 'Pending' },
      { path: 'Approved', type: 'Status', status: 'Approved' },
      { path: 'Rejected', type: 'Status', status: 'Rejected' },
    ];

    const usersRef = ref(db, 'users');
    onValue(usersRef, (uSnap) => {
      const users = uSnap.val() || {};
      setUsersMap(users);

      nodes.forEach(node => {
        onValue(ref(db, node.path), (snapshot) => {
          const data = snapshot.val() || {};
          const formatted = Object.keys(data).map(k => {
            const item = data[k];
            const itemEmail = item.email || item.user;
            const matchedUserEntry = Object.entries(users).find(([uid, u]: [string, any]) => u.email === itemEmail);
            const patientName = matchedUserEntry 
               ? `${(matchedUserEntry[1] as any).firstName || ''} ${(matchedUserEntry[1] as any).lastName || ''}`.trim()
               : 'Unknown';
            const userId = matchedUserEntry ? matchedUserEntry[0] : undefined;

            const imageUris = item.imageUris || item.images || [];

            return {
              ...item,
              id: k,
              status: node.status,
              type: item.type || node.type,
              patientName,
              userId,
              imageUris
            };
          });

          setConcerns(prev => [
            ...prev.filter(p => {
              if (node.status === 'Pending') {
                if (node.path === 'concerns') return p.type !== 'General Concern' && p.status === 'Pending';
                if (node.path === 'Tooth concern') return p.type !== 'Tooth Concern' && p.status === 'Pending';
              }
              return p.status !== node.status;
            }), 
            ...formatted
          ]);
        });
      });
    });
  }, []);

  // Function para i-handle ang paglipat ng tab na may kasamang loading effect
  const handleTabChange = (tab: 'Pending' | 'Approved' | 'Rejected') => {
    setIsLoadingTab(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 300); // 300ms smooth transition loading simulation
  };

  const openPatientDetails = (item: ConcernItem) => {
    if (item.userId && usersMap[item.userId]) {
      setSelectedPatient(usersMap[item.userId]);
      setSelectedPatientName(item.patientName);
      setPatientModalVisible(true);
    } else {
      const matched = Object.values(usersMap).find((u: any) => u.email === (item.email || item.user));
      if (matched) {
        setSelectedPatient(matched);
        setSelectedPatientName(`${matched.firstName || ''} ${matched.lastName || ''}`.trim());
        setPatientModalVisible(true);
      }
    }
  };

  const StatusDetailModal = ({ item, color, icon, title }: { item: ConcernItem, color: string, icon: string, title: string }) => {
    const exclude = ['id', 'status', 'patientName', 'userId', 'imageUris', 'images', 'type', 'user', 'timestamp', 'processedAt', 'rejectionReason'];
    const details = Object.entries(item).filter(([key, val]) => !exclude.includes(key) && val !== null && typeof val !== 'object');
    const nested = Object.entries(item).filter(([key, val]) => typeof val === 'object' && val !== null && !Array.isArray(val) && key !== 'imageUris' && key !== 'images');

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderTopColor: color }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon as any} size={40} color={color} />
            </View>
            <Text style={[styles.modalTitle, { color }]}>{title}</Text>
            <Text style={styles.patientName}>{item.patientName}</Text>

            {/* Kung Rejected, ipakita ang Rejection Reason nang prominente */}
            {item.status === 'Rejected' && item.rejectionReason && (
              <View style={[styles.sectionContainer, { backgroundColor: '#ffebee', borderColor: '#ffcdd2' }]}>
                <Text style={[styles.sectionHeader, { color: '#c62828' }]}>Rejection Reason</Text>
                <Text style={[styles.detailRow, { color: '#b71c1c', fontWeight: '600' }]}>{item.rejectionReason}</Text>
              </View>
            )}

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

            {item.imageUris && item.imageUris.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Supporting Photos</Text>
                {item.imageUris.map((uri, i) => <LoadingImage key={i} uri={uri} />)}
              </>
            )}
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
    const maps: any = { 
      'Tooth Extraction': Extraction, 
      'Tooth Restoration': Restoration, 
      'Oral Prophylaxis': OralProphylaxis, 
      'Complete Denture Application': CompleteDenture, 
      'Fixed Partial Denture': Fixed, 
      'Removable Partial Denture': PartialDenture, 
      'Bleaching': Bleaching, 
      'Fluoride Application': Fluoride, 
      'Sealants Application': Sealant,
      'General Concern': GenConern,
      'Tooth Concern': GenConern
    };
    const Component = maps[item.type] || GenConern;
    return <Component {...props} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Records</Text>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && { backgroundColor: tab === 'Pending' ? '#2196F3' : tab === 'Approved' ? '#4CAF50' : '#F44336' }]} 
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: '#FFF' }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content Area with Loader */}
      {isLoadingTab ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {concerns.filter(c => c.status === activeTab).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} records found.</Text>
            </View>
          ) : (
            concerns.filter(c => c.status === activeTab).map((item, index) => (
              <View key={index} style={styles.cardContainer}>
                <TouchableOpacity style={styles.cardMain} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
                  <View style={[styles.iconBox, { backgroundColor: activeTab === 'Approved' ? '#e8f5e9' : activeTab === 'Rejected' ? '#ffebee' : '#e3f2fd' }]}>
                    <Ionicons name={activeTab === 'Approved' ? 'checkmark-circle' : activeTab === 'Rejected' ? 'close-circle' : 'time'} size={24} color={activeTab === 'Pending' ? '#2196F3' : activeTab === 'Approved' ? '#4CAF50' : '#F44336'} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.patientName}</Text>
                    <Text style={styles.typeText}>{item.type}</Text>
                    {activeTab === 'Rejected' && item.rejectionReason && (
                      <Text style={styles.reasonText} numberOfLines={1}>Reason: {item.rejectionReason}</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {activeTab === 'Pending' && (
                  <TouchableOpacity style={styles.patientDetailsBtn} onPress={() => openPatientDetails(item)}>
                    <Ionicons name="person-circle-outline" size={20} color="#2196F3" />
                    <Text style={styles.patientDetailsBtnText}>Patient Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        {selectedItem && renderModalContent(selectedItem)}
      </Modal>

      {/* Comprehensive Patient Details Modal */}
      <Modal visible={patientModalVisible} animationType="slide" transparent={true} onRequestClose={() => setPatientModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderTopColor: '#2196F3' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.iconBadge, { backgroundColor: '#2196F320' }]}>
                <Ionicons name="medical" size={40} color="#2196F3" />
              </View>
              <Text style={[styles.modalTitle, { color: '#2196F3' }]}>Patient Medical Profile</Text>
              <Text style={styles.patientName}>{selectedPatientName}</Text>

              {selectedPatient && (
                <>
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Personal Information</Text>
                    <Text style={styles.detailRow}>Email: <Text style={styles.boldText}>{selectedPatient.email || 'N/A'}</Text></Text>
                    <Text style={styles.detailRow}>Contact: <Text style={styles.boldText}>{selectedPatient.contact || 'N/A'}</Text></Text>
                    <Text style={styles.detailRow}>Address: <Text style={styles.boldText}>{selectedPatient.address || 'N/A'}</Text></Text>
                    <Text style={styles.detailRow}>Age: <Text style={styles.boldText}>{selectedPatient.age || 'N/A'}</Text></Text>
                    <Text style={styles.detailRow}>Sex: <Text style={styles.boldText}>{selectedPatient.sex || 'N/A'}</Text></Text>
                    <Text style={styles.detailRow}>Occupation: <Text style={styles.boldText}>{selectedPatient.occupation || 'N/A'}</Text></Text>
                  </View>

                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Medical History & Allergies</Text>
                    {selectedPatient.medicalHistory ? (
                      <>
                        <Text style={styles.detailRow}>Good Health: <Text style={styles.boldText}>{selectedPatient.medicalHistory.health ? 'Yes' : 'No'}</Text></Text>
                        <Text style={styles.detailRow}>Hospitalized: <Text style={styles.boldText}>{selectedPatient.medicalHistory.hospitalized ? `Yes (${selectedPatient.medicalHistory.hospitalizedDetail || 'No details'})` : 'No'}</Text></Text>
                        <Text style={styles.detailRow}>Under Medical Treatment: <Text style={styles.boldText}>{selectedPatient.medicalHistory.medicalTreatment ? `Yes (${selectedPatient.medicalHistory.medicalTreatmentDetail || 'No details'})` : 'No'}</Text></Text>
                        <Text style={styles.detailRow}>Taking Medication: <Text style={styles.boldText}>{selectedPatient.medicalHistory.medication ? `Yes (${selectedPatient.medicalHistory.medicationDetail || 'No details'})` : 'No'}</Text></Text>
                        <Text style={styles.detailRow}>Serious Illness: <Text style={styles.boldText}>{selectedPatient.medicalHistory.seriousIllness ? `Yes (${selectedPatient.medicalHistory.seriousIllnessDetail || 'No details'})` : 'No'}</Text></Text>
                        <Text style={styles.detailRow}>Smoking: <Text style={styles.boldText}>{selectedPatient.medicalHistory.smoking ? 'Yes' : 'No'}</Text></Text>
                        
                        <Text style={[styles.nestedTitle, { marginTop: 10 }]}>Allergies & Reactions:</Text>
                        {selectedPatient.medicalHistory.allergies ? (
                          Object.entries(selectedPatient.medicalHistory.allergies).map(([k, v]) => (
                            <Text key={k} style={styles.nestedVal}>• {k.replace(/([A-Z])/g, ' $1')}: <Text style={{fontWeight:'700'}}>{v ? 'Yes' : 'No'}</Text></Text>
                          ))
                        ) : (
                          <Text style={styles.nestedVal}>No allergy records found.</Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.detailRow}>No medical history recorded.</Text>
                    )}
                  </View>

                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Medical Conditions</Text>
                    {selectedPatient.medicalHistoryPart2?.conditions ? (
                      Object.entries(selectedPatient.medicalHistoryPart2.conditions).map(([k, v]) => (
                        <Text key={k} style={styles.detailRow}>
                          {k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}: <Text style={styles.boldText}>{v ? 'Yes' : 'No'}</Text>
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.detailRow}>No specific conditions recorded.</Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: '#2196F3' }]} onPress={() => setPatientModalVisible(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', marginTop: 10, fontWeight: '600' },
  cardContainer: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden' },
  cardMain: { flexDirection: 'row', padding: 18, alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  typeText: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginTop: 2 },
  reasonText: { fontSize: 12, color: '#D32F2F', marginTop: 4, fontWeight: '500' },
  patientDetailsBtn: { flexDirection: 'row', backgroundColor: '#F0F7FF', paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#E1EEF8' },
  patientDetailsBtnText: { color: '#2196F3', fontWeight: '700', fontSize: 13, marginLeft: 6 },
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