import { Config } from '@backstage/config';
import {
  SchedulerServiceTaskScheduleDefinition,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';

export interface AuthentikProviderConfig {
  baseUrl: string;
  token: string;
  excludeGroups: string[];
  schedule?: SchedulerServiceTaskScheduleDefinition;
}

export function readAuthentikConfig(config: Config): AuthentikProviderConfig {
  const c = config.getConfig('catalog.providers.authentik');
  const scheduleConfig = c.getOptionalConfig('schedule');
  return {
    baseUrl: c.getString('baseUrl').replace(/\/$/, ''),
    token: c.getString('token'),
    excludeGroups: c.getOptionalStringArray('excludeGroups') ?? [],
    schedule: scheduleConfig
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(scheduleConfig)
      : undefined,
  };
}
