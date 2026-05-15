import { ConfigReader } from '@backstage/config';
import { JsonObject } from '@backstage/types';
import { readAuthentikConfig } from './config';

describe('readAuthentikConfig', () => {
  const baseConfig: JsonObject = {
    baseUrl: 'https://authentik.example.com/',
    token: 'secret-token',
  };

  function configFrom(authentik: JsonObject) {
    return new ConfigReader({
      catalog: { providers: { authentik } },
    });
  }

  it('strips trailing slashes from baseUrl', () => {
    const cfg = readAuthentikConfig(configFrom(baseConfig));
    expect(cfg.baseUrl).toBe('https://authentik.example.com');
  });

  it('defaults excludeGroups to an empty array when absent', () => {
    const cfg = readAuthentikConfig(configFrom(baseConfig));
    expect(cfg.excludeGroups).toEqual([]);
  });

  it('reads excludeGroups when provided', () => {
    const cfg = readAuthentikConfig(
      configFrom({ ...baseConfig, excludeGroups: ['authentik-internal'] }),
    );
    expect(cfg.excludeGroups).toEqual(['authentik-internal']);
  });

  it('throws when token is missing', () => {
    expect(() =>
      readAuthentikConfig(configFrom({ baseUrl: baseConfig.baseUrl })),
    ).toThrow();
  });

  it('returns undefined schedule when none is configured', () => {
    const cfg = readAuthentikConfig(configFrom(baseConfig));
    expect(cfg.schedule).toBeUndefined();
  });

  it('reads a custom schedule from config', () => {
    const cfg = readAuthentikConfig(
      configFrom({
        ...baseConfig,
        schedule: {
          frequency: { minutes: 60 },
          timeout: { minutes: 5 },
        },
      }),
    );
    expect(cfg.schedule).toBeDefined();
    expect(cfg.schedule!.frequency).toEqual({ minutes: 60 });
  });
});
