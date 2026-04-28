import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export enum InAppMessageType {
  TopBanner = 'top_banner',
  BottomBanner = 'bottom_banner',
  CenterModal = 'center_modal',
  FullScreen = 'full_screen',
}

export const iamTypeLabel: Record<InAppMessageType, string> = {
  [InAppMessageType.TopBanner]: 'TOP BANNER',
  [InAppMessageType.BottomBanner]: 'BOTTOM BANNER',
  [InAppMessageType.CenterModal]: 'CENTER MODAL',
  [InAppMessageType.FullScreen]: 'FULL SCREEN',
};

export const iamTypeIcon: Record<InAppMessageType, MaterialCommunityIconName> = {
  [InAppMessageType.TopBanner]: 'format-vertical-align-top',
  [InAppMessageType.BottomBanner]: 'format-vertical-align-bottom',
  [InAppMessageType.CenterModal]: 'crop-square',
  [InAppMessageType.FullScreen]: 'fullscreen',
};
