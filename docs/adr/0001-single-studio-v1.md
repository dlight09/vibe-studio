# ADR 0001: Single Studio Scope for V1

Status: Accepted

Date: 2026-02-05

## Context

We need to ship an operationally solid scheduling and booking product quickly.

Multi-location introduces additional complexity (tenancy, room/resource modeling per location, timezones, permissions).

## Decision

V1 targets a single studio only.

The schema and services should be written so that multi-studio can be introduced later with minimal migration effort.

## Consequences

- Faster delivery and simpler UX.
- Future multi-studio will require introducing a `Studio` model and scoping most entities by studio id.
