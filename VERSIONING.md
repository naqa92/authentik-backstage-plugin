# Versioning Policy

This package follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## Version numbering

Given a version `MAJOR.MINOR.PATCH`:

| Bump  | When                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------- |
| MAJOR | Breaking change to the **public API** of the module (exported symbols, config schema, entity shape).           |
| MINOR | Backward-compatible feature (new config option, new annotation on produced entities, new optional behavior).   |
| PATCH | Backward-compatible bug fix, documentation update, internal refactor, dependency bump that doesn't change API. |

## Pre-1.0 caveat

While the package is at `0.y.z`, **the `y` segment behaves like a major** —
breaking changes can land in any minor bump. Once a `1.0.0` is released, the
table above applies strictly.

## Backstage compatibility

The Backstage backend system is the only stable API surface this module
targets. Each release is built and tested against the Backstage versions
declared in `peerDependencies`:

- `@backstage/backend-plugin-api`
- `@backstage/catalog-model`
- `@backstage/config`
- `@backstage/plugin-catalog-node`

A bump that widens or narrows any of these peer ranges is considered a
**MINOR** bump (when widening) or **MAJOR** bump (when narrowing past an
already-published range).

## Dependency updates

Day-to-day dependency updates are driven by [Renovate](renovate.json):

- Non-major updates are grouped into a single PR.
- Major updates open one PR per package and require manual review.
- Security updates are labeled `security` and not auto-merged.
- GitHub Actions are pinned by commit SHA via `pinDigests: true`.

Backstage-CLI version bumps may be deferred between releases when a newer CLI
introduces incompatible templates; the dist-tag `latest` on
`@backstage/cli` is the reference.

## Release process

1. Open a PR titled `release: v<NEW_VERSION>` bumping `package.json` and
   updating `CHANGELOG.md`.
2. Once merged, tag the commit: `git tag -a v<NEW_VERSION> -m "v<NEW_VERSION>"`.
3. Push the tag, then create a GitHub release pointing at it.
4. The `publish.yml` workflow runs, publishes to npm via the OIDC trusted
   publisher (no long-lived token), and attaches the npm provenance
   attestation.

## Yanking / deprecating

If a release is broken, prefer **publishing a patch** that fixes the issue
over `npm unpublish` (which leaves consumers in a broken state). When a
deprecation is necessary, run `npm deprecate <pkg>@<version> "<reason>"` so
that `npm install` surfaces the warning.
