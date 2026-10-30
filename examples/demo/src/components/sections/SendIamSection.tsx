import React from 'react';
import { StyleSheet, View } from 'react-native';

import { InAppMessageType, iamTypeLabel } from '../../models/InAppMessageType';
import { AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface Props {
  onSendIam: (type: InAppMessageType) => void;
  onInfoTap?: () => void;
}

const IAM_TYPES: InAppMessageType[] = [
  InAppMessageType.TopBanner,
  InAppMessageType.BottomBanner,
  InAppMessageType.CenterModal,
  InAppMessageType.Html,
  InAppMessageType.FullScreen,
  InAppMessageType.FullBleed,
  InAppMessageType.Carousel,
  InAppMessageType.CarouselBleed,
];

export default function SendIamSection({ onSendIam, onInfoTap }: Props) {
  return (
    <SectionCard title="Send In-App Message" onInfoTap={onInfoTap} sectionKey="send_iam">
      <View style={styles.grid}>
        {IAM_TYPES.map((type) => (
          <View key={type} style={styles.cell}>
            <ActionButton
              label={iamTypeLabel[type]}
              onPress={() => onSendIam(type)}
              testID={`send_iam_${type}_button`}
              singleLine
            />
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: AppSpacing.gap,
  },
  cell: {
    flexBasis: '40%',
    flexGrow: 1,
  },
});
