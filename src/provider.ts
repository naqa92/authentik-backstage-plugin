import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { AuthentikProviderConfig } from './config';
import { readUsers, readGroups } from './read';
import { parseUser, parseGroup, sanitizeName } from './transform';

const SERVICE_ACCOUNT_TYPES: ReadonlySet<string> = new Set([
  'service_account',
  'internal_service_account',
]);

export class AuthentikEntityProvider implements EntityProvider {
  private connection?: EntityProviderConnection;

  constructor(
    private readonly config: AuthentikProviderConfig,
    private readonly logger: LoggerService,
  ) {}

  getProviderName(): string {
    return 'AuthentikEntityProvider';
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async read(): Promise<void> {
    if (!this.connection) {
      this.logger.info('AuthentikEntityProvider not yet connected, skipping read');
      return;
    }

    const { baseUrl, token } = this.config;

    try {
      this.logger.info('Reading Authentik users and groups');

      const [users, groups] = await Promise.all([
        readUsers(baseUrl, token),
        readGroups(baseUrl, token),
      ]);

      const pkToSanitizedName = new Map(
        groups.map(g => [g.pk, sanitizeName(g.name)]),
      );

      const { excludeGroups } = this.config;
      const filteredGroups = excludeGroups.length
        ? groups.filter(g => !excludeGroups.includes(sanitizeName(g.name)))
        : groups;

      const validGroupNames = new Set(
        filteredGroups.map(g => sanitizeName(g.name)),
      );

      const { includeServiceAccounts } = this.config;
      const userEntities = users
        .filter(
          u =>
            u.is_active &&
            (includeServiceAccounts || !SERVICE_ACCOUNT_TYPES.has(u.type)),
        )
        .map(u => parseUser(u, baseUrl, validGroupNames));

      const groupEntities = filteredGroups.map(g => {
        const children = groups
          .filter(child => child.parent === g.pk)
          .map(child => pkToSanitizedName.get(child.pk)!);
        return parseGroup(g, baseUrl, children);
      });

      await this.connection.applyMutation({
        type: 'full',
        entities: [...userEntities, ...groupEntities].map(entity => ({
          entity,
          locationKey: this.getProviderName(),
        })),
      });

      this.logger.info(
        `Committed ${userEntities.length} users and ${groupEntities.length} groups`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to read from Authentik, skipping mutation to preserve existing entities',
        error as Error,
      );
    }
  }
}
