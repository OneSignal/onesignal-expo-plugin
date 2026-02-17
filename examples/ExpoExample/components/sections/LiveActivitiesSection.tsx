import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ActionButton } from '@/components/common/ActionButton';

interface LiveActivitiesSectionProps { loggingFunction: (message: string, optionalArg?: unknown) => void; inputValue: string; }

export function LiveActivitiesSection({ loggingFunction, inputValue }: LiveActivitiesSectionProps) {
  if (Platform.OS !== 'ios') return null;
  const handleStartDefault = async () => {
    loggingFunction('Starting live activity');
    await OneSignal.LiveActivities.startDefault(inputValue, { title: 'Welcome!' }, { message: { en: 'Hello World!' }, intValue: 3, doubleValue: 3.14, boolValue: true });
    loggingFunction('Live Activity started');
  };
  return (
    <Card>
      <SectionHeader title="Live Activities (iOS)" tooltipKey="liveActivities" />
      <ActionButton title="Start Default" onPress={handleStartDefault} style={styles.button} />
      <ActionButton title="Enter Activity" onPress={async () => { loggingFunction('Entering live activity'); await OneSignal.LiveActivities.enter(inputValue, 'FAKE_TOKEN'); }} style={styles.button} />
      <ActionButton title="Exit Activity" onPress={async () => { loggingFunction('Exiting live activity'); await OneSignal.LiveActivities.exit(inputValue); }} style={styles.button} />
    </Card>
  );
}
const styles = StyleSheet.create({ button: { marginTop: 8 } });
