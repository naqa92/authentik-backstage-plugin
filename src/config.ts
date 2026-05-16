import { Config } from '@backstage/config';
import {
  SchedulerServiceTaskScheduleDefinition,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';

export interface AuthentikProviderConfig {
  baseUrl: string;
  token: string;
  excludeGroups: string[];
  includeServiceAccounts: boolean;
  schedule?: SchedulerServiceTaskScheduleDefinition;
}

export function readAuthentikConfig(config: Config): AuthentikProviderConfig {
  const c = config.getConfig('catalog.providers.authentik');
  const scheduleConfig = c.getOptionalConfig('schedule');
  return {
    baseUrl: c.getString('baseUrl').replace(/\/$/, ''),
    token: c.getString('token'),
    excludeGroups: c.getOptionalStringArray('excludeGroups') ?? [],
    includeServiceAccounts:
      c.getOptionalBoolean('includeServiceAccounts') ?? false,
    schedule: scheduleConfig
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(scheduleConfig)
      : undefined,
  };
}
