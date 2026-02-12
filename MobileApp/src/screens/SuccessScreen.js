import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function SuccessScreen({ navigation }) {

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <CheckCircle2 size={100} color={theme.colors.success} />
                <Text style={styles.title}>Complaint Submitted!</Text>
                <Text style={styles.subtitle}>
                    Your issue has been reported to the relevant department.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Dashboard")}
            >
                <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    content: {
        alignItems: 'center',
        gap: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        textAlign: 'center',
        ...theme.typography.h1,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 40,
        ...theme.typography.body,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 18,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        width: '100%',
        ...theme.shadows.large,
    },
    buttonText: {
        color: theme.colors.text.inverse,
        fontSize: 18,
        fontWeight: 'bold'
    }
});
