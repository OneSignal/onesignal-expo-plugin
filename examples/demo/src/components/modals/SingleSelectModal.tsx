import Icon from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

import { AppColors, AppTextStyles, AppDialogStyles } from '../../theme';

interface Props {
  visible: boolean;
  title: string;
  options: [string, string][];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  testID?: string;
}

export default function SingleSelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  testID,
}: Props) {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={AppDialogStyles.backdrop}>
        <View style={[AppDialogStyles.container, styles.containerMaxHeight]}>
          <Text style={AppDialogStyles.title}>{title}</Text>
          <ScrollView style={styles.scroll} testID={testID}>
            {options.map(([label, value]) => {
              const isSelected = value === selectedValue;
              return (
                <TouchableOpacity
                  key={value}
                  style={styles.row}
                  onPress={() => handleSelect(value)}
                  testID={`${testID}_option_${value || 'default'}`}
                >
                  <Icon
                    name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={22}
                    color={isSelected ? AppColors.osPrimary : AppColors.osGrey600}
                  />
                  <Text style={styles.itemLabel}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity style={AppDialogStyles.actionBtn} onPress={onClose}>
              <Text style={AppDialogStyles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerMaxHeight: {
    maxHeight: '70%',
  },
  scroll: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  itemLabel: {
    ...AppTextStyles.bodyLarge,
    color: '#212121',
  },
});
