import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { ref, onValue, get } from 'firebase/database'; // Nagdagdag ng 'get' para sa manual refresh
import { db } from '../../../Firebase/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function Customer() {
  const [concerns, setConcerns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function para i-fetch ang data
  const fetchData = useCallback(async () => {
    const usersRef = ref(db, 'users');
    const concernsRef = ref(db, 'concerns');
    const toothRef = ref(db, 'Tooth concern');

    // Paggamit ng 'get' para sa manual refresh (one-time fetch)
    const [userSnap, cSnap, tSnap] = await Promise.all([
      get(usersRef),
      get(concernsRef),
      get(toothRef)
    ]);

    const users = userSnap.val() || {};
    const cData = cSnap.val() || {};
    const tData = tSnap.val() || {};

    const allConcerns = [
      ...Object.keys(cData).map(k => ({ ...cData[k], type: 'General' })),
      ...Object.keys(tData).map(k => ({ ...tData[k], type: tData[k].type || 'Tooth' }))
    ];

    const processed = allConcerns.map(item => {
      const userEmail = item.email || item.user;
      const userData = Object.values(users).find((u: any) => u.email === userEmail);
      return {
        ...item,
        patientName: userData ? `${(userData as any).firstName} ${(userData as any).lastName}` : 'Unknown'
      };
    });

    setConcerns(processed);
    setLoading(false);
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <ActivityIndicator size="large" color="#4A148C" style={{ flex: 1 }} />;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A148C" />
      }
    >
      <Text style={styles.header}>Patient Concerns</Text>
      {concerns.length === 0 ? (
        <Text style={styles.emptyText}>No concerns found.</Text>
      ) : (
        concerns.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name="medkit" size={24} color="#FFF" />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.patientName}</Text>
              <Text style={styles.type}>{item.type} Concern</Text>
              <Text style={styles.date}>{new Date(item.date || item.timestamp).toLocaleDateString()}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FF' },
  scrollContent: { padding: 20, paddingBottom: 100 }, 
  header: { fontSize: 22, fontWeight: 'bold', color: '#4A148C', marginBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  card: { backgroundColor: '#FFF', flexDirection: 'row', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center', elevation: 3 },
  iconBox: { backgroundColor: '#cc2828', padding: 12, borderRadius: 12 },
  info: { marginLeft: 15, flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  type: { fontSize: 13, color: '#4A148C', fontWeight: '600' },
  date: { fontSize: 11, color: '#888', marginTop: 2 }
});