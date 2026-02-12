import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Send, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import MapPicker from '../components/MapPicker';
import { theme } from '../styles/theme';

export default function SubmissionScreen({ route, navigation }) {
    const { photo, category: initialCategory, rawPrediction } = route.params;
    const insets = useSafeAreaInsets();

    const [category, setCategory] = useState(initialCategory || "Others");
    const [description, setDescription] = useState("");
    const [locationAddress, setLocationAddress] = useState("");
    const [coordinates, setCoordinates] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const username = await AsyncStorage.getItem('user_name');
            const uid = await AsyncStorage.getItem('user_uid');
            if (uid) {
                setUser({ username: username || "mobile_user", uid });
            }
        } catch (e) {
            console.log("Error loading user", e);
        }
    };

    const handleLocationSelect = (loc) => {
        setCoordinates({ latitude: loc.latitude, longitude: loc.longitude });
        setLocationAddress(loc.address);
    };

    const handleSubmit = async () => {
        if (!description || !locationAddress || !category) {
            Alert.alert("Missing Fields", "Please fill in all fields before submitting.");
            return;
        }

        if (!user) {
            Alert.alert("Error", "User session not found. Please login again.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('username', user.username);
            formData.append('uid', user.uid);
            formData.append('category', category);
            formData.append('location', locationAddress);
            formData.append('description', description);
            formData.append('departmentOfficer', 'officer');
            formData.append('status', 'Submitted');

            if (coordinates) {
                formData.append('latitude', String(coordinates.latitude));
                formData.append('longitude', String(coordinates.longitude));
            }

            formData.append('images', {
                uri: photo.uri,
                name: 'complaint_image.jpg',
                type: 'image/jpeg',
            });

            const response = await axios.post(`${API_URL}/complaints`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
            });

            if (response.status === 201) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Success' }],
                });
            } else {
                Alert.alert("Error", "Submission failed. Please try again.");
            }

        } catch (error) {
            console.error("Submission Error:", error);
            Alert.alert("Submission Failed", "Could not connect to server. Ensure you are on the same network.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
            <ScrollView
                style={[styles.container]}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Header */}
                <View style={[styles.imageContainer, { paddingTop: insets.top }]}>
                    <Image source={{ uri: photo.uri }} style={styles.headerImage} />
                    <View style={styles.overlay} />

                    {/* AI Badge */}
                    {rawPrediction && (
                        <View style={styles.aiBadge}>
                            <Image source={require('../../assets/adaptive-icon.png')} style={styles.aiIcon} />
                            <Text style={styles.aiText}>
                                AI Detected: {rawPrediction.label?.replace(/_/g, ' ') || "Issue"}
                            </Text>
                            <CheckCircle size={16} color={theme.colors.success} />
                        </View>
                    )}
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Complaint Details</Text>

                    {/* Category Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TextInput
                            style={styles.input}
                            value={category}
                            onChangeText={setCategory}
                            placeholder="e.g. Roads, Water, Health"
                            placeholderTextColor={theme.colors.text.light}
                        />
                    </View>

                    {/* Location Field with Map */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <MapPicker onLocationSelect={handleLocationSelect} />

                        <View style={styles.locationTextContainer}>
                            <MapPin size={16} color={theme.colors.primary} />
                            <Text style={styles.locationText}>
                                {locationAddress || "Select a location on the map"}
                            </Text>
                        </View>
                    </View>

                    {/* Description Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor={theme.colors.text.light}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.submitText}>Submit Report</Text>
                            <Send size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        height: 300,
        position: 'relative',
        backgroundColor: 'black'
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    aiBadge: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 12,
        borderRadius: theme.borderRadius.l,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        ...theme.shadows.medium,
    },
    aiIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    aiText: {
        flex: 1,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        fontSize: 16
    },
    formContainer: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        marginTop: -20,
        padding: theme.spacing.l,
        paddingBottom: 40,
        gap: 24,
    },
    sectionTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.s,
    },
    inputGroup: {
        gap: 8
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
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
    textArea: {
        minHeight: 120,
    },
    locationTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary + '10', // Light primary
        padding: 12,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.primary + '40'
    },
    locationText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '500',
        flex: 1
    },
    footer: {
        padding: theme.spacing.l,
        paddingTop: 10,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        padding: 18,
        borderRadius: theme.borderRadius.l,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        ...theme.shadows.large,
    },
    submitText: {
        color: theme.colors.text.inverse,
        fontSize: 18,
        fontWeight: 'bold'
    }
});
