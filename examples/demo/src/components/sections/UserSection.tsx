import Icon from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { AppColors, AppTextStyles, AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import SingleSelectModal from '../modals/SingleSelectModal';
import SectionCard from '../SectionCard';

const LANGUAGE_OPTIONS: [string, string][] = [
  ['Device Default', ''],
  ['English', 'en'],
  ['Arabic', 'ar'],
  ['Azerbaijani', 'az'],
  ['Bosnian', 'bs'],
  ['Catalan', 'ca'],
  ['Chinese (Simplified)', 'zh-Hans'],
  ['Chinese (Traditional)', 'zh-Hant'],
  ['Croatian', 'hr'],
  ['Czech', 'cs'],
  ['Danish', 'da'],
  ['Dutch', 'nl'],
  ['Estonian', 'et'],
  ['Finnish', 'fi'],
  ['French', 'fr'],
  ['Georgian', 'ka'],
  ['Bulgarian', 'bg'],
  ['German', 'de'],
  ['Greek', 'el'],
  ['Hindi', 'hi'],
  ['Hebrew', 'he'],
  ['Hungarian', 'hu'],
  ['Indonesian', 'id'],
  ['Italian', 'it'],
  ['Japanese', 'ja'],
  ['Korean', 'ko'],
  ['Latvian', 'lv'],
  ['Lithuanian', 'lt'],
  ['Malay', 'ms'],
  ['Norwegian', 'nb'],
  ['Persian', 'fa'],
  ['Polish', 'pl'],
  ['Portuguese', 'pt'],
  ['Punjabi', 'pa'],
  ['Romanian', 'ro'],
  ['Russian', 'ru'],
  ['Serbian', 'sr'],
  ['Slovak', 'sk'],
  ['Spanish', 'es'],
  ['Swedish', 'sv'],
  ['Thai', 'th'],
  ['Turkish', 'tr'],
  ['Ukrainian', 'uk'],
  ['Vietnamese', 'vi'],
];

interface Props {
  externalUserId: string | undefined;
  language: string;
  onLanguageChange: (language: string) => Promise<void>;
  onLogin: (externalUserId: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export default function UserSection({
  externalUserId,
  language,
  onLanguageChange,
  onLogin,
  onLogout,
}: Props) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const isLoggedIn = !!externalUserId;
  const languageName = LANGUAGE_OPTIONS.find(([, code]) => code === language)?.[0] ?? language;

  const handleLogin = async (userId: string) => {
    await onLogin(userId);
  };

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <SectionCard title="User" sectionKey="user">
      <View style={[AppTheme.card, styles.card]}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[styles.value, isLoggedIn && styles.loggedInText]}
            testID="user_status_value"
          >
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>External ID</Text>
          <Text style={styles.value} numberOfLines={1} testID="user_external_id_value">
            {externalUserId ?? '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Language</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setLanguageOpen(true)}
            testID="user_language_dropdown"
          >
            <Text style={styles.dropdownText} testID="user_language_value">
              {languageName}
            </Text>
            <Icon name="arrow-drop-down" size={20} color={AppColors.osGrey600} />
          </TouchableOpacity>
        </View>
      </View>
      <ActionButton
        label={isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
        onPress={() => setLoginOpen(true)}
        testID="login_user_button"
      />
      {isLoggedIn && (
        <ActionButton
          label="LOGOUT USER"
          onPress={handleLogout}
          variant="outlined"
          testID="logout_user_button"
        />
      )}
      <SingleInputModal
        visible={loginOpen}
        title="Login User"
        placeholder="External User Id"
        confirmLabel="Login"
        onConfirm={handleLogin}
        onClose={() => setLoginOpen(false)}
        testID="login_user_id_input"
      />
      <SingleSelectModal
        visible={languageOpen}
        title="Language"
        options={LANGUAGE_OPTIONS}
        selectedValue={language}
        onSelect={(code) => void onLanguageChange(code)}
        onClose={() => setLanguageOpen(false)}
        testID="user_language_picker"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: AppSpacing.gap,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey600,
  },
  value: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey700,
    fontFamily: 'monospace',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey700,
  },
  loggedInText: {
    color: AppColors.osSuccess,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
    marginVertical: 8,
  },
});
