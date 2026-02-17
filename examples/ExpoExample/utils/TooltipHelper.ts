import { Alert } from 'react-native';
import { TooltipContent, TooltipData } from '@/constants/TooltipContent';

export function showTooltip(key: string): void {
  const tooltip = TooltipContent[key];
  if (!tooltip) {
    console.warn(`Tooltip not found for key: ${key}`);
    return;
  }

  let message = tooltip.description;

  if (tooltip.options && tooltip.options.length > 0) {
    message += '\n\n';
    tooltip.options.forEach((option, index) => {
      message += `${option.name}: ${option.description}`;
      if (index < tooltip.options!.length - 1) {
        message += '\n\n';
      }
    });
  }

  Alert.alert(tooltip.title, message, [{ text: 'OK' }]);
}

export function getTooltip(key: string): TooltipData | undefined {
  return TooltipContent[key];
}
