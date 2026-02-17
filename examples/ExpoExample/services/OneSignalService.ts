import { APP_ID } from '@/constants/Config';
import { UserData, KeyValuePair } from '@/types';

const ONESIGNAL_API_BASE = 'https://api.onesignal.com';

interface ApiIdentity {
  [key: string]: string;
}

interface ApiSubscription {
  type: string;
  token?: string;
}

interface ApiUserResponse {
  identity?: ApiIdentity;
  properties?: {
    tags?: { [key: string]: string };
  };
  subscriptions?: ApiSubscription[];
}

export async function fetchUserData(onesignalId: string): Promise<UserData> {
  const url = `${ONESIGNAL_API_BASE}/apps/${APP_ID}/users/by/onesignal_id/${onesignalId}`;

  console.log('[OneSignalService] Fetching user data:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OneSignalService] API error:', response.status, errorText);
    throw new Error(`Failed to fetch user data: ${response.status}`);
  }

  const data: ApiUserResponse = await response.json();
  return parseUserData(data);
}

function parseUserData(data: ApiUserResponse): UserData {
  const aliases: KeyValuePair[] = [];
  if (data.identity) {
    for (const [key, value] of Object.entries(data.identity)) {
      if (key !== 'external_id' && key !== 'onesignal_id') {
        aliases.push({ key, value });
      }
    }
  }

  const tags: KeyValuePair[] = [];
  if (data.properties?.tags) {
    for (const [key, value] of Object.entries(data.properties.tags)) {
      tags.push({ key, value });
    }
  }

  const emails: string[] = [];
  const smsNumbers: string[] = [];
  if (data.subscriptions) {
    for (const sub of data.subscriptions) {
      if (sub.type === 'Email' && sub.token) {
        emails.push(sub.token);
      } else if (sub.type === 'SMS' && sub.token) {
        smsNumbers.push(sub.token);
      }
    }
  }

  const externalId = data.identity?.external_id ?? null;

  return { aliases, tags, emails, smsNumbers, externalId };
}
