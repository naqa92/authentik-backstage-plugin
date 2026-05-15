import { UserEntity, GroupEntity } from '@backstage/catalog-model';
import { AuthentikUser, AuthentikGroup } from './types';

export function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\-_.]/g, '-');
}

function withLocations(
  baseUrl: string,
  annotations: Record<string, string>,
): Record<string, string> {
  return {
    ...annotations,
    'backstage.io/managed-by-location': `authentik:${baseUrl}`,
    'backstage.io/managed-by-origin-location': `authentik:${baseUrl}`,
  };
}

export function parseUser(user: AuthentikUser, baseUrl: string): UserEntity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: sanitizeName(user.username),
      annotations: withLocations(baseUrl, {
        'authentik.goauthentik.io/pk': String(user.pk),
      }),
    },
    spec: {
      profile: {
        displayName: user.name,
        ...(user.email ? { email: user.email } : {}),
        picture: user.avatar,
      },
      memberOf: user.groups_obj.map(g => sanitizeName(g.name)),
    },
  };
}

export function parseGroup(
  group: AuthentikGroup,
  baseUrl: string,
  children: string[],
): GroupEntity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: sanitizeName(group.name),
      annotations: withLocations(baseUrl, {
        'authentik.goauthentik.io/pk': group.pk,
      }),
    },
    spec: {
      type: 'team',
      children,
      members: group.users_obj
        .filter(u => u.is_active)
        .map(u => sanitizeName(u.username)),
      ...(group.parent_name
        ? { parent: sanitizeName(group.parent_name) }
        : {}),
    },
  };
}
