# Backstage Plugin — Authentik

[![npm version](https://img.shields.io/npm/v/@naqa92/backstage-plugin-catalog-backend-module-authentik.svg)](https://www.npmjs.com/package/@naqa92/backstage-plugin-catalog-backend-module-authentik)
[![CI](https://github.com/naqa92/authentik-backstage-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/naqa92/authentik-backstage-plugin/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/naqa92/authentik-backstage-plugin/badge)](https://scorecard.dev/viewer/?uri=github.com/naqa92/authentik-backstage-plugin)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/naqa92/authentik-backstage-plugin/blob/main/LICENSE)

A Backstage catalog backend module that ingests **users** and **groups** from
[Authentik](https://goauthentik.io/) and maps them to Backstage `User` and `Group`
entities — so your identity provider becomes the source of truth for the catalog.

## What it does

- Polls Authentik's REST API on a configurable schedule.
- Creates a `User` entity for every Authentik user (including avatar, email, and
  group memberships).
- Creates a `Group` entity for every Authentik group, preserving parent/child
  hierarchy and active membership.
- Annotates every entity with `authentik.goauthentik.io/pk` for traceability back
  to Authentik.

## Quick start

```bash
yarn --cwd packages/backend add @naqa92/backstage-plugin-catalog-backend-module-authentik
```

```ts
// packages/backend/src/index.ts
backend.add(import('@naqa92/backstage-plugin-catalog-backend-module-authentik'));
```

```yaml
# app-config.yaml
catalog:
  providers:
    authentik:
      baseUrl: https://authentik.example.com
      token: ${AUTHENTIK_TOKEN}
      excludeGroups: []
```

See **[Install](plugin/backend/install.md)** and **[Configure](plugin/backend/configure.md)**
for the full setup.

## Compatibility

| Plugin version | Backstage version |
| -------------- | ----------------- |
| `0.1.x`        | `>=1.30`          |

## License

Apache-2.0 — see [LICENSE](https://github.com/naqa92/authentik-backstage-plugin/blob/main/LICENSE).
