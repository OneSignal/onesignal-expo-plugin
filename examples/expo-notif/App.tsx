import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LogLevel, OneSignal, type NotificationWillDisplayEvent } from 'react-native-onesignal';

const ONESIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID?.trim() || 'YOUR-ONESIGNAL-APP-ID';
const TEST_EXTERNAL_ID = 'expo-notif-compat-test';
const LOCAL_NOTIFICATION_DATA = {
  route: 'chat/123',
  source: 'expo-local',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type EventLog = {
  id: number;
  at: string;
  source: string;
  title: string;
  detail?: string;
};

const isPlaceholder = (value: string) => value.toLowerCase().startsWith('your-');

const summarizeData = (data: unknown) => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  return JSON.stringify(data);
};

export default function App() {
  const [expoPermission, setExpoPermission] = useState<string>('unknown');
  const [oneSignalPermission, setOneSignalPermission] = useState<boolean | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSchedulingLocal, setIsSchedulingLocal] = useState(false);
  const [isSendingOneSignal, setIsSendingOneSignal] = useState(false);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const logId = useRef(0);

  const appendLog = useCallback((source: string, title: string, detail?: string) => {
    const event: EventLog = {
      id: ++logId.current,
      at: new Date().toLocaleTimeString(),
      source,
      title,
      detail,
    };

    console.log(`[${source}] ${title}`, detail ?? '');
    setLogs((current) => [event, ...current].slice(0, 20));
  }, []);

  const refreshState = useCallback(() => {
    void Notifications.getPermissionsAsync()
      .then((permission) => setExpoPermission(permission.status))
      .catch((error) => {
        setExpoPermission('error');
        appendLog('Expo', 'Permission read failed', String(error));
      });

    if (!isPlaceholder(ONESIGNAL_APP_ID)) {
      void OneSignal.Notifications.getPermissionAsync()
        .then(setOneSignalPermission)
        .catch((error) => {
          setOneSignalPermission(null);
          appendLog('OneSignal', 'Permission read failed', String(error));
        });

      void OneSignal.User.pushSubscription
        .getIdAsync()
        .then((id) => setPushSubscriptionId(id ?? null))
        .catch((error) => {
          setPushSubscriptionId(null);
          appendLog('OneSignal', 'Push ID read failed', String(error));
        });
    }
  }, [appendLog]);

  useEffect(() => {
    appendLog('App', 'Registering Expo and OneSignal notification listeners');

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      appendLog(
        'Expo received',
        notification.request.content.title ?? 'Notification received',
        summarizeData(notification.request.content.data),
      );
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        appendLog(
          'Expo response',
          response.notification.request.content.title ?? 'Notification tapped',
          summarizeData(response.notification.request.content.data),
        );
      },
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        appendLog(
          'Expo last response',
          response.notification.request.content.title ?? 'Last notification response',
          summarizeData(response.notification.request.content.data),
        );
      }
    });

    if (isPlaceholder(ONESIGNAL_APP_ID)) {
      appendLog('OneSignal', 'Set EXPO_PUBLIC_ONESIGNAL_APP_ID before testing OneSignal callbacks');
      refreshState();

      return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    }

    const handlePushSubscriptionChange = (event: { current: { id?: string } }) => {
      setPushSubscriptionId(event.current.id ?? null);
      appendLog('OneSignal', 'Push subscription changed', event.current.id ?? 'No push ID');
    };

    const handleOneSignalClick = (event: {
      notification?: { title?: string; additionalData?: unknown };
    }) => {
      appendLog(
        'OneSignal click',
        event.notification?.title ?? 'OneSignal notification tapped',
        summarizeData(event.notification?.additionalData),
      );
    };

    const handleOneSignalPermissionChange = (granted: boolean) => {
      setOneSignalPermission(granted);
      appendLog('OneSignal', `Permission ${granted ? 'granted' : 'not granted'}`);
    };

    const handleOneSignalForegroundWillDisplay = (event: NotificationWillDisplayEvent) => {
      const notification = event.getNotification();
      appendLog(
        'OneSignal foreground',
        notification.title ?? 'OneSignal notification received',
        summarizeData(notification.additionalData),
      );
      notification.display();
    };

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.login(TEST_EXTERNAL_ID);
    OneSignal.User.pushSubscription.addEventListener('change', handlePushSubscriptionChange);
    OneSignal.Notifications.addEventListener('click', handleOneSignalClick);
    OneSignal.Notifications.addEventListener('permissionChange', handleOneSignalPermissionChange);
    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      handleOneSignalForegroundWillDisplay,
    );
    refreshState();

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      OneSignal.User.pushSubscription.removeEventListener('change', handlePushSubscriptionChange);
      OneSignal.Notifications.removeEventListener('click', handleOneSignalClick);
      OneSignal.Notifications.removeEventListener(
        'permissionChange',
        handleOneSignalPermissionChange,
      );
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        handleOneSignalForegroundWillDisplay,
      );
    };
  }, [appendLog, refreshState]);

  const requestPermissions = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const expoStatus = await Notifications.requestPermissionsAsync();
      setExpoPermission(expoStatus.status);

      if (!isPlaceholder(ONESIGNAL_APP_ID)) {
        const oneSignalGranted = await OneSignal.Notifications.requestPermission(false);
        setOneSignalPermission(oneSignalGranted);
      }

      refreshState();
      appendLog('App', 'Permission request complete');
    } catch (error) {
      Alert.alert('Permission request failed', String(error));
      appendLog('App', 'Permission request failed', String(error));
    } finally {
      setIsRequestingPermission(false);
    }
  }, [appendLog, refreshState]);

  const scheduleLocalNotification = useCallback(async () => {
    setIsSchedulingLocal(true);
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Expo local notification',
          body: 'Tap this to test addNotificationResponseReceivedListener.',
          data: LOCAL_NOTIFICATION_DATA,
        },
        trigger: {
          seconds: 2,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      appendLog('Expo scheduled', 'Local notification scheduled', id);
    } catch (error) {
      Alert.alert('Schedule failed', String(error));
      appendLog('Expo scheduled', 'Local notification failed', String(error));
    } finally {
      setIsSchedulingLocal(false);
    }
  }, [appendLog]);

  const sendOneSignalNotification = useCallback(async () => {
    if (isPlaceholder(ONESIGNAL_APP_ID)) {
      Alert.alert(
        'Configure OneSignal',
        'Set EXPO_PUBLIC_ONESIGNAL_APP_ID in .env before sending a OneSignal push.',
      );
      return;
    }

    if (!pushSubscriptionId) {
      Alert.alert('No push subscription', 'Request permission, then wait for a OneSignal push ID.');
      return;
    }

    setIsSendingOneSignal(true);
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.onesignal.v1+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_subscription_ids: [pushSubscriptionId],
          headings: { en: 'OneSignal notification' },
          contents: { en: 'Tap this to compare Expo and OneSignal response listeners.' },
          data: {
            route: 'chat/123',
            source: 'onesignal-api',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      appendLog('OneSignal sent', 'Remote notification requested', pushSubscriptionId);
    } catch (error) {
      Alert.alert('Send failed', String(error));
      appendLog('OneSignal sent', 'Remote notification failed', String(error));
    } finally {
      setIsSendingOneSignal(false);
    }
  }, [appendLog, pushSubscriptionId]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>OneSignal + expo-notifications</Text>
        <Text style={styles.description}>
          Expo handles local notifications while OneSignal handles remote push notifications. Both
          libraries report notification interactions below.
        </Text>

        <View style={styles.card}>
          <StatusRow label="Platform" value={Platform.OS} />
          <StatusRow label="Expo permission" value={expoPermission} />
          <StatusRow
            label="OneSignal permission"
            value={
              oneSignalPermission == null ? 'unknown' : oneSignalPermission ? 'granted' : 'denied'
            }
          />
          <StatusRow label="OneSignal app ID" value={ONESIGNAL_APP_ID} />
          <StatusRow label="OneSignal push ID" value={pushSubscriptionId ?? 'waiting'} />
        </View>

        <ActionButton
          busy={isRequestingPermission}
          label="Request Permissions"
          onPress={requestPermissions}
        />
        <ActionButton
          busy={isSchedulingLocal}
          label="Schedule Expo Local Notification"
          onPress={scheduleLocalNotification}
        />
        <ActionButton
          busy={isSendingOneSignal}
          label="Send OneSignal Push"
          onPress={sendOneSignalNotification}
        />

        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Event Log</Text>
          <Pressable onPress={() => setLogs([])} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        </View>

        {logs.length === 0 ? (
          <Text style={styles.empty}>No events yet.</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logSource}>
                {log.at} · {log.source}
              </Text>
              <Text style={styles.logTitle}>{log.title}</Text>
              {log.detail ? <Text style={styles.logDetail}>{log.detail}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  busy,
  label,
  onPress,
}: {
  busy: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, busy && styles.busy]}
      onPress={onPress}
      disabled={busy}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#212121',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#616161',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  statusRow: {
    alignItems: 'center',
    borderBottomColor: '#ECEFF1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    color: '#757575',
    fontSize: 13,
    marginRight: 12,
  },
  statusValue: {
    color: '#424242',
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'right',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#E54B4D',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  busy: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  sectionTitle: {
    color: '#616161',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  clear: {
    color: '#E54B4D',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    color: '#9E9E9E',
    fontSize: 14,
    marginTop: 12,
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 10,
    padding: 12,
  },
  logSource: {
    color: '#757575',
    fontSize: 11,
    marginBottom: 4,
  },
  logTitle: {
    color: '#212121',
    fontSize: 15,
    fontWeight: '600',
  },
  logDetail: {
    color: '#616161',
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 6,
  },
});
