# Instructor Availability and Conflicts

Document ID: VS-ARCH-INSTRUCTOR

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Data Model

- Instructor
- InstructorAvailabilityRule: weekly rule with dayOfWeek and HH:mm start/end
- InstructorTimeOff: explicit date-time block

## Conflict Rules

When creating/updating a class:

1) Time off: reject if class overlaps any time-off block.
2) Overlap: reject if class overlaps another non-cancelled class for the same instructor.
3) Availability (conditional):
   - If instructor has at least one availability rule, require the class to fit inside at least one rule.

## Overrides

- Admin can override conflicts with an explicit override reason.
- Override applies at class create/edit and is recorded in `AuditLog`.

## Implementation

- Conflict check: `lib/actions/instructors.ts:checkInstructorConflicts()`.
- Enforcement: `lib/actions/admin.ts:createClass()` and `lib/actions/admin.ts:updateClass()`.
- Availability/time off UI: `app/admin/instructors/[id]/page.tsx`.
- Instructor swap UI: `app/admin/classes/[id]/swap-instructor/page.tsx`.
