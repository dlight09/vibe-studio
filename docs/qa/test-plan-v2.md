# Test Plan (V2)

Document ID: VS-QA-PLAN-V2

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Objective

Validate membership entitlements, counter sales, and credit enforcement.

## Test Levels

- Smoke tests: booking eligibility and counter sales.
- Functional tests: manual scripts in `docs/qa/manual-scripts-v2.md`.

## Environments

- Local: seeded Postgres + Next dev server.

## Exit Criteria

- All scenarios in `docs/v2-acceptance.md` pass.
- `npm run build` passes.
- No P0 defects open.
