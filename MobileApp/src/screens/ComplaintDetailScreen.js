import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Calendar, User, Clock, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function ComplaintDetailScreen({ route, navigation }) {
    const { complaint: initialComplaint } = route.params;
    const [complaint, setComplaint] = useState(initialComplaint);
    const insets = useSafeAreaInsets();

    const [role, setRole] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState(null); // 'status' or 'assign'
    const [comment, setComment] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(complaint.status);
    const [officerName, setOfficerName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadRole();
    }, []);

    const loadRole = async () => {
        const storedRole = await AsyncStorage.getItem('user_role');
        setRole(storedRole);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return theme.colors.success;
            case 'Rejected': return theme.colors.error;
            case 'In Progress': return theme.colors.warning;
            default: return theme.colors.text.light;
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const endpoint = `${API_URL}/complaints/${complaint._id}`;
            const user_name = await AsyncStorage.getItem('user_name');

            let payload = {};

            if (actionType === 'status') {
                payload = {
                    status: selectedStatus,
                    comments: comment,
                    updatedBy: user_name || role
                };
            } else if (actionType === 'assign') {
                if (!officerName) {
                    Alert.alert("Error", "Please enter an officer name");
                    setIsUpdating(false);
                    return;
                }
                payload = {
                    departmentOfficer: officerName,
                    status: "In Progress", // Auto set to in progress when assigned
                    comments: `Assigned to ${officerName}`,
                    updatedBy: user_name || role
                };
            }

            const response = await axios.put(endpoint, payload);

            if (response.status === 200) {
                setComplaint(response.data.updated);
                Alert.alert("Success", "Complaint updated successfully");
                setModalVisible(false);
            }
        } catch (error) {
            console.error("Update failed", error);
            Alert.alert("Error", "Failed to update complaint");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Complaint Details</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Images Carousel */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    {complaint.images && complaint.images.map((img, index) => (
                        <Image
                            key={index}
                            source={{ uri: `${API_URL}/uploads/${img}` }}
                            style={styles.detailImage}
                        />
                    ))}
                    {(!complaint.images || complaint.images.length === 0) && (
                        <View style={[styles.detailImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.border }]}>
                            <Text style={{ color: theme.colors.text.light }}>No Images</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.category}>{complaint.category}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) + '20' }]}>
                            <Text style={[styles.status, { color: getStatusColor(complaint.status) }]}>
                                {complaint.status}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.description}>{complaint.description}</Text>

                    <View style={styles.section}>
                        <View style={styles.row}>
                            <MapPin size={18} color={theme.colors.text.secondary} />
                            <Text style={styles.label}>{complaint.location}</Text>
                        </View>
                        {complaint.latitude && complaint.longitude && (
                            <TouchableOpacity
                                onPress={() => {
                                    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                                    const latLng = `${complaint.latitude},${complaint.longitude}`;
                                    const label = 'Complaint Location';
                                    const url = Platform.select({
                                        ios: `${scheme}${label}@${latLng}`,
                                        android: `${scheme}${latLng}(${label})`
                                    });
                                    // Fallback to web link if scheme fails, but usually Linking.openURL(url) is enough
                                    // Simple google maps link is safer cross-platform sometimes:
                                    const webUrl = `https://www.google.com/maps/search/?api=1&query=${complaint.latitude},${complaint.longitude}`;
                                    Linking.openURL(webUrl);
                                }}
                                style={{ marginLeft: 30, marginBottom: 8 }}
                            >
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>📍 View on Map</Text>
                            </TouchableOpacity>
                        )}
                        <View style={styles.row}>
                            <Calendar size={18} color={theme.colors.text.secondary} />
                            <Text style={styles.label}>{new Date(complaint.date).toLocaleString()}</Text>
                        </View>
                        <View style={styles.row}>
                            <User size={18} color={theme.colors.text.secondary} />
                            <Text style={styles.label}>ID: {complaint._id.slice(-6).toUpperCase()}</Text>
                        </View>
                        {complaint.departmentOfficer && (
                            <View style={styles.row}>
                                <User size={18} color={theme.colors.primary} />
                                <Text style={[styles.label, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                                    Assigned to: {complaint.departmentOfficer}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons for Roles */}
                    {role === 'officer' && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                setActionType('status');
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.actionButtonText}>Update Status</Text>
                        </TouchableOpacity>
                    )}

                    {role === 'admin' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                            onPress={() => {
                                setActionType('assign');
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.actionButtonText}>Assign Officer</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sectionTitle}>Status Timeline</Text>
                    <View style={styles.timeline}>
                        {(!complaint.statusHistory || complaint.statusHistory.length === 0) && (
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineDot} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineStatus}>{complaint.status}</Text>
                                    <Text style={styles.timelineDate}>{new Date(complaint.date).toLocaleString()}</Text>
                                    <Text style={styles.timelineRemark}>Initial Submission</Text>
                                </View>
                            </View>
                        )}

                        {complaint.statusHistory && complaint.statusHistory.map((history, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={[styles.timelineDot, { backgroundColor: index === complaint.statusHistory.length - 1 ? theme.colors.primary : theme.colors.border }]} />
                                {index !== complaint.statusHistory.length - 1 && <View style={styles.timelineLine} />}

                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineStatus}>{history.status}</Text>
                                    <Text style={styles.timelineDate}>{new Date(history.timestamp).toLocaleString()}</Text>
                                    <Text style={styles.timelineRemark}>{history.remark}</Text>
                                    <Text style={styles.timelineAuthor}>Updated by: {history.updatedBy}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Modal for Actions */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {actionType === 'status' ? 'Update Status' : 'Assign Complaint'}
                        </Text>

                        {actionType === 'status' && (
                            <View>
                                <Text style={styles.inputLabel}>Select Status:</Text>
                                <View style={styles.statusOptions}>
                                    {['In Progress', 'Resolved', 'Rejected'].map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            style={[styles.statusOption, selectedStatus === s && styles.statusOptionSelected]}
                                            onPress={() => setSelectedStatus(s)}
                                        >
                                            <Text style={[styles.statusOptionText, selectedStatus === s && styles.statusOptionTextSelected]}>
                                                {s}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {actionType === 'assign' && (
                            <View>
                                <Text style={styles.inputLabel}>Officer Name / Department:</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={officerName}
                                    onChangeText={setOfficerName}
                                    placeholder="Enter officer name"
                                    placeholderTextColor={theme.colors.text.light}
                                />
                            </View>
                        )}

                        <Text style={styles.inputLabel}>Comments:</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 80 }]}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Add remarks..."
                            placeholderTextColor={theme.colors.text.light}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmBtn]}
                                onPress={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Confirm</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'center',
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        marginRight: theme.spacing.m,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
    },
    imageScroll: {
        height: 250,
        backgroundColor: theme.colors.border,
    },
    detailImage: {
        width: 350,
        height: 250,
        resizeMode: 'cover',
        marginRight: 4,
    },
    content: {
        padding: theme.spacing.l,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    category: {
        ...theme.typography.h2,
        fontSize: 24,
        color: theme.colors.text.primary,
        flex: 1
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.round,
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    description: {
        ...theme.typography.body,
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.l,
    },
    section: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        gap: 12,
        marginBottom: theme.spacing.xl,
        ...theme.shadows.small,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        ...theme.typography.body,
        fontSize: 14,
        color: theme.colors.text.secondary,
        flex: 1,
    },
    sectionTitle: {
        ...theme.typography.h3,
        marginBottom: theme.spacing.m,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: theme.spacing.l,
        position: 'relative',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.border,
        marginTop: 6,
        marginRight: 16,
        zIndex: 1,
    },
    timelineLine: {
        position: 'absolute',
        left: 5,
        top: 18,
        bottom: -30,
        width: 2,
        backgroundColor: theme.colors.border,
        zIndex: 0,
    },
    timelineContent: {
        flex: 1,
    },
    timelineStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    timelineDate: {
        fontSize: 12,
        color: theme.colors.text.light,
        marginBottom: 4,
    },
    timelineRemark: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
    },
    timelineAuthor: {
        fontSize: 12,
        color: theme.colors.text.light,
        marginTop: 4,
    },
    actionButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        marginBottom: theme.spacing.l,
        ...theme.shadows.medium,
    },
    actionButtonText: {
        color: theme.colors.text.inverse,
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: 24,
        gap: 16,
        ...theme.shadows.large,
    },
    modalTitle: {
        ...theme.typography.h3,
        marginBottom: 8
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8
    },
    modalInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        color: theme.colors.text.primary,
    },
    statusOptions: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap'
    },
    statusOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    statusOptionSelected: {
        backgroundColor: theme.colors.primary + '10', // Light primary
        borderColor: theme.colors.primary
    },
    statusOptionText: {
        fontSize: 14,
        color: theme.colors.text.secondary
    },
    statusOptionTextSelected: {
        color: theme.colors.primary,
        fontWeight: 'bold'
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16
    },
    modalBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center'
    },
    cancelBtn: {
        backgroundColor: theme.colors.background
    },
    confirmBtn: {
        backgroundColor: theme.colors.primary
    },
    cancelBtnText: {
        color: theme.colors.text.secondary,
        fontWeight: '600'
    },
    confirmBtnText: {
        color: theme.colors.text.inverse,
        fontWeight: 'bold'
    }
});
