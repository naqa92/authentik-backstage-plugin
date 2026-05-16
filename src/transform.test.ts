import { parseGroup, parseUser, sanitizeName } from './transform';
import { AuthentikGroup, AuthentikUser } from './types';

describe('sanitizeName', () => {
  it('lowercases input', () => {
    expect(sanitizeName('Alice')).toBe('alice');
  });

  it('replaces disallowed characters with hyphens', () => {
    expect(sanitizeName('a b@c/d')).toBe('a-b-c-d');
  });

  it('preserves allowed characters', () => {
    expect(sanitizeName('a-b_c.d0')).toBe('a-b_c.d0');
  });
});

describe('parseUser', () => {
  const baseUrl = 'https://authentik.example.com';

  const userFixture: AuthentikUser = {
    pk: 42,
    username: 'Alice.Smith',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar: 'https://cdn.example.com/alice.png',
    is_active: true,
    type: 'internal',
    groups_obj: [
      { pk: 'g-1', name: 'Engineers', parent_name: null },
      { pk: 'g-2', name: 'Admins', parent_name: 'Engineers' },
    ],
  };

  it('maps an Authentik user to a UserEntity with metadata, annotations, and memberships', () => {
    const entity = parseUser(userFixture, baseUrl);

    expect(entity.apiVersion).toBe('backstage.io/v1alpha1');
    expect(entity.kind).toBe('User');
    expect(entity.metadata.name).toBe('alice.smith');
    expect(entity.metadata.annotations).toEqual({
      'authentik.goauthentik.io/pk': '42',
      'backstage.io/managed-by-location': `authentik:${baseUrl}`,
      'backstage.io/managed-by-origin-location': `authentik:${baseUrl}`,
    });
    expect(entity.spec).toEqual({
      profile: {
        displayName: 'Alice Smith',
        email: 'alice@example.com',
        picture: 'https://cdn.example.com/alice.png',
      },
      memberOf: ['engineers', 'admins'],
    });
  });

  it('omits the email field when the Authentik user has no email', () => {
    const entity = parseUser({ ...userFixture, email: '' }, baseUrl);
    expect(entity.spec.profile).not.toHaveProperty('email');
  });

  it('keeps only memberOf entries present in validGroupNames', () => {
    const entity = parseUser(
      userFixture,
      baseUrl,
      new Set(['engineers']),
    );
    expect(entity.spec.memberOf).toEqual(['engineers']);
  });

  it('drops all memberOf when no Authentik groups remain after exclusion', () => {
    const entity = parseUser(userFixture, baseUrl, new Set());
    expect(entity.spec.memberOf).toEqual([]);
  });
});

describe('parseGroup', () => {
  const baseUrl = 'https://authentik.example.com';

  const groupFixture: AuthentikGroup = {
    pk: 'group-uuid-1',
    name: 'Engineers',
    parent: null,
    parent_name: null,
    users_obj: [
      { pk: 1, username: 'Alice', name: 'Alice', email: '', is_active: true },
      { pk: 2, username: 'Bob', name: 'Bob', email: '', is_active: false },
    ],
  };

  it('maps an Authentik group, dropping inactive members', () => {
    const entity = parseGroup(groupFixture, baseUrl, []);
    expect(entity.spec.members).toEqual(['alice']);
  });

  it('passes through children and sets parent when present', () => {
    const entity = parseGroup(
      { ...groupFixture, parent: 'parent-uuid', parent_name: 'Parent Group' },
      baseUrl,
      ['squad-a', 'squad-b'],
    );
    expect(entity.spec.parent).toBe('parent-group');
    expect(entity.spec.children).toEqual(['squad-a', 'squad-b']);
  });

  it('omits parent when parent_name is null', () => {
    const entity = parseGroup(groupFixture, baseUrl, []);
    expect(entity.spec).not.toHaveProperty('parent');
  });
});
