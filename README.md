# Backstage Plugin — Authentik

[![npm version](https://img.shields.io/npm/v/@naqa92/backstage-plugin-catalog-backend-module-authentik.svg)](https://www.npmjs.com/package/@naqa92/backstage-plugin-catalog-backend-module-authentik)
[![CI](https://github.com/naqa92/authentik-backstage-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/naqa92/authentik-backstage-plugin/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/naqa92/authentik-backstage-plugin/badge)](https://scorecard.dev/viewer/?uri=github.com/naqa92/authentik-backstage-plugin)
[![Docs](https://img.shields.io/badge/docs-mkdocs-blue)](https://naqa92.github.io/authentik-backstage-plugin/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

A Backstage catalog backend module that ingests users and groups from
[Authentik](https://goauthentik.io/) and maps them to Backstage `User` and
`Group` entities.

## Quick install

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

## Full documentation

Configuration reference, schedule customization, produced entities, token
permissions, troubleshooting:

**[https://naqa92.github.io/authentik-backstage-plugin/](https://naqa92.github.io/authentik-backstage-plugin/)**

## Compatibility

| Plugin version | Backstage version | Node    |
| -------------- | ----------------- | ------- |
| `0.1.x`        | `>=1.30`          | `>=24`  |

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Security issues:
[SECURITY.md](SECURITY.md).

## License

[Apache-2.0](LICENSE) — © 2026 naqa92.
