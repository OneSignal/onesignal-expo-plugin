import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ActionButton } from '@/components/common/ActionButton';
import { TrackEventDialog } from '@/components/dialogs/TrackEventDialog';

interface TrackEventSectionProps { loggingFunction: (message: string, optionalArg?: unknown) => void; }

export function TrackEventSection({ loggingFunction }: TrackEventSectionProps) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const handleTrackEvent = (name: string, properties?: Record<string, unknown>) => {
    if (properties) loggingFunction(`Tracking event ${name} with properties: `, properties);
    else loggingFunction('Tracking event: ', name);
    try { (OneSignal.User as any).trackEvent(name, properties || null); }
    catch { loggingFunction('trackEvent not available, using addTag fallback'); OneSignal.User.addTag(`event_${name}`, properties ? JSON.stringify(properties) : 'triggered'); }
  };
  return (
    <View style={styles.container}>
      <SectionHeader title="Track Event" tooltipKey="trackEvent" />
      <ActionButton title="Track Event" onPress={() => setDialogVisible(true)} />
      <TrackEventDialog visible={dialogVisible} onClose={() => setDialogVisible(false)} onConfirm={handleTrackEvent} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { paddingHorizontal: 16, paddingVertical: 4 } });
