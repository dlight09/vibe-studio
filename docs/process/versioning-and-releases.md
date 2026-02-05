# Versioning and Releases

Document ID: VS-PROC-VERSIONING

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Semantic Versioning

Use SemVer for releases:

- MAJOR: breaking changes
- MINOR: backwards-compatible features
- PATCH: backwards-compatible fixes

## Branching

- `main`: always releasable.
- feature branches: `feature/<short-name>`.

## Release Process (Proposed)

1) Create release branch/tag from `main`.
2) Run CI gates: build, lint, typecheck, tests.
3) Update `CHANGELOG.md`.
4) Tag release: `vX.Y.Z`.

## Changelog

- Maintain a human-readable `CHANGELOG.md`.
- Group entries: Added/Changed/Fixed/Removed/Security.
