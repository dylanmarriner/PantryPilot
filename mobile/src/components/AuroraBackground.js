import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../styles/DesignSystem';

const { width, height } = Dimensions.get('window');

export default function AuroraBackground({ children }) {
    return (
        <View style={styles.container}>
            {/* Background Orbs */}
            <View style={[styles.orb, styles.topOrb]}>
                <LinearGradient
                    colors={['rgba(34, 211, 238, 0.15)', 'transparent']}
                    style={styles.gradient}
                />
            </View>

            <View style={[styles.orb, styles.bottomOrb]}>
                <LinearGradient
                    colors={['rgba(217, 70, 239, 0.1)', 'transparent']}
                    style={styles.gradient}
                />
            </View>

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    orb: {
        position: 'absolute',
        width: width * 1.5,
        height: height * 0.8,
        borderRadius: width * 0.75,
    },
    topOrb: {
        top: -height * 0.2,
        left: -width * 0.5,
    },
    bottomOrb: {
        bottom: -height * 0.2,
        right: -width * 0.5,
    },
    gradient: {
        flex: 1,
        borderRadius: width * 0.75,
    },
});
