# Test Plan (V1)

Document ID: VS-QA-PLAN-V1

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Objective

Validate V1 acceptance criteria and reduce regressions.

## Test Levels

- Smoke tests (manual): validate app boots, schedule loads, booking works.
- Functional tests (manual scripts): role-based flows.
- Automated tests (future): Playwright end-to-end and unit tests for rule engines.

## Environments

- Local: seeded Postgres + Next dev server.

## Exit Criteria

- All scenarios in `docs/v1-acceptance.md` pass.
- `npm run build` passes.
- No P0 defects open.
