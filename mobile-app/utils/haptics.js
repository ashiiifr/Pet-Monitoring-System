import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const trigger = (type = 'selection') => {
    if (isWeb) return;

    try {
        switch (type) {
            case 'light':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'success':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'warning':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
            case 'error':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
            case 'selection':
            default:
                Haptics.selectionAsync();
                break;
        }
    } catch (error) {
        console.warn('Haptics not supported');
    }
};

export default { trigger };
