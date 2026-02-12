import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { Plus, LogOut, Clock, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation, setIsLoggedIn }) {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();
    const [role, setRole] = useState('citizen');

    const fetchComplaints = async () => {
        try {
            const uid = await AsyncStorage.getItem('user_uid');
            const userRole = await AsyncStorage.getItem('user_role');
            console.log("Dashboard fetching for:", uid, "Role:", userRole);
            setRole(userRole || 'citizen');

            if (!uid) return;

            let endpoint = `${API_URL}/history/${uid}`;

            // If officer or admin, logic might differ, but for now MVP focuses on citizen view or fetching tailored lists
            // Assuming the goal was mainly citizen history view on dashboard
            // But if role updates were needed:
            if (userRole === 'admin') {
                endpoint = `${API_URL}/admin`;
            } else if (userRole === 'officer') {
                const username = await AsyncStorage.getItem('user_name');
                endpoint = `${API_URL}/officer/${username}`; // assuming 'name' matches department or officer username
            }

            const response = await axios.get(endpoint);
            // Sort by date desc
            const sorted = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setComplaints(sorted);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchComplaints();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchComplaints();
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        setIsLoggedIn(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return theme.colors.success;
            case 'Rejected': return theme.colors.error;
            case 'In Progress': return theme.colors.warning;
            default: return theme.colors.text.light;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
        >
            <Image
                source={item.images && item.images.length > 0
                    ? { uri: `${API_URL}/uploads/${item.images[0]}` }
                    : require('../../assets/adaptive-icon.png')
                }
                style={styles.thumbnail}
            />

            <View style={styles.info}>
                <View style={styles.row}>
                    <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <MapPin size={12} color={theme.colors.text.light} />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                    </View>
                </View>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Clock size={12} color={theme.colors.text.light} />
                        <Text style={styles.metaText}>
                            {new Date(item.date).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>
                        {role === 'admin' ? 'All Complaints' : role === 'officer' ? 'Assigned Tasks' : 'My Activity'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {role === 'citizen' ? 'Track your reports' : 'Manage city issues'}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={complaints}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Image source={require('../../assets/adaptive-icon.png')} style={{ width: 80, height: 80, opacity: 0.5, marginBottom: 16 }} />
                            <Text style={styles.emptyText}>No complaints found.</Text>
                            <Text style={styles.emptySubtext}>
                                {role === 'citizen' ? 'Report an issue to see it here.' : 'No tasks assigned yet.'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Only citizens create complaints usually, or maybe admins too? For now, button triggers Camera for everyone or check role */}
            {role === 'citizen' && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Camera')}
                    activeOpacity={0.8}
                >
                    <Plus color="white" size={32} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.l,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    headerSubtitle: {
        ...theme.typography.small,
        marginTop: 2,
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: theme.colors.error + '10', // 10% opacity
        borderRadius: 50,
    },
    list: {
        padding: theme.spacing.m,
        paddingBottom: 100, // Space for FAB
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
        flexDirection: 'row',
        height: 130, // Fixed height for cleaner look
        ...theme.shadows.small,
    },
    thumbnail: {
        width: 110,
        height: '100%',
        backgroundColor: theme.colors.border,
    },
    info: {
        flex: 1,
        padding: theme.spacing.m,
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: {
        ...theme.typography.h3,
        fontSize: 16,
        color: theme.colors.text.primary,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.round,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    description: {
        ...theme.typography.body,
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginVertical: 4,
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 12,
        flex: 1,
    },
    metaText: {
        ...theme.typography.small,
        flex: 1,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.large,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40
    },
    emptyText: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginTop: 0
    },
    emptySubtext: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginTop: 8,
        textAlign: 'center'
    }
});
