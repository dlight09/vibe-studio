# RBAC (Role-Based Access Control)

Document ID: VS-ARCH-RBAC

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Roles

- MEMBER: can browse and manage own bookings.
- STAFF: can manage instructors/classes and operational workflows.
- ADMIN: staff permissions plus overrides and destructive actions.

## Enforcement

RBAC is enforced on the server:

- Page protection: Server Components redirect to `/login` when missing/insufficient role.
- Mutation protection: Server Actions check `getSession()`.

## Key Endpoints / Actions

- Member booking: `lib/actions/bookings.ts` (requires session)
- Admin classes: `lib/actions/admin.ts` (requires STAFF/ADMIN)
- Admin override conflicts: `lib/actions/admin.ts` (requires ADMIN + reason)
- Instructor availability/time off: `lib/actions/instructors.ts` (requires STAFF/ADMIN)
- Audit viewer: `app/admin/audit/page.tsx` (requires STAFF/ADMIN)
- Admin plans: `app/admin/plans/page.tsx` (view for STAFF/ADMIN, create/activate for ADMIN)
- Admin members: `app/admin/members/page.tsx` (requires STAFF/ADMIN)
- Counter sales: `lib/actions/membership.ts:sellPlanAtCounter()` (requires STAFF/ADMIN)
- Credit adjustments: `lib/actions/membership.ts:adjustMemberCredits()` (requires ADMIN)

## Future Hardening

- Add per-action permission constants.
- Add server-side rate limiting for auth and booking mutations.
