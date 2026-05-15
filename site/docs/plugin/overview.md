# Overview

This plugin is a **catalog backend module**: it plugs into the Backstage backend
runtime and registers a custom `EntityProvider` that owns a stream of `User` and
`Group` entities sourced from Authentik.

## Architecture

```
┌────────────────┐    GET /api/v3/core/users/    ┌──────────────────────────┐
│                │ ────────────────────────────▶ │                          │
│                │    GET /api/v3/core/groups/   │   AuthentikEntityProvider│
│   Authentik    │ ────────────────────────────▶ │                          │
│   (REST API)   │                               │   • transform → User     │
│                │                               │   • transform → Group    │
│                │                               │   • applyMutation        │
└────────────────┘                               └────────────┬─────────────┘
                                                              │
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │  Backstage Catalog DB  │
                                                  └────────────────────────┘
```

## Components

| File           | Responsibility                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `config.ts`    | Reads `catalog.providers.authentik` from `app-config.yaml` (`baseUrl`, `token`, `excludeGroups`, `schedule`). |
| `read.ts`      | Fetches paginated users + groups from Authentik's REST API.                                                   |
| `transform.ts` | Maps Authentik shapes to Backstage `UserEntity` / `GroupEntity`.                                              |
| `provider.ts`  | Implements `EntityProvider`, owns the `applyMutation` call.                                                   |
| `module.ts`    | Backend module: wires the provider, registers the scheduled task.                                             |

## Endpoints consumed

- `GET /api/v3/core/users/` (paginated, page size 100)
- `GET /api/v3/core/groups/` (paginated, page size 100)

The token sent in `Authorization: Bearer <token>` must have `view_user` and
`view_group` permissions on the target users/groups.

## Sync cadence

By default the provider runs every **30 minutes** with a 3-minute timeout and a
15-second initial delay. Both can be overridden — see
[Configure](backend/configure.md#schedule).
