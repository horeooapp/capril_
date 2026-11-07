import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { ArrowLeft, Home, LogOut } from 'lucide-react-native';

/**
 * Affiche la boîte de confirmation pour quitter l'application
 */
export function confirmExitApp() {
  Alert.alert(
    'Quitter QAPRIL',
    'Voulez-vous vraiment quitter l’application ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => {
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          }
        },
      },
    ],
    { cancelable: true }
  );
}

interface TopNavHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  showExit?: boolean;
  onBack?: () => void;
  primaryColor?: string;
  bgColor?: string;
  variant?: 'light' | 'dark';
  rightElement?: React.ReactNode;
}

export function TopNavHeader({
  title,
  subtitle,
  showBack = true,
  showHome = true,
  showExit = true,
  onBack,
  primaryColor = '#2C3E6B',
  bgColor,
  variant = 'light',
  rightElement,
}: TopNavHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack() && !isHome) {
      router.back();
    } else if (!isHome) {
      router.replace('/(tabs)');
    } else {
      confirmExitApp();
    }
  };

  const handleHome = () => {
    if (!isHome) {
      router.replace('/(tabs)');
    }
  };

  const isDark = variant === 'dark';
  const iconBg = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)';
  const iconColor = isDark ? '#FFFFFF' : primaryColor;
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subColor = isDark ? 'rgba(255, 255, 255, 0.75)' : '#6B7280';
  const effectiveBg = bgColor || (isDark ? primaryColor : '#FFFFFF');

  return (
    <View style={[styles.headerContainer, { backgroundColor: effectiveBg }]}>
      {/* Boutons Gauche : Retour & Accueil */}
      <View style={styles.navGroup}>
        {showBack && (
          <Pressable
            accessibilityLabel="Retour en arrière"
            style={[styles.btn, { backgroundColor: iconBg }]}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft color={iconColor} size={18} strokeWidth={2.4} />
          </Pressable>
        )}

        {showHome && (
          <Pressable
            accessibilityLabel="Aller à l'accueil"
            style={[styles.btn, { backgroundColor: iconBg }]}
            onPress={handleHome}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Home color={iconColor} size={18} strokeWidth={2.4} />
          </Pressable>
        )}
      </View>

      {/* Titre central ou Logo */}
      <View style={styles.titleCenter}>
        {title ? (
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.brandRow}>
            <Text style={[styles.brandText, { color: textColor }]}>QAPRIL</Text>
            <View style={styles.brandDot} />
          </View>
        )}
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Boutons Droite : Éléments personnalisés & Bouton Quitter */}
      <View style={styles.rightGroup}>
        {rightElement}
        {showExit && (
          <Pressable
            accessibilityLabel="Quitter l'application"
            style={[styles.btnExit, isDark && styles.btnExitDark]}
            onPress={confirmExitApp}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LogOut color={isDark ? '#FCA5A5' : '#EF4444'} size={16} strokeWidth={2.4} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 76,
  },
  titleCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 76,
    justifyContent: 'flex-end',
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnExit: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnExitDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
});

