import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ActionButton } from '@/components/common/ActionButton';
import { Colors } from '@/constants/Colors';
import { sendNotification } from '@/services/NotificationSender';
import { NotificationTemplates } from '@/constants/NotificationPayloads';
import { CustomNotificationDialog } from '@/components/dialogs/CustomNotificationDialog';

interface NotificationDemoSectionProps { loggingFunction: (message: string, optionalArg?: unknown) => void; }

export function NotificationDemoSection({ loggingFunction }: NotificationDemoSectionProps) {
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const [customDialogVisible, setCustomDialogVisible] = useState(false);
  const handleSendSimple = async () => {
    setSendingNotification('SIMPLE');
    loggingFunction('Sending Simple notification...');
    try {
      const template = NotificationTemplates.find((t) => t.id === 'GENERAL');
      if (!template) throw new Error('Template not found');
      const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
      await sendNotification(variation);
      loggingFunction('Simple notification sent successfully!');
    } catch (error) { loggingFunction(`Failed to send Simple: ${error instanceof Error ? error.message : 'Unknown error'}`); }
    finally { setSendingNotification(null); }
  };
  const handleSendWithImage = async () => {
    setSendingNotification('WITH_IMAGE');
    loggingFunction('Sending With Image notification...');
    try {
      const template = NotificationTemplates.find((t) => t.id === 'BREAKING_NEWS');
      if (!template) throw new Error('Template not found');
      const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
      await sendNotification(variation);
      loggingFunction('With Image notification sent successfully!');
    } catch (error) { loggingFunction(`Failed to send With Image: ${error instanceof Error ? error.message : 'Unknown error'}`); }
    finally { setSendingNotification(null); }
  };
  const handleSendCustom = async (title: string, body: string) => {
    setSendingNotification('CUSTOM');
    loggingFunction(`Sending Custom notification: ${title}...`);
    try { await sendNotification({ heading: title, content: body }); loggingFunction('Custom notification sent!'); }
    catch (error) { loggingFunction(`Failed to send Custom: ${error instanceof Error ? error.message : 'Unknown error'}`); }
    finally { setSendingNotification(null); }
  };
  const isLoading = sendingNotification !== null;
  return (
    <View style={styles.container}>
      <SectionHeader title="Send Push Notification" tooltipKey="sendPushNotification" />
      <View style={styles.buttonContainer}><ActionButton title="Simple" onPress={handleSendSimple} disabled={isLoading} style={styles.button} />{sendingNotification === 'SIMPLE' && <ActivityIndicator color={Colors.white} style={styles.loadingIndicator} />}</View>
      <View style={styles.buttonContainer}><ActionButton title="With Image" onPress={handleSendWithImage} disabled={isLoading} style={styles.button} />{sendingNotification === 'WITH_IMAGE' && <ActivityIndicator color={Colors.white} style={styles.loadingIndicator} />}</View>
      <View style={styles.buttonContainer}><ActionButton title="Custom" onPress={() => setCustomDialogVisible(true)} disabled={isLoading} style={styles.button} />{sendingNotification === 'CUSTOM' && <ActivityIndicator color={Colors.white} style={styles.loadingIndicator} />}</View>
      <CustomNotificationDialog visible={customDialogVisible} onClose={() => setCustomDialogVisible(false)} onConfirm={handleSendCustom} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 4 },
  buttonContainer: { position: 'relative', marginTop: 8 },
  button: { width: '100%' },
  loadingIndicator: { position: 'absolute', right: 12, top: '50%', marginTop: -10 },
});
