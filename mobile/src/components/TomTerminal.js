import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';
import { Bot, X, Mic, Send, Zap } from 'lucide-react-native';
import { Theme } from '../styles/DesignSystem';
import GlassCard from './GlassCard';

export default function TomTerminal({ visible, onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'TACTICAL OPERATIONS MANAGER ONLINE. AWAITING SYNC INSTRUCTIONS.' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef();

    // Oscilloscope Animation
    const bars = useRef([...Array(12)].map(() => new Animated.Value(4))).current;

    useEffect(() => {
        if (isListening) {
            const animations = bars.map(bar =>
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(bar, {
                            toValue: Math.random() * 40 + 10,
                            duration: 200 + Math.random() * 300,
                            useNativeDriver: false,
                        }),
                        Animated.timing(bar, {
                            toValue: 4,
                            duration: 200 + Math.random() * 300,
                            useNativeDriver: false,
                        })
                    ])
                )
            );
            animations.forEach(a => a.start());
        } else {
            bars.forEach(bar => {
                bar.stopAnimation();
                Animated.timing(bar, { toValue: 4, duration: 300, useNativeDriver: false }).start();
            });
        }
    }, [isListening]);

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input.toUpperCase() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "UNDERSTOOD. SYNCING DATA TO CORE HUB. OPTIMIZING INVENTORY PROTOCOLS."
            }]);
        }, 1000);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.botIconContainer}>
                                <Bot size={24} color={Theme.colors.primary} />
                                <View style={styles.pulseContainer}>
                                    <Zap size={10} color={Theme.colors.primary} />
                                </View>
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>T.O.M. LINK</Text>
                                <Text style={styles.headerStatus}>{isListening ? 'VOICE SYNC ACTIVE' : 'AWAITING INPUT'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={Theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Oscilloscope */}
                    <View style={styles.oscilloscope}>
                        <View style={styles.visualizer}>
                            {bars.map((bar, i) => (
                                <Animated.View
                                    key={i}
                                    style={[
                                        styles.visualBar,
                                        { height: bar, backgroundColor: isListening ? Theme.colors.primary : 'rgba(255, 255, 255, 0.1)' }
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={styles.hzLabel}>FREQUENCY: 44.1KHZ</Text>
                    </View>

                    {/* Message Feed */}
                    <ScrollView
                        ref={scrollRef}
                        style={styles.feed}
                        contentContainerStyle={styles.feedContent}
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
                    >
                        {messages.map((m, i) => (
                            <View key={i} style={[styles.messageWrapper, m.role === 'user' ? styles.userMsgWrapper : styles.botMsgWrapper]}>
                                <View style={[styles.messageBubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}>
                                    <Text style={[styles.messageText, m.role === 'user' ? styles.userText : styles.botText]}>
                                        {m.text}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <View style={styles.inputRow}>
                            <TouchableOpacity
                                style={[styles.micButton, isListening && styles.micButtonActive]}
                                onPress={() => setIsListening(!isListening)}
                            >
                                <Mic size={24} color={isListening ? '#FFF' : Theme.colors.text.secondary} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                placeholder="SYNC COMMAND..."
                                placeholderTextColor={Theme.colors.text.dimmed}
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={sendMessage}
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <Send size={24} color={Theme.colors.background} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.hintsScroll}>
                            {['"WHAT IS LOW?"', '"EXPIRING TODAY?"', '"FIND MILK"'].map(hint => (
                                <TouchableOpacity key={hint} style={styles.hintChip} onPress={() => setInput(hint.replace(/"/g, ''))}>
                                    <Text style={styles.hintText}>{hint}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    botIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
    },
    pulseContainer: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: Theme.colors.background,
        borderRadius: 8,
        padding: 2,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.5)',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    headerStatus: {
        color: Theme.colors.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        opacity: 0.8,
    },
    closeButton: {
        padding: 8,
    },
    oscilloscope: {
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualizer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 60,
        gap: 4,
    },
    visualBar: {
        width: 4,
        borderRadius: 2,
    },
    hzLabel: {
        position: 'absolute',
        bottom: 10,
        color: 'rgba(255, 255, 255, 0.1)',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 4,
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        padding: Theme.spacing.lg,
        gap: Theme.spacing.lg,
    },
    messageWrapper: {
        flexDirection: 'row',
        width: '100%',
    },
    userMsgWrapper: {
        justifyContent: 'flex-end',
    },
    botMsgWrapper: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 16,
        borderRadius: 24,
    },
    userBubble: {
        backgroundColor: Theme.colors.primary,
        borderTopRightRadius: 4,
    },
    botBubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: 0.5,
    },
    userText: {
        color: Theme.colors.background,
    },
    botText: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    controls: {
        padding: Theme.spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.lg,
        backgroundColor: 'rgba(9, 9, 11, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    micButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButtonActive: {
        backgroundColor: Theme.colors.secondary,
    },
    input: {
        flex: 1,
        height: 56,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 16,
        paddingHorizontal: 16,
        color: '#FFF',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    sendButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hintsScroll: {
        flexDirection: 'row',
        gap: 8,
    },
    hintChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    hintText: {
        color: Theme.colors.text.dimmed,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    }
});
