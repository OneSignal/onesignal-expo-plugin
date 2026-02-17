import { OneSignal } from 'react-native-onesignal';
import { NotificationPayload } from '@/constants/NotificationPayloads';
import { APP_ID, ONESIGNAL_API_URL } from '@/constants/Config';
import { Platform } from 'react-native';

interface OneSignalAPIPayload {
  app_id: string;
  include_player_ids: string[];
  headings?: { en: string };
  contents: { en: string };
  small_icon?: string;
  large_icon?: string;
  big_picture?: string;
  buttons?: Array<{ id: string; text: string; icon: string }>;
  android_group?: string;
  android_led_color?: string;
  android_accent_color?: string;
  android_sound?: string;
  ios_badgeType?: string;
  ios_badgeCount?: number;
}

async function getPushSubscriptionId(): Promise<string | null> {
  try {
    const playerId = await OneSignal.User.pushSubscription.getIdAsync();
    if (!playerId) {
      console.warn('[NotificationSender] No push subscription ID found.');
      return null;
    }
    return playerId;
  } catch (error) {
    console.error('[NotificationSender] Error getting push subscription ID:', error);
    return null;
  }
}

async function isUserOptedIn(): Promise<boolean> {
  try {
    return await OneSignal.User.pushSubscription.getOptedInAsync();
  } catch (error) {
    console.error('[NotificationSender] Error checking opt-in status:', error);
    return false;
  }
}

function buildNotificationPayload(
  template: NotificationPayload,
  playerId: string,
): OneSignalAPIPayload {
  const payload: OneSignalAPIPayload = {
    app_id: APP_ID,
    include_player_ids: [playerId],
    contents: { en: template.content },
  };

  if (template.heading) {
    payload.headings = { en: template.heading };
  }
  if (template.largeIcon) {
    payload.large_icon = template.largeIcon;
  }
  if (template.bigPicture) {
    payload.big_picture = template.bigPicture;
  }
  if (template.buttons && template.buttons.length > 0) {
    payload.buttons = template.buttons;
  }

  if (Platform.OS === 'android') {
    payload.small_icon = 'ic_stat_onesignal_default';
    payload.android_group = 'onesignal_demo';
    payload.android_led_color = 'FFE9444E';
    payload.android_accent_color = 'FFE9444E';
    payload.android_sound = 'nil';
  }

  if (Platform.OS === 'ios') {
    payload.ios_badgeType = 'Increase';
    payload.ios_badgeCount = 1;
  }

  return payload;
}

export async function sendNotification(template: NotificationPayload): Promise<void> {
  const optedIn = await isUserOptedIn();
  if (!optedIn) {
    throw new Error('User is not opted in to push notifications.');
  }

  const playerId = await getPushSubscriptionId();
  if (!playerId) {
    throw new Error('No push subscription ID found.');
  }

  const payload = buildNotificationPayload(template, playerId);

  const response = await fetch(ONESIGNAL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OneSignal API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('[NotificationSender] Notification sent:', result);
}
