import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';

const fetchMock = vi.fn<typeof fetch>();

async function loadTooltipHelper() {
  vi.resetModules();
  return (await import('./TooltipHelper')).default.getInstance();
}

describe('TooltipHelper initialization', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  test('shares an in-flight initialization promise', async () => {
    let resolveJson!: (value: unknown) => void;
    const json = new Promise<unknown>((resolve) => {
      resolveJson = resolve;
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => json,
    } as Response);
    const helper = await loadTooltipHelper();

    const first = helper.init();
    const second = helper.init();

    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveJson({ test: { title: 'Title', description: 'Description' } });
    await first;
  });

  test('allows retry after a parse failure and stops after successful parsing', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          test: { title: 'Title', description: 'Description' },
        }),
      } as unknown as Response);
    const helper = await loadTooltipHelper();

    await expect(helper.init()).resolves.toBeUndefined();
    await expect(helper.init()).resolves.toBeUndefined();
    await expect(helper.init()).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(helper.getTooltip('test')).toEqual({
      title: 'Title',
      description: 'Description',
    });
  });

  test('allows retry after a non-successful response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);
    const helper = await loadTooltipHelper();

    await helper.init();
    await helper.init();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
