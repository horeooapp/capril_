import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/theme';

interface BrandHeaderProps {
    title: string;
    subtitle?: string;
    roleLabel: string;
    roleColor: string;
    onNotifPress?: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ 
    title, 
    subtitle, 
    roleLabel, 
    roleColor,
    onNotifPress 
}) => {
    return (
        <LinearGradient
            colors={Theme.gradients.premium as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
        >
            <View style={styles.headerTop}>
                <View style={styles.left}>
                    <View style={styles.brandRow}>
                        <Image 
                            source={require('../../../assets/icon.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
                            <Text style={styles.roleText}>{roleLabel.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{title}</Text>
                    {subtitle && <Text style={styles.userSub}>{subtitle}</Text>}
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={onNotifPress}>
                    <Text style={{ fontSize: 18 }}>🔔</Text>
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        ...Theme.shadows.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    left: { flex: 1 },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    logo: {
        width: 30,
        height: 30,
        marginRight: 10,
        borderRadius: 8,
    },
    roleBadge: {
        borderRadius: 7,
        paddingHorizontal: 9,
        paddingVertical: 2,
    },
    roleText: {
        fontSize: 9,
        fontWeight: '900',
        color: Theme.colors.white,
        letterSpacing: 1.5,
    },
    userName: {
        fontSize: 20,
        fontWeight: '900',
        color: Theme.colors.white,
        letterSpacing: -0.5,
    },
    userSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '700',
        marginTop: 2,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    notifDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.red,
        borderWidth: 2,
        borderColor: Theme.colors.navy,
    },
});
