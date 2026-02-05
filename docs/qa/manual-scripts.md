# Manual Test Scripts (V1)

Document ID: VS-QA-MANUAL-V1

Version: 0.1

Status: Draft

Last updated: 2026-02-05

Pre-req: local env seeded (`npm run db:seed`).

## QA-M-010 Schedule loads

1) Visit `/schedule`.
2) Verify classes render and spot counts appear.

## QA-M-011 Filters

1) On `/schedule`, filter by instructor.
2) Verify list changes.

## QA-M-020 Booking

1) Login as member.
2) Book a class from `/schedule`.
3) Verify toast feedback and booking badge.

## QA-M-021 Overlapping bookings

1) Book a class.
2) Attempt to book another class overlapping the time.
3) Expect error toast.

## QA-M-022 Waitlist join

1) Set a class capacity low (admin edit) or use an already-full class.
2) Attempt to book as another member.
3) Expect waitlist join and position.

## QA-M-023 Waitlist promotion

1) With a full class and at least one waitlisted user, cancel a confirmed booking.
2) Verify waitlisted user becomes confirmed.
3) Verify audit log contains WAITLIST_PROMOTE.

## QA-M-030 Cancellation window

1) Attempt to cancel a booking inside 12 hours.
2) Expect cancellation blocked.

## QA-I-010 Availability

1) Admin: `/admin/instructors/[id]`.
2) Add availability rule.
3) Create a class outside the availability window.
4) Expect conflict error (unless overridden).

## QA-I-011 Time off

1) Add a time-off block overlapping a class time.
2) Attempt to schedule the instructor during time off.
3) Expect conflict error.

## QA-I-030 Swap instructor

1) Admin: `/admin/classes`.
2) Click `Swap`.
3) Choose a new instructor and provide reason.
4) Verify class instructor updates.
5) Verify audit log includes instructorChange metadata.

## QA-U-010 Audit log viewer

1) Admin: `/admin/audit`.
2) Verify recent audit events appear.
