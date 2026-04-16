import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView
} from 'react-native';
import { User, Shield, Bell, LogOut, ChevronRight, Fingerprint, Lock, Mail, Building } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors } from '../theme/colors';

export default function ProfileScreen({ navigation, route }: any) {
  const { token, userProfile } = route.params || {};
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    checkBiometrics();
    loadBiometricPreference();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(compatible && enrolled);
  };

  const loadBiometricPreference = async () => {
    const val = await AsyncStorage.getItem('biometric_enabled');
    setIsBiometricEnabled(val === 'true');
  };

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      if (!hasBiometrics) {
        return Alert.alert("Indisponible", "Votre appareil ne supporte pas la biométrie.");
      }
      
      const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirmez votre identité pour activer la biométrie',
      });

      if (result.success) {
        await AsyncStorage.setItem('biometric_enabled', 'true');
        await AsyncStorage.setItem('saved_token_proprio', token);
        setIsBiometricEnabled(true);
      } else {
        setIsBiometricEnabled(false);
      }
    } else {
      await AsyncStorage.removeItem('biometric_enabled');
      await AsyncStorage.removeItem('saved_token_proprio');
      setIsBiometricEnabled(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Confirmez-vous la déconnexion de l'espace Propriétaire ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Building size={40} color={Colors.white} />
          </View>
          <Text style={styles.userName}>{userProfile?.fullName || 'Mon Espace Propriétaire'}</Text>
          <View style={styles.emailBadge}>
            <Shield size={14} color={Colors.text.muted} />
            <Text style={styles.userEmail}>{userProfile?.userEmail || 'Session Sécurisée'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité Premium</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Fingerprint size={20} color={Colors.success} />
              </View>
              <View>
                <Text style={styles.settingLabel}>FaceID / Empreinte</Text>
                <Text style={styles.settingSub}>Connexion rapide par biométrie</Text>
              </View>
            </View>
            <Switch 
              value={isBiometricEnabled} 
              onValueChange={toggleBiometrics}
              trackColor={{ false: '#cbd5e1', true: Colors.success }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres du Compte</Text>
          
          <TouchableOpacity style={styles.settingRow}>
             <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(7, 89, 133, 0.1)' }]}>
                <User size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Informations Personnelles</Text>
                <Text style={styles.settingSub}>Gérer mon profil bailleur</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
             <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <Bell size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Préférences de Notifications</Text>
                <Text style={styles.settingSub}>Alertes loyers et messages</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>QAPRIL Business v1.2.0 • Premium Edition</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  userName: { fontSize: 22, fontWeight: '900', color: Colors.primary, marginBottom: 8 },
  emailBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: 'rgba(0,0,0,0.03)', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 20 
  },
  userEmail: { fontSize: 13, color: Colors.text.muted, fontWeight: '600' },
  section: { 
    backgroundColor: Colors.white, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12 
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  settingSub: { fontSize: 12, color: Colors.text.muted, marginTop: 2 },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    paddingVertical: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 20,
    marginTop: 10
  },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '800' },
  versionText: { textAlign: 'center', marginTop: 32, fontSize: 11, color: Colors.text.muted, fontWeight: '600' }
});
