# Install

## Requirements

- A Backstage project running the **new backend system** (Backstage `>=1.30`).
- Node.js `>=24` (see [.nvmrc](https://github.com/naqa92/authentik-backstage-plugin/blob/main/.nvmrc)).
- An Authentik instance with a service-account token that has `view_user` and
  `view_group` permissions.

## Add the dependency

```bash
yarn --cwd packages/backend add @naqa92/backstage-plugin-catalog-backend-module-authentik
```

## Register the module

In `packages/backend/src/index.ts`:

```ts
const backend = createBackend();

// ... other backend.add(...) lines ...

backend.add(import('@naqa92/backstage-plugin-catalog-backend-module-authentik'));

backend.start();
```

That single `backend.add()` line registers the module against the catalog plugin.
No other wiring is needed.

## Configure the provider

You **must** add a `catalog.providers.authentik` block to your `app-config.yaml`
before the module does anything — otherwise it logs a warning and exits cleanly.

See **[Configure](configure.md)** for the full schema, sample config, and how to
mint the Authentik token.

## Verify

After restarting the backend, look for one of these log lines:

```
info  Reading Authentik users and groups
info  Committed N users and M groups
```

Then open `/catalog?filters[kind]=user` in your Backstage UI — Authentik users
should appear with the `authentik.goauthentik.io/pk` annotation on each entity.
