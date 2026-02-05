# ADR 0002: Staff-Managed Instructors for V1

Status: Accepted

Date: 2026-02-05

## Context

Instructor self-serve portals (login, roster view, time-off requests) are valuable but add complexity.

V1 prioritizes operational scheduling safety and instructor conflict prevention.

## Decision

Instructors are managed by Staff/Admin only in V1.

## Consequences

- No instructor logins or instructor-facing dashboard.
- Data model can later add `Instructor.userId` to link an instructor to a user account.
