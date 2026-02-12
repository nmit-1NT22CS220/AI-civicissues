import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function CameraScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const cameraRef = useRef(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    async function takePicture() {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    skipProcessing: true
                });
                navigation.navigate('Preview', { photo });
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        }
    }

    function toggleCamera() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
            >
                <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
                        <RefreshCw color="white" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.innerCaptureButton} />
                    </TouchableOpacity>

                    <View style={styles.spacer} />
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
        ...theme.typography.body,
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    controlButton: {
        padding: 15,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    innerCaptureButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: 'white',
    },
    spacer: {
        width: 50,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 15,
        borderRadius: theme.borderRadius.m,
        marginTop: 20
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        ...theme.typography.button,
    }
});
