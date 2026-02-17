import React from 'react';
import { StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ToggleRow } from '@/components/common/ToggleRow';
import { ActionButton } from '@/components/common/ActionButton';
import { useAppState } from '@/context/AppStateContext';

interface LocationSectionProps { loggingFunction: (message: string, optionalArg?: unknown) => void; }

export function LocationSection({ loggingFunction }: LocationSectionProps) {
  const { state, dispatch } = useAppState();
  const handleToggleLocation = (shared: boolean) => {
    loggingFunction(shared ? 'Sharing location' : 'Unsharing location');
    OneSignal.Location.setShared(shared);
    dispatch({ type: 'SET_LOCATION_SHARED', payload: shared });
  };
  return (
    <Card>
      <SectionHeader title="Location" tooltipKey="location" />
      <ToggleRow label="Location Shared" description="Share device location with OneSignal" value={state.locationShared} onValueChange={handleToggleLocation} />
      <ActionButton title="Prompt Location" onPress={() => { loggingFunction('Request Location permission'); OneSignal.Location.requestPermission(); }} style={styles.button} />
    </Card>
  );
}
const styles = StyleSheet.create({ button: { marginTop: 8 } });
