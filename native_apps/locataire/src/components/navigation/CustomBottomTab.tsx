import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../theme/colors';
import { Home, FileText, BarChart2, User, CreditCard } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CustomBottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBarBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const getIconAndLabel = () => {
            const color = isFocused ? Colors.accent : Colors.qNavyMedium || '#475569';
            switch (route.name) {
              case 'Dashboard': return { icon: <Home size={22} color={color} />, label: 'Accueil' };
              case 'Contract': return { icon: <FileText size={22} color={color} />, label: 'Quittances' };
              case 'Passport': return { icon: <BarChart2 size={22} color={color} />, label: 'Score' };
              case 'Profile': return { icon: <User size={22} color={color} />, label: 'Profil' };
              default: return { icon: <Home size={22} color={color} />, label: '' };
            }
          };

          const { icon, label } = getIconAndLabel();
          const color = isFocused ? Colors.accent : Colors.qNavyMedium || '#475569';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <React.Fragment key={route.key}>
              <TouchableOpacity
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {icon}
                <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '800' : '600' }]}>{label}</Text>
              </TouchableOpacity>
              {index === 1 && <View style={styles.centerSpace} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Central FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PaymentProcess')} activeOpacity={0.8}>
        <View style={styles.fabInner}>
          <CreditCard size={28} color="#1E293B" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 15,
    width: width - 30,
    alignSelf: 'center',
    height: 70,
    backgroundColor: 'transparent',
  },
  tabBarBackground: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    elevation: 8,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  centerSpace: {
    width: 60,
  },
  fab: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#f8fafc',
  },
  fabInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
