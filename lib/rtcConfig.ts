export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

const turnUrls = (process.env.EXPO_PUBLIC_TURN_URLS || process.env.EXPO_PUBLIC_TURN_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const turnUsername = (process.env.EXPO_PUBLIC_TURN_USERNAME || '').trim();
const turnCredential = (process.env.EXPO_PUBLIC_TURN_CREDENTIAL || '').trim();

/**
 * Public STUN handles easy networks. TURN is required for reliable operation
 * across carrier NAT, restrictive Wi-Fi, and different internet providers.
 */
export const RTC_ICE_SERVERS: IceServerConfig[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ...(turnUrls.length && turnUsername && turnCredential
    ? [{ urls: turnUrls, username: turnUsername, credential: turnCredential }]
    : []),
];

export const isTurnConfigured = turnUrls.length > 0 && !!turnUsername && !!turnCredential;

export function assertProductionTurnConfigured(): void {
  if (!isTurnConfigured) {
    throw new Error('برای تماس اینترنتی پایدار، اطلاعات سرور TURN هنوز تنظیم نشده است.');
  }
}
