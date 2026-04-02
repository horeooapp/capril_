import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface TabItem {
  id: string;
  icon: string;
  label: string;
}

interface ActionTab {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface BottomNavProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  actionTabs?: ActionTab[];
  accentColor?: string; // e.g. Navy, Teal
}

export const BottomNav: React.FC<BottomNavProps> = ({ tabs, activeTab, onChange, actionTabs = [], accentColor = Theme.colors.navy }) => {
  return (
    <View style={styles.container}>
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        return (
          <TouchableOpacity 
            key={t.id} 
            onPress={() => onChange(t.id)} 
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isActive && { backgroundColor: `${accentColor}1A` }]}>
              <Text style={[styles.navIcon, { opacity: isActive ? 1 : 0.4 }]}>{t.icon}</Text>
            </View>
            <Text style={[
              styles.navLabel, 
              { color: isActive ? accentColor : Theme.colors.textLight, fontWeight: isActive ? '800' : '600' }
            ]}>
              {t.label}
            </Text>
            {isActive && <View style={[styles.activeDot, { backgroundColor: accentColor }]} />}
          </TouchableOpacity>
        );
      })}
      {actionTabs.map(t => (
        <TouchableOpacity 
          key={t.id} 
          onPress={t.onPress} 
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.navIcon, { opacity: 0.8, color: Theme.colors.red }]}>{t.icon}</Text>
          </View>
          <Text style={[
            styles.navLabel, 
            { color: Theme.colors.red, fontWeight: '800' }
          ]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    shadowColor:Theme.colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: { 
    fontSize: 10, 
    marginTop: 0,
    letterSpacing: 0.3, 
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -6,
  }
});
