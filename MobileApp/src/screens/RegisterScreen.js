import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        pass: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!formData.username || !formData.name || !formData.email || !formData.pass) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const uid = 'u' + Date.now(); // Simple UID generation matching web logic

            const response = await axios.post(`${API_URL}/register`, {
                ...formData,
                role: 'citizen',
                uid: uid
            });

            if (response.status === 201) {
                Alert.alert('Success', 'Account created successfully! Please login.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Registration Failed', error.response?.data?.msg || 'Server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Civifixer today</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="John Doe"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.username}
                            onChangeText={(text) => setFormData({ ...formData, username: text })}
                            autoCapitalize="none"
                            placeholder="johndoe123"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholder="john@example.com"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.pass}
                            onChangeText={(text) => setFormData({ ...formData, pass: text })}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.linkBold}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing.l,
    },
    header: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
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
    loginLink: {
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
