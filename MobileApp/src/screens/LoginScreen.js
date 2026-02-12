import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { theme } from '../styles/theme';
// If linear gradient not installed, we fallback to View. User didn't ask for it specifically but "Modern" implies it.
// Safest is to use View with theme colors for now to avoid dependency issues unless I install it.
// I'll stick to View but use the theme.

export default function LoginScreen({ navigation, setIsLoggedIn }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                uname: username,
                pass: password
            });

            let uid, role, responseUsername;

            if (response.status === 201) {
                // Admin Login
                uid = 'admin_001';
                role = 'admin';
                responseUsername = 'Administrator';
            } else if (response.status === 202) {
                // Officer Login
                uid = 'officer_001';
                role = 'officer';
                responseUsername = 'officer';
            } else if (response.status === 200) {
                // Citizen Login or others
                const data = response.data;
                uid = data.uid;
                role = data.role;
                responseUsername = data.username;
            }

            if (uid && role) {
                console.log("Login Success:", { uid, role, responseUsername });

                // Save session
                await AsyncStorage.setItem('user_uid', uid);
                await AsyncStorage.setItem('user_role', role);
                await AsyncStorage.setItem('user_name', responseUsername || username);

                // Register for Push Notifications
                try {
                    // Dynamic import to avoid issues if service added later or issues with simple refresh
                    const { registerForPushNotificationsAsync, updateUserPushToken } = require('../services/notifications');
                    const token = await registerForPushNotificationsAsync();
                    if (token) {
                        await updateUserPushToken(uid, token);
                    }
                } catch (notiError) {
                    console.log("Notification setup error:", notiError);
                }

                setIsLoggedIn(true);
            } else {
                Alert.alert('Login Error', 'Could not parse user details.');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Login Failed', error.response?.data?.msg || 'Invalid credentials or server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>🏛️</Text>
                    </View>
                    <Text style={styles.title}>Civifixer</Text>
                    <Text style={styles.subtitle}>Empowering Citizens, Fixing Cities.</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            placeholder="Enter your username"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholder="Enter your password"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.registerLink}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.linkText}>
                        New here? <Text style={styles.linkBold}>Create an account</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#EEF2FF',
        borderRadius: theme.borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        ...theme.shadows.small
    },
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        ...theme.shadows.medium,
        marginBottom: theme.spacing.l,
    },
    inputGroup: {
        marginBottom: theme.spacing.m,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.s,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        marginTop: theme.spacing.s,
        ...theme.shadows.small,
    },
    buttonText: {
        color: theme.colors.text.inverse,
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        alignItems: 'center',
    },
    linkText: {
        fontSize: 15,
        color: theme.colors.text.secondary,
    },
    linkBold: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
