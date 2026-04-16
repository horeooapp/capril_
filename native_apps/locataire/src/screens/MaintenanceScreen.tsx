import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Image, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '../config/api';
import { Colors } from '../theme/colors';
import { ChevronLeft, Camera, Image as ImageIcon, AlertCircle, Clock, CheckCircle2, History, Plus } from 'lucide-react-native';

export default function MaintenanceScreen({ route, navigation }: any) {
  const token = route.params?.token;
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('HISTORY');
  
  // States for New Ticket
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMALE');
  const [category, setCategory] = useState('MAI_AU');
  const [photo, setPhoto] = useState<string | null>(null);
  
  // States for History
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LIST_TICKETS', token })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Accès refusé", "Vous devez autoriser l'accès à l'appareil photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) return Alert.alert("Champs manquants", "Veuillez remplir le titre et la description.");

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.TICKETS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TICKET',
          token,
          title,
          description,
          priority,
          category,
          photoBase64: photo
        })
      });
      const data = await res.json();

      if (data.success) {
        Alert.alert("Signalé !", "Votre incident a été enregistré. Nous suivons sa résolution.");
        setTitle('');
        setDescription('');
        setPhoto(null);
        setActiveTab('HISTORY');
        fetchTickets();
      } else {
        Alert.alert("Erreur", data.error || "Impossible d'envoyer le ticket.");
      }
    } catch (e) {
      Alert.alert("Erreur réseau", "Serveur injoignable.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return { bg: '#FEF3C7', text: '#D97706', label: 'En attente' };
      case 'PRIS_EN_CHARGE': return { bg: '#DBEAFE', text: '#2563EB', label: 'En cours' };
      case 'RESOLU': return { bg: '#D1FAE5', text: '#059669', label: 'Résolu' };
      default: return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
  };

  const renderTicket = ({ item }: { item: any }) => {
    const status = getStatusStyle(item.statut);
    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketRef}>{item.ticketRef}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.ticketTitle} numberOfLines={1}>{item.description.split(' - ')[0]}</Text>
        <Text style={styles.ticketDesc} numberOfLines={2}>{item.description.split(' - ')[1] || item.description}</Text>
        <View style={styles.ticketFooter}>
          <Clock size={12} color={Colors.text.muted} />
          <Text style={styles.ticketDate}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistance & Maintenance</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]} 
          onPress={() => setActiveTab('HISTORY')}
        >
          <History size={18} color={activeTab === 'HISTORY' ? Colors.primary : Colors.text.muted} />
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>Mes Incidents</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'NEW' && styles.activeTab]} 
          onPress={() => setActiveTab('NEW')}
        >
          <Plus size={18} color={activeTab === 'NEW' ? Colors.primary : Colors.text.muted} />
          <Text style={[styles.tabText, activeTab === 'NEW' && styles.activeTabText]}>Signaler</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'HISTORY' ? (
        <View style={{ flex: 1 }}>
          {loading && tickets.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
          ) : (
            <FlatList 
              data={tickets}
              keyExtractor={(item) => item.id}
              renderItem={renderTicket}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <CheckCircle2 size={48} color={Colors.success} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>Tout va bien !</Text>
                  <Text style={styles.emptyDesc}>Vous n'avez aucun incident en cours.</Text>
                </View>
              }
              onRefresh={fetchTickets}
              refreshing={refreshing}
            />
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.formTitle}>Détails de l'incident</Text>
          
          <Text style={styles.inputLabel}>Urgence</Text>
          <View style={styles.btnRow}>
            {['FAIBLE', 'NORMALE', 'URGENTE'].map((level) => (
              <TouchableOpacity 
                key={level}
                style={[styles.priBtn, priority === level && styles.priBtnActive]} 
                onPress={() => setPriority(level)}
              >
                <Text style={[styles.priText, priority === level && styles.priTextActive]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Titre</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Panne de courant cuisine"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Détails (heure, bruits suspects, etc.)"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.inputLabel}>Photo (Optionnel)</Text>
          <View style={styles.photoContainer}>
            {photo ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: photo }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>X</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                  <Camera size={24} color={Colors.primary} />
                  <Text style={styles.photoBtnText}>Caméra</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                  <ImageIcon size={24} color={Colors.primary} />
                  <Text style={styles.photoBtnText}>Galerie</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>ENVOYER LE SIGNALEMENT</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  
  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, padding: 4, margin: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 8 },
  activeTab: { backgroundColor: Colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.text.muted },
  activeTabText: { color: Colors.primary },

  listContainer: { padding: 16, paddingTop: 0 },
  ticketCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketRef: { fontSize: 11, fontWeight: '800', color: Colors.primary, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  ticketTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  ticketDesc: { fontSize: 13, color: Colors.text.muted, marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ticketDate: { fontSize: 11, color: Colors.text.muted, fontWeight: '600' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', paddingHorizontal: 40 },

  container: { padding: 24, paddingTop: 8 },
  formTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', marginBottom: 8 },
  btnRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  priBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  priBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  priText: { fontSize: 11, fontWeight: '800', color: Colors.text.muted },
  priTextActive: { color: Colors.white },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 16, fontSize: 14, fontWeight: '600', color: Colors.primary, marginBottom: 20 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  
  photoContainer: { marginBottom: 32 },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoBtn: { flex: 1, height: 80, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  imageWrapper: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  submitBtn: { backgroundColor: Colors.primary, padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: Colors.white, fontWeight: '900', letterSpacing: 0.5, fontSize: 14 }
});
