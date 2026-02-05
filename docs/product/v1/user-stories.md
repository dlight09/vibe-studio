# V1 User Stories

Document ID: VS-US-V1

Version: 0.1

Status: Draft

Last updated: 2026-02-05

Format:
- ID
- As a <role>, I want <capability> so that <benefit>
- Acceptance criteria

## Member

### US-M-001 Login

As a member, I want to log in so that I can book classes.

Acceptance criteria:
- Valid credentials create a session.
- Invalid credentials show a clear error.

### US-M-010 Browse Schedule

As a member, I want to browse the schedule so that I can find classes that fit my week.

Acceptance criteria:
- Schedule view renders classes for a time range.
- Remaining spots and full/waitlist state are visible.

### US-M-011 Filter Schedule

As a member, I want to filter by category, intensity, and instructor so that I can find relevant classes.

Acceptance criteria:
- Filters update the visible set.
- Empty state explains no matches.

### US-M-020 Book Class

As a member, I want to book in one click so that booking feels fast.

Acceptance criteria:
- Booking succeeds when spots remain and membership is valid.
- Booking is prevented if the member already has an overlapping booking.
- Member receives immediate feedback.

### US-M-021 Join Waitlist

As a member, I want to join the waitlist when a class is full so that I still have a chance to attend.

Acceptance criteria:
- When class is full, booking action adds the member to waitlist.
- Waitlist position is displayed.

### US-M-030 Cancel Booking

As a member, I want to cancel within policy so that I can manage my schedule.

Acceptance criteria:
- Cancellation is blocked inside the cancellation window.
- Outside the window, cancellation succeeds and capacity is freed.

## Staff/Admin

### US-A-010 Create Class

As staff, I want to create a class so that the schedule stays up to date.

Acceptance criteria:
- Staff can create a one-off class.
- System blocks instructor conflicts.

### US-A-011 Edit Class

As staff, I want to edit a class so that schedule changes are reflected.

Acceptance criteria:
- Edits update class details.
- If changing instructor, a change note is required.

### US-A-020 Promote Waitlist

As staff, I want to promote from the waitlist so that open spots are filled.

Acceptance criteria:
- Staff can promote a waitlisted member.
- System reindexes remaining waitlist.

### US-AD-001 Override Conflicts

As an admin, I want to override instructor conflicts with a reason so that I can handle exceptional situations.

Acceptance criteria:
- Admin can override and must provide reason.
- Override is recorded in audit log.

## Instructor Management

### US-I-010 Manage Availability

As staff, I want to set instructor availability so that scheduling respects real constraints.

Acceptance criteria:
- Availability rules can be added and removed.
- When availability exists, scheduling outside it is blocked.

### US-I-011 Record Time Off

As staff, I want to add instructor time off so that staff cannot schedule during that period.

Acceptance criteria:
- Time-off blocks can be added and removed.
- Scheduling overlapping time off is blocked.

### US-I-020 Swap Instructor

As staff, I want to swap the instructor for a class with a reason so that last-minute changes are traceable.

Acceptance criteria:
- Swap updates the class instructor.
- Reason is required.
- Conflict checks apply (admin override supported).

## Auditability

### US-U-001 View Audit Log

As staff/admin, I want to view a recent audit log so that I can understand operational changes.

Acceptance criteria:
- Audit log lists recent events with actor and metadata.
