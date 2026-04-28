const E2E_MODE = process.env.EXPO_PUBLIC_E2E_MODE;
const MASK_CHAR = '•';

export function maskValue(value: string): string {
  if (E2E_MODE === 'true') {
    return MASK_CHAR.repeat(value.length);
  }
  return value;
}
