import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../theme/colors';
import { Home, FileText, Activity, MessageSquare, MapPin, CreditCard, Shield, Menu } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function CustomBottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBarBackground}>
        <Svg width={width} height={70} viewBox={`0 0 ${width} 70`} fill="none">
          <Path
            d={`M0 0 H${width * 0.35} C${width * 0.4} 0 ${width * 0.4} 45 ${width * 0.5} 45 C${width * 0.6} 45 ${width * 0.6} 0 ${width * 0.65} 0 H${width} V70 H0 Z`}
            fill={Colors.primary}
          />
        </Svg>
      </View>

      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Icon mapper
          const getIcon = () => {
            const color = isFocused ? Colors.accent : Colors.white;
            switch (route.name) {
              case 'Dashboard': return <Home size={24} color={color} />;
              case 'Contract': return <FileText size={24} color={color} />;
              case 'Services': return <Shield size={24} color={color} />;
              case 'MenuDrawer': return <Menu size={24} color={Colors.white} />;
              default: return <Menu size={24} color={Colors.white} />;
            }
          };

          const onPress = () => {
            if (route.name === 'MenuDrawer') {
               (navigation as any).openDrawer();
               return;
            }

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
              >
                {getIcon()}
              </TouchableOpacity>
              {index === 1 && <View style={styles.centerSpace} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Central FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PaymentProcess')}>
        <View style={styles.fabInner}>
          <CreditCard size={32} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    height: 90,
    backgroundColor: 'transparent',
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
  },
  content: {
    flexDirection: 'row',
    height: 70,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSpace: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    top: 5,
    left: width / 2 - 35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
