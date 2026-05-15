# Troubleshooting

## OIDC sign-in fails with `No user found`

Symptom — a user that exists in Authentik gets:

```
Login failed; caused by NotFoundError: No user found ...
```

This happens when the OIDC resolver (e.g.
`emailMatchingUserEntityProfileEmail`) can't find a matching `User` entity in
the catalog. Causes:

- The catalog sync has not run yet — wait for the next tick (default
  30 minutes) or trigger one manually via the Scheduler.
- The Authentik user has an empty `email` field, so the entity has no
  `spec.profile.email` — fix the email in Authentik, or rely on a different
  resolver such as `emailLocalPartMatchingUserEntityName` (matches
  `metadata.name` against the local-part of the email).
- The user's groups are all in `excludeGroups`, which usually means they
  should not have been allowed to sign in in the first place — review your
  Authentik application bindings.

## `Authentik API /api/v3/core/users/ failed: 401 Unauthorized`

The token in `catalog.providers.authentik.token` is invalid, expired, or lacks
permissions.

- Double-check the token value in the environment variable.
- In Authentik, verify the token user has `view_user` **and** `view_group`
  permissions (these are separate).
- Try the same token manually:

  ```bash
  curl -H "Authorization: Bearer $AUTHENTIK_TOKEN" \
       https://authentik.example.com/api/v3/core/users/?page=1
  ```

  If `curl` returns 200 but Backstage still 401s, the env var is not being
  injected into the backend container — check your deployment.

## `catalog.providers.authentik is not configured — skipping Authentik provider`

This warning means the module loaded but found no config block. Add the
`catalog.providers.authentik` section to your `app-config.yaml` — see
[Configure](configure.md).

## Users / groups are missing from the catalog

- Wait for the next scheduled sync (default: 30 minutes). Or trigger a manual
  sync via the Scheduler service.
- Check that the missing groups are not in `excludeGroups`.
- Check that the missing users are members of at least one group — Authentik
  users with no group membership still get a `User` entity, but if they only
  belonged to a group you excluded, they will look orphaned in the UI.
- Inactive users (`is_active: false`) are excluded from `Group.spec.members`,
  which can make them look "missing" from the group view.

## Sync runs but never completes

The default timeout is 3 minutes. For very large Authentik instances (10k+
users), raise it:

```yaml
schedule:
  frequency: { minutes: 30 }
  timeout: { minutes: 15 }
```

## Logs to look for

| Level   | Message                                              | Meaning                                |
| ------- | ---------------------------------------------------- | -------------------------------------- |
| `info`  | `Reading Authentik users and groups`                 | A sync just started.                   |
| `info`  | `Committed N users and M groups`                     | Sync finished successfully.            |
| `warn`  | `catalog.providers.authentik is not configured — …`  | Config block missing; module is idle.  |
| `error` | `Authentik API /api/v3/core/... failed: <status>`    | Token or network problem.              |
