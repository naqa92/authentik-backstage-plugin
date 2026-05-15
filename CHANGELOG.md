# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-05-15

### Added

- Initial public release of the Authentik catalog backend module for Backstage.
- `AuthentikEntityProvider` syncs users and groups from Authentik's REST API
  (`/api/v3/core/users/`, `/api/v3/core/groups/`) into the Backstage catalog.
- User entities are annotated with `authentik.goauthentik.io/pk` for
  traceability back to Authentik.
- Group entities preserve parent/child hierarchy and only list active members.
- Configurable polling schedule via `catalog.providers.authentik.schedule`
  (defaults: every 30 min, 3-min timeout, 15-second initial delay).
- `excludeGroups` config option to skip selected Authentik groups.
- Apache-2.0 license, OSS hygiene files (CONTRIBUTING, CODE_OF_CONDUCT,
  SECURITY, SUPPORT, MAINTAINERS, GOVERNANCE, ROADMAP, ADOPTERS).
- CI workflow with SHA-pinned actions and reproducible Yarn 4 installs.
- Publish workflow using npm OIDC trusted publisher + provenance.
- OpenSSF Scorecard, Renovate (with `pinDigests` for github-actions), PR
  labeler, stale bot.
- MkDocs Material documentation site deployed to GitHub Pages.

[Unreleased]: https://github.com/naqa92/authentik-backstage-plugin/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/naqa92/authentik-backstage-plugin/releases/tag/v0.1.0
