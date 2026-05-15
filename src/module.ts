import {
  createBackendModule,
  coreServices,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { AuthentikEntityProvider } from './provider';
import { readAuthentikConfig } from './config';

const defaultSchedule: SchedulerServiceTaskScheduleDefinition = {
  frequency: { minutes: 30 },
  timeout: { minutes: 3 },
  initialDelay: { seconds: 15 },
};

export const catalogModuleAuthentik = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'authentik',
  register({ registerInit }) {
    registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        logger: coreServices.logger,
      },
      async init({ catalog, config, scheduler, logger }) {
        if (!config.getOptionalConfig('catalog.providers.authentik')) {
          logger.warn('catalog.providers.authentik is not configured — skipping Authentik provider. Add it to app-config.yaml to enable user/group sync.');
          return;
        }

        const cfg = readAuthentikConfig(config);
        const provider = new AuthentikEntityProvider(cfg, logger);

        catalog.addEntityProvider(provider);

        await scheduler.scheduleTask({
          id: 'authentik-refresh',
          ...(cfg.schedule ?? defaultSchedule),
          fn: async () => provider.read(),
        });
      },
    });
  },
});
