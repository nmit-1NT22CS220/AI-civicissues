import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        // Get the token
        token = (await Notifications.getExpoPushTokenAsync({
            // projectId: '...' // If using EAS, you might need projectId here. For managed workflow dev, it often auto-detects.
        })).data;

        console.log("Expo Push Token:", token);
    } else {
        // alert('Must use physical device for Push Notifications'); 
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function updateUserPushToken(uid, token) {
    if (!token || !uid) return;
    try {
        await axios.post(`${API_URL}/update-push-token`, {
            uid,
            pushToken: token
        });
        console.log("Push token updated on server");
    } catch (error) {
        console.log("Error updating push token:", error);
    }
}
