# V1 Acceptance (Single Studio)

V1 is "ready" when the following scenarios pass end-to-end in a seeded environment.

## Staff/Admin

### Instructors
- Create instructor
- Edit instructor
- Set active/inactive
- Add availability rules
- Add time off blocks

### Scheduling
- Create class with instructor
- Edit class time/instructor
- Conflict prevention:
  - prevents overlapping instructor classes
  - prevents scheduling during instructor time off
  - when instructor has availability rules, prevents scheduling outside availability

## Member

### Booking
- Browse schedule, filter by instructor
- Book a class
- Cancel a class (within policy window)
- Waitlist:
  - when class is full, booking joins waitlist
  - when a spot opens, waitlist promotion occurs

### Booking constraints
- Prevent overlapping bookings for the same member

## Non-functional
- `npm run build` succeeds
- `npm run db:push` and `npm run db:seed` succeed on Postgres

## Out of scope for V1
- Instructor self-serve login/portal
- Recurring class series + exceptions
- Payments and credit packs
- Email/SMS notifications
