import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { AI_URL } from '../config';
import { ArrowRight, RefreshCcw } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function PreviewScreen({ route, navigation }) {
    const { photo } = route.params;
    const [analyzing, setAnalyzing] = useState(true);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        analyzeImage();
    }, []);

    const analyzeImage = async () => {
        setAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: photo.uri,
                name: 'upload.jpg',
                type: 'image/jpeg'
            });

            // Use AI_URL from config
            const response = await axios.post(`${AI_URL}/predict`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 10000,
            });

            setPrediction(response.data);
        } catch (error) {
            console.log("Prediction Error:", error);
            // Fallback if AI fails: don't block the user
            setPrediction({ label: "Unknown", confidence: 0 });
            Alert.alert("Note", "AI analysis could not complete. You can still submit your complaint.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getCategoryFromLabel = (label) => {
        if (!label) return "Others";
        const l = label.toLowerCase();
        if (l.includes("road") || l.includes("pothole") || l.includes("street")) return "Roads & Streetlights";
        if (l.includes("water") || l.includes("pipe")) return "Water Supply";
        if (l.includes("garbage") || l.includes("trash") || l.includes("waste")) return "Garbage / Sanitation";
        if (l.includes("electricity") || l.includes("pole") || l.includes("wire")) return "Electricity";
        if (l.includes("health") || l.includes("stray")) return "Health / Safety";
        return "Others";
    };

    const handleContinue = () => {
        const category = prediction ? getCategoryFromLabel(prediction.label) : "Others";
        navigation.navigate('Submission', {
            photo,
            category,
            rawPrediction: prediction
        });
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />

            <View style={styles.overlay}>
                <View style={styles.analysisCard}>
                    {analyzing ? (
                        <View style={styles.analyzingContent}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.analyzingText}>Analyzing issue with AI...</Text>
                        </View>
                    ) : (
                        <View style={styles.resultContent}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {prediction?.confidence > 0.6 ? 'Issue Detected' : 'Analysis Complete'}
                                </Text>
                            </View>

                            <Text style={styles.issueText}>
                                {prediction?.label?.replace(/_/g, ' ') || "No specific issue detected"}
                            </Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.retakeButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <RefreshCcw size={20} color={theme.colors.text.secondary} />
                                    <Text style={styles.retakeText}>Retake</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.continueButton}
                                    onPress={handleContinue}
                                >
                                    <Text style={styles.continueText}>Continue</Text>
                                    <ArrowRight size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.l,
        paddingBottom: 40,
    },
    analysisCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        ...theme.shadows.large,
    },
    analyzingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 15
    },
    analyzingText: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600'
    },
    resultContent: {
        gap: 10
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.success + '20', // Light green
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.m,
    },
    badgeText: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    issueText: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        textTransform: 'capitalize'
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 12,
    },
    retakeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: theme.borderRadius.l,
        backgroundColor: theme.colors.background,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    retakeText: {
        color: theme.colors.text.secondary,
        fontWeight: '600'
    },
    continueButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: theme.borderRadius.l,
        backgroundColor: theme.colors.primary,
        gap: 8,
        ...theme.shadows.medium,
    },
    continueText: {
        color: theme.colors.text.inverse,
        fontWeight: 'bold',
        fontSize: 16
    }
});
