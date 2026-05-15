# About the Backend Module

## Features

- **User sync** — every **active** Authentik user (`is_active: true`)
  becomes a Backstage `User` entity. Inactive users are skipped entirely.
- **Group sync** — every Authentik group becomes a `Group` entity, preserving
  parent/child hierarchy.
- **Active-only membership** — `Group.spec.members` only lists active users
  (which is consistent with the user-sync rule above).
- **Group exclusion** — pass `excludeGroups: [name1, name2]` in config to
  skip selected groups (matched on **sanitized** names — see [Configure](configure.md#how-excludegroups-matching-works)).
- **Configurable schedule** — frequency, timeout, initial delay, and scope are
  all driven by `app-config.yaml`.
- **Backstage-CLI packaging** — ships with `prepack`/`postpack` hooks that hoist
  the runtime entry from `src/` to `dist/` for npm consumers.

## Entities produced

### User

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: alice.smith
  annotations:
    authentik.goauthentik.io/pk: "42"
    backstage.io/managed-by-location: authentik:https://authentik.example.com
    backstage.io/managed-by-origin-location: authentik:https://authentik.example.com
spec:
  profile:
    displayName: Alice Smith
    email: alice@example.com
    picture: https://cdn.example.com/alice.png
  memberOf:
    - engineers
    - admins
```

### Group

```yaml
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: engineers
  annotations:
    authentik.goauthentik.io/pk: "9c3d4e6a-..."
    backstage.io/managed-by-location: authentik:https://authentik.example.com
    backstage.io/managed-by-origin-location: authentik:https://authentik.example.com
spec:
  type: team
  children: []
  members:
    - alice.smith
  parent: parent-group # only present when the group has a parent in Authentik
```

## Naming rules

Entity names are derived from Authentik usernames / group names via
`sanitizeName`:

- Lowercased.
- Any character outside `[a-z0-9\-_.]` is replaced by `-`.

So `Alice.Smith` becomes `alice.smith`, `Tech Ops!` becomes `tech-ops-`.

## What this module does NOT do

- It does **not** sync passwords, MFA factors, or session data.
- It does **not** sync application/role assignments (only user/group membership).
- It does **not** delete entities in Authentik when removed from Backstage — the
  sync is one-way (Authentik → Backstage).
