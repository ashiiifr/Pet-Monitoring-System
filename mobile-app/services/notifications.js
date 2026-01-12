import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure global handler
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
            name: 'Titan Alerts',
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
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Get the token (use 'expo' type for managed flow, usually automatic)
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('[PUSH TOKEN]:', token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function scheduleLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: null, // Immediate
    });
}

export function addNotificationListeners(onReceived, onResponse) {
    const receivedSubscription = Notifications.addNotificationReceivedListener(onReceived);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(onResponse);
    return { receivedSubscription, responseSubscription };
}
