import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../Firebase/FirebaseConfig';

export default function Home({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [totalConcerns, setTotalConcerns] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const concernsRef = ref(db, 'concerns');
    const toothConcernRef = ref(db, 'Tooth concern');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((user) => user.role === 'user');
        setUsers(userList);
      }
    });

    onValue(concernsRef, (snapshot) => {
      const data = snapshot.val();
      const count1 = data ? Object.keys(data).length : 0;
      onValue(toothConcernRef, (snapshot2) => {
        const data2 = snapshot2.val();
        const count2 = data2 ? Object.keys(data2).length : 0;
        setTotalConcerns(count1 + count2);
        setLoading(false);
      });
    });
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#4A148C" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Dashboard Overview</Text>
      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: '#E1BEE7' }]}>
          <Ionicons name="people" size={30} color="#4A148C" />
          <Text style={styles.cardCount}>{users.length}</Text>
          <Text style={styles.cardLabel}>Concern Patient</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FFF9C4' }]}>
          <Ionicons name="alert-circle" size={30} color="#FBC02D" />
          <Text style={styles.cardCount}>{totalConcerns}</Text>
          <Text style={styles.cardLabel}>Pending Concerns</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Patient List</Text>
      {users.map((user) => (
        <TouchableOpacity 
          key={user.id} 
          style={styles.appointmentCard} 
          onPress={() => setActiveTab('Customer')} // Dito ang logic ng paglipat
        >
          <View style={styles.timeBadge}>
            <Ionicons name="person" size={24} color="#4A148C" />
          </View>
          <View style={styles.appointmentInfo}>
            <Text style={styles.patientName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.service}>{user.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4A148C" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F4FF' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A148C', marginBottom: 15, marginTop: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  card: { width: '47%', padding: 20, borderRadius: 20, alignItems: 'center' },
  cardCount: { fontSize: 24, fontWeight: 'bold', color: '#4A148C', marginVertical: 5 },
  cardLabel: { fontSize: 12, color: '#4A148C', fontWeight: '600' },
  appointmentCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center', elevation: 2 },
  timeBadge: { backgroundColor: '#F3E5F5', padding: 10, borderRadius: 10, alignItems: 'center', width: 60 },
  appointmentInfo: { flex: 1, marginLeft: 15 },
  patientName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  service: { fontSize: 13, color: '#666' }
});