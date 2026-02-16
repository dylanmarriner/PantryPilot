import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../styles/DesignSystem';

export default function GlassCard({ children, style, intensity = 20 }) {
    const Container = Platform.OS === 'ios' ? BlurView : View;

    return (
        <Container
            intensity={intensity}
            tint="dark"
            style={[styles.card, style]}
        >
            <View style={styles.innerShadow}>
                {children}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Platform.OS === 'android' ? Theme.colors.card : 'rgba(24, 24, 27, 0.6)',
        borderRadius: Theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    innerShadow: {
        padding: Theme.spacing.md,
        flex: 1,
        // Note: Inner shadow is hard to achieve in RN without extra libs, 
        // so we use a subtle border/background instead
    }
});
