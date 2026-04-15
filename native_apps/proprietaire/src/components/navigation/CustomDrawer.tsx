import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { 
    LayoutDashboard, Home, Key, FileText, Wallet, Coins, AlertCircle, FileCheck, Wrench, MessageSquare, 
    Calendar, Shield, Users, BookOpen, Settings, Zap, Compass, Building, Receipt, FileSignature, 
    FileSearch, BarChart3, Fingerprint, RefreshCw, FolderSearch, Scale, Link2, MonitorPlay, ChevronDown, ChevronRight, LogOut
} from 'lucide-react-native';

const MENU_CATEGORIES = [
    {
        title: "L'Essentiel",
        items: [
            { name: 'Synthèse', route: 'MainTab', icon: LayoutDashboard },
            { name: 'Profil', route: 'GenericData', params: { featureName: 'Profil Propriétaire' }, icon: Fingerprint },
        ]
    },
    {
        title: "Mon Patrimoine",
        items: [
            { name: 'Mes biens', route: 'PropertiesScreen', icon: Home },
            { name: 'Mes mandats', route: 'GenericData', params: { featureName: 'Mes Mandats' }, icon: FileSignature },
            { name: 'Mes baux', route: 'GenericData', params: { featureName: 'Mes Baux' }, icon: FileText },
            { name: 'États des lieux', route: 'GenericData', params: { featureName: 'États des Lieux' }, icon: FileCheck },
            { name: "Outils d'Import", route: 'GenericData', params: { featureName: "Outils d'Import" }, icon: FolderSearch }
        ]
    },
    {
        title: "Pécuniaire & Finances",
        items: [
            { name: 'Loyers', route: 'GenericData', params: { featureName: 'Loyers' }, icon: Coins },
            { name: 'Impayés', route: 'GenericData', params: { featureName: 'Impayés' }, icon: AlertCircle },
            { name: 'Fiscal DGI', route: 'GenericData', params: { featureName: 'Fiscalité DGI' }, icon: Building }, 
            { name: 'Mon Wallet', route: 'Wallet', icon: Wallet },
            { name: 'Régul. Charges', route: 'GenericData', params: { featureName: 'Régulation des Charges' }, icon: RefreshCw }
        ]
    },
    {
        title: "Services Flexibles",
        items: [
            { name: 'Maintenance', route: 'Maintenance', icon: Wrench },
            { name: 'Messagerie', route: 'Message', icon: MessageSquare },
            { name: 'Agenda & Visites', route: 'GenericData', params: { featureName: 'Agenda & Visites' }, icon: Calendar },
            { name: 'Assurances', route: 'GenericData', params: { featureName: 'Assurances' }, icon: Shield },
            { name: 'Successions', route: 'GenericData', params: { featureName: 'Successions' }, icon: Users },
            { name: 'Syndic', route: 'GenericData', params: { featureName: 'Syndic' }, icon: Building },
            { name: 'Marketplace', route: 'GenericData', params: { featureName: 'Marketplace' }, icon: Compass },
            { name: 'Procurations', route: 'GenericData', params: { featureName: 'Procurations' }, icon: Key }
        ]
    },
    {
        title: "Administration",
        items: [
            { name: 'Documents', route: 'GenericData', params: { featureName: 'Documents' }, icon: FileSearch },
            { name: 'Certificats', route: 'GenericData', params: { featureName: 'Certificats' }, icon: Receipt },
            { name: 'Rapports', route: 'GenericData', params: { featureName: 'Rapports' }, icon: BarChart3 },
            { name: 'Gouvernance', route: 'GenericData', params: { featureName: 'Gouvernance' }, icon: Scale }
        ]
    },
    {
        title: "IA & PropTech",
        items: [
            { name: 'Automatisations', route: 'GenericData', params: { featureName: 'Automatisations' }, icon: Zap },
            { name: 'Matching', route: 'GenericData', params: { featureName: 'Matching Locataire' }, icon: Link2 },
            { name: 'Indice ICL', route: 'GenericData', params: { featureName: 'Indice ICL' }, icon: BarChart3 },
            { name: 'Assistant IA', route: 'GenericData', params: { featureName: 'Assistant IA' }, icon: MonitorPlay },
            { name: 'Manuel Officiel', route: 'GenericData', params: { featureName: 'Manuel Officiel' }, icon: BookOpen }
        ]
    }
];

export default function CustomDrawer(props: any) {
  const [expandedSection, setExpandedSection] = useState<string | null>("L'Essentiel");

  const toggleSection = (title: string) => {
    setExpandedSection(prev => prev === title ? null : title);
  };

  const navigateTo = (route: string, params?: any) => {
    props.navigation.navigate(route, params);
  };

  return (
    <View style={styles.container}>
      {/* Header du Drawer avec le Logo */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://img.freepik.com/vecteurs-libre/logo-maison-ecologique_23-2148443906.jpg' }} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.version}>QAPRIL V2 - PROPRIETAIRE</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {MENU_CATEGORIES.map((category, index) => {
          const isExpanded = expandedSection === category.title;

          return (
            <View key={index} style={styles.categoryContainer}>
              <TouchableOpacity 
                style={styles.categoryHeader} 
                onPress={() => toggleSection(category.title)}
              >
                <Text style={[styles.categoryTitle, isExpanded && styles.categoryTitleActive]}>
                  {category.title}
                </Text>
                {isExpanded ? (
                  <ChevronDown size={20} color="#059669" />
                ) : (
                  <ChevronRight size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.itemsContainer}>
                  {category.items.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={styles.menuItem} 
                        onPress={() => navigateTo(item.route, item.params)}
                      >
                        <IconComponent size={20} color="#4b5563" />
                        <Text style={styles.menuItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Me déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  version: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryTitleActive: {
    color: '#059669',
  },
  itemsContainer: {
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    fontWeight: '600',
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
    marginLeft: 10,
    textTransform: 'uppercase',
  }
});
