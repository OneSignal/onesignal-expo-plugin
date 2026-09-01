import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { NotificationType } from '../models/NotificationType';
import OneSignalApiService from './OneSignalApiService';

const fetchMock = vi.fn<typeof fetch>();

function successResponse(data: unknown): Response {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('OneSignalApiService notification responses', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    OneSignalApiService.getInstance().setAppId('app-id');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  test.each([
    ['null', null],
    ['a primitive', 'notification-id'],
    ['an array', [{ id: 'notification-id' }]],
  ])('rejects %s without retrying', async (_label, data) => {
    fetchMock.mockResolvedValue(successResponse(data));

    await expect(
      OneSignalApiService.getInstance().sendNotification(
        NotificationType.Simple,
        'subscription-id',
      ),
    ).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('rejects malformed JSON without retrying', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
    } as unknown as Response);

    await expect(
      OneSignalApiService.getInstance().sendNotification(
        NotificationType.Simple,
        'subscription-id',
      ),
    ).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('accepts a valid object response', async () => {
    fetchMock.mockResolvedValue(successResponse({ id: 'notification-id', recipients: 1 }));

    await expect(
      OneSignalApiService.getInstance().sendNotification(
        NotificationType.Simple,
        'subscription-id',
      ),
    ).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('retries a recognized transient subscription-indexing failure', async () => {
    fetchMock.mockResolvedValue(
      successResponse({
        id: '',
        errors: ['All included players are not subscribed'],
      }),
    );
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((callback) => {
      if (typeof callback === 'function') callback();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });

    await expect(
      OneSignalApiService.getInstance().sendNotification(
        NotificationType.Simple,
        'subscription-id',
      ),
    ).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
