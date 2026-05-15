# Configure

## app-config.yaml

```yaml
catalog:
  providers:
    authentik:
      # Root URL of your Authentik instance — NOT a path like /if/admin/ or
      # /api/v3/. A trailing slash is stripped automatically.
      baseUrl: https://authentik.example.com

      # Service-account token with view_user + view_group permissions.
      # Pull this from an environment variable; never commit it.
      token: ${AUTHENTIK_TOKEN}

      # Optional: groups (by name) to skip during sync. Useful for excluding
      # Authentik's built-in admin groups that should never reach the catalog.
      excludeGroups:
        - authentik-admins
        - authentik-read-only

      # Optional: override the default sync cadence.
      # Defaults: { frequency: { minutes: 30 }, timeout: { minutes: 3 },
      #            initialDelay: { seconds: 15 } }
      schedule:
        frequency: { minutes: 60 }
        timeout: { minutes: 5 }
        initialDelay: { seconds: 30 }
```

## Authentik token

### Via the admin UI

1. **Directory → Tokens & App passwords → Create**.
2. Identifier: `backstage-catalog` (or anything memorable).
3. User: pick a dedicated service account (recommended) or `akadmin` for a
   quick start. The user must hold the Django permissions
   `authentik_core.view_user` and `authentik_core.view_group` — `akadmin` has
   them by default; for a service account, assign them via a group with those
   permissions.
4. Intent: **API Token** (not "App password").
5. Expiring: **No** — long-lived tokens are required because Authentik does
   not refresh them automatically.
6. Copy the token value once (it is not shown again).

### Via a blueprint (GitOps)

If you manage Authentik declaratively, you can create the same token as a
blueprint entry:

```yaml
- model: authentik_core.token
  state: present
  identifiers:
    identifier: backstage-catalog-provider
  attrs:
    key: !Env BACKSTAGE_API_TOKEN # pull from a secret manager
    user: !Find [authentik_core.user, [username, akadmin]]
    intent: api
    expiring: false
    description: "Backstage catalog provider — read-only API access"
```

### Exposing the token to Backstage

Expose the token to Backstage as `AUTHENTIK_TOKEN` — env var, Kubernetes
secret + `envFrom`, Helm chart value, your secret manager of choice. Never
commit it.

## Schedule

The `schedule` block is a Backstage
[`SchedulerServiceTaskScheduleDefinition`](https://backstage.io/docs/reference/backend-plugin-api.schedulerservicetaskscheduledefinition).

| Field          | Type                              | Default          | Notes                                                                          |
| -------------- | --------------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `frequency`    | `HumanDuration` or `{cron:"..."}` | `{minutes:30}`   | How often the provider polls Authentik.                                        |
| `timeout`      | `HumanDuration`                   | `{minutes:3}`    | If a sync runs longer, it is released so another worker can take over.         |
| `initialDelay` | `HumanDuration`                   | `{seconds:15}`   | Per-worker startup delay; staggers replicas after a deploy.                    |
| `scope`        | `'global'` or `'local'`           | `'global'`       | `'global'` = one worker at a time across hosts; `'local'` = each worker syncs. |

Example with cron:

```yaml
schedule:
  frequency:
    cron: "0 */2 * * *" # every 2 hours
  timeout: { minutes: 5 }
```

## What gets synced

- Authentik users with `is_active: true` are exported as `User` entities.
  Inactive users are **skipped entirely** — no `User` entity is created for
  them and they do not appear in any `Group.spec.members`.
- All Authentik groups except those listed in `excludeGroups`.
- Parent/child relationships between groups are preserved
  (`Group.spec.parent` / `Group.spec.children`).

## How `excludeGroups` matching works

`excludeGroups` is matched against the **sanitized** group name — that is,
the Authentik group name lowercased with any character outside
`[a-z0-9\-_.]` replaced by `-`. So an Authentik group named `Authentik
Admins` must be listed as `authentik-admins` (not `Authentik Admins`).

Excluded groups affect only the `Group` entities produced by this plugin:

- The `Group` entity is **not** created.
- But `User.spec.memberOf` still lists the group's sanitized name for every
  user that belongs to it. The reference is dangling (it points to a group
  that does not exist in the catalog) — Backstage handles this gracefully
  by ignoring the missing target, so it does not break anything; just be
  aware if you query the relationship.

## What does NOT get synced

- Roles, permissions, application assignments — only user/group membership.
- Passwords, MFA, session tokens.

## Pairing with OIDC sign-in

!!! info "Two separate blocks, two separate plugins"
    Backstage uses **two distinct config trees** to integrate with Authentik:

    - `auth.providers.oidc` — handled by Backstage's **built-in OIDC auth
      provider** (`@backstage/plugin-auth-backend-module-oidc-provider`).
      This is the block that handles the actual login flow (redirect to
      Authentik, callback, session). **This plugin does not configure or
      replace it.**
    - `catalog.providers.authentik` — handled by **this plugin**. It only
      populates the catalog with `User` and `Group` entities sourced from
      Authentik.

    Both blocks usually coexist in the same `app-config.yaml`. Each is
    required for a different reason; this plugin completes the OIDC setup
    by giving the auth resolvers something to match against.

The most common reason to install this plugin is to make Authentik users
**discoverable by the Backstage auth resolvers**. Backstage's OIDC provider
matches the user who just signed in against an existing `User` entity using
a resolver such as:

```yaml
auth:
  providers:
    oidc:
      production:
        metadataUrl: https://authentik.example.com/application/o/backstage/.well-known/openid-configuration
        clientId: ${AUTH_OIDC_CLIENT_ID}
        clientSecret: ${AUTH_OIDC_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
```

Without a matching `User` entity, the resolver fails and the sign-in returns
`Login failed; caused by NotFoundError: No user found …`. This plugin
populates that entity from Authentik so the resolvers have something to match
against.

!!! warning "Users with no email"
    The `emailMatchingUserEntityProfileEmail` resolver matches on
    `spec.profile.email`. If an Authentik user has an empty `email`, this
    plugin omits `spec.profile.email` and that resolver will not find them
    — fall back to `emailLocalPartMatchingUserEntityName` or fix the email
    in Authentik.
