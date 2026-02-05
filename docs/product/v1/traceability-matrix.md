# Traceability Matrix (V1)

Document ID: VS-TRACE-V1

Version: 0.1

Status: Draft

Last updated: 2026-02-05

This matrix links requirements -> stories -> implementation -> tests.

## Legend

- Req: `docs/product/v1/requirements.md`
- Stories: `docs/product/v1/user-stories.md`
- V1 acceptance: `docs/v1-acceptance.md`

## Matrix

| Requirement | User story | Implementation | Tests |
|---|---|---|---|
| REQ-M-002 | US-M-010 | `app/schedule/page.tsx`, `app/schedule/ScheduleClient.tsx` | Manual: QA-M-010 |
| REQ-M-003 | US-M-011 | `components/calendar/FilterBar.tsx` | Manual: QA-M-011 |
| REQ-M-004 | US-M-020 | `lib/actions/bookings.ts:bookClass`, `app/api/bookings/route.ts` | Manual: QA-M-020 |
| REQ-M-005 | US-M-020 | `lib/actions/bookings.ts:bookClass` (overlap check) | Manual: QA-M-021 |
| REQ-M-006 | US-M-021 | `lib/actions/bookings.ts:bookClass` (waitlist) | Manual: QA-M-022 |
| REQ-M-007 | US-M-030 | `lib/actions/bookings.ts:cancelBooking` | Manual: QA-M-030 |
| REQ-R-002 | US-M-021 | `lib/actions/bookings.ts:promoteFromWaitlist` | Manual: QA-M-023 |
| REQ-I-002 | US-I-010 | `prisma/schema.prisma:InstructorAvailabilityRule`, `lib/actions/instructors.ts` | Manual: QA-I-010 |
| REQ-I-003 | US-I-011 | `prisma/schema.prisma:InstructorTimeOff`, `lib/actions/instructors.ts` | Manual: QA-I-011 |
| REQ-I-004 | US-A-010 | `lib/actions/instructors.ts:checkInstructorConflicts`, `lib/actions/admin.ts` | Manual: QA-I-020 |
| REQ-I-006 | US-I-020 | `app/admin/classes/[id]/swap-instructor/page.tsx`, `lib/actions/admin.ts:updateClass` | Manual: QA-I-030 |
| REQ-U-001 | US-U-001 | `prisma/schema.prisma:AuditLog`, `lib/audit.ts`, server actions | Manual: QA-U-010 |
| REQ-U-002 | US-U-001 | `app/admin/audit/page.tsx` | Manual: QA-U-010 |
