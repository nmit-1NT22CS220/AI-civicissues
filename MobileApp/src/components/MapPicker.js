import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function MapPicker({ onLocationSelect, initialLocation }) {
    const [location, setLocation] = useState(null);
    const [selectedCoordinate, setSelectedCoordinate] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            setSelectedCoordinate({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            fetchAddress(loc.coords.latitude, loc.coords.longitude);
            setLoading(false);
        })();
    }, []);

    const fetchAddress = async (lat, lng) => {
        try {
            let reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (reverseGeocode.length > 0) {
                let addr = reverseGeocode[0];
                let fullAddress = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''} ${addr.postalCode || ''}`;
                setAddress(fullAddress.trim());
                onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address: fullAddress.trim()
                });
            }
        } catch (error) {
            console.log('Error fetching address:', error);
        }
    };

    const handlePress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedCoordinate({ latitude, longitude });
        fetchAddress(latitude, longitude);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={location}
                onPress={handlePress}
            // provider={PROVIDER_GOOGLE} // Use this if properly configured, else default
            >
                {selectedCoordinate && (
                    <Marker coordinate={selectedCoordinate} title="Selected Location" description={address} />
                )}
            </MapView>

            {address ? (
                <View style={styles.addressBox}>
                    <Text style={styles.addressText}>{address}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={styles.myLocationButton}
                onPress={async () => {
                    setLoading(true);
                    let loc = await Location.getCurrentPositionAsync({});
                    setLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    setSelectedCoordinate({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                    fetchAddress(loc.coords.latitude, loc.coords.longitude);
                    setLoading(false);
                }}
            >
                <Ionicons name="locate" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: theme.colors.border,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.l,
    },
    addressBox: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: theme.colors.surface,
        padding: 10,
        borderRadius: theme.borderRadius.s,
        ...theme.shadows.small,
    },
    addressText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
        textAlign: 'center',
    },
    myLocationButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: theme.colors.surface,
        padding: 8,
        borderRadius: 20,
        ...theme.shadows.small,
    }
});
