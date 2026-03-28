# TherapyBook QA Test Accounts and Flows

Run `npm run db:seed:test` to create or refresh the fixtures in the current database.

All seeded accounts use the same password:

`TherapyBook123!`

## Test Accounts

| Role | Email | Primary Use |
|---|---|---|
| Admin | `qa.admin@therapybook.test` | Admin dashboard, application queue, users, sessions |
| Supervisor | `qa.supervisor@therapybook.test` | Role validation and future supervisor-only access checks |
| Verified client | `qa.client.verified@therapybook.test` | Directory, matching, session booking prerequisites, session access |
| Returning client | `qa.client.returning@therapybook.test` | Existing session history, pending-payment and completed-session states |
| Unverified client | `qa.client.unverified@therapybook.test` | Booking denial for unverified email |
| Approved trainee with open availability | `qa.trainee.available@therapybook.test` | Provider card, live slots, trainee dashboard, future confirmed session |
| Approved trainee with booked calendar | `qa.trainee.booked@therapybook.test` | Slot blocking from existing sessions, trainee dashboard, completed session history |
| Approved trainee without availability | `qa.trainee.offline@therapybook.test` | Offline therapist card state |
| Draft applicant | `qa.applicant.draft@therapybook.test` | Resume onboarding flow from partial draft |
| Submitted applicant | `qa.applicant.submitted@therapybook.test` | Admin queue review from `SUBMITTED` state |
| Under-review applicant | `qa.applicant.review@therapybook.test` | Admin queue review from `UNDER_REVIEW` state |
| Rejected applicant | `qa.applicant.rejected@therapybook.test` | Rejection display and read-only review state |

## Seeded Product States

### Providers

- `qa.trainee.available@therapybook.test`: approved, visible in directory, active weekday morning availability, one blocked unavailable slot.
- `qa.trainee.booked@therapybook.test`: approved, visible in directory, active weekday afternoon availability, seeded future and past sessions.
- `qa.trainee.offline@therapybook.test`: approved, visible in directory, no active availability so the card should show offline state.

### Applications

- Draft: partial onboarding only, should reopen the wizard instead of appearing in admin approval queues.
- Submitted: appears in admin queue and can be marked under review, approved, or rejected.
- Under review: appears in admin queue with in-review state and can still be approved or rejected.
- Rejected: visible as terminal history with rejection reason.

### Sessions and Payments

- Future scheduled session with completed payment.
- Future scheduled session with pending payment.
- Past completed session with rating and feedback.
- Past cancelled session with refunded payment.
- Past no-show session with completed payment.

The latest generated IDs and timestamps are written to:

`output/qa-test-data.json`

## Recommended Manual Test Pass

1. Sign in as `qa.client.verified@therapybook.test`.
2. Open `/directory` and verify:
   - available provider cards render real profile fields
   - offline provider shows non-bookable state
   - filtering by specialty and language works
3. Open `/matching` and verify the returned shortlist maps to seeded providers.
4. Open `/booking` and verify:
   - provider select includes the approved trainees
   - offline trainee has no slots
   - blocked unavailable slot is not bookable
   - booked slot is removed from availability
5. Sign in as `qa.client.unverified@therapybook.test` and verify booking is blocked by email verification.
6. Sign in as `qa.trainee.available@therapybook.test` and verify:
   - availability CRUD works
   - upcoming and historical sessions render
   - session join links resolve to `/session/[id]`
7. Sign in as `qa.admin@therapybook.test` and verify:
   - application queue filters `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`
   - application review actions work
   - users page can change roles and verification state
   - sessions page can mark sessions complete, no-show, or cancelled

## Known External Dependencies for Full End-to-End Testing

- Stripe checkout requires real `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- Transactional email requires `RESEND_API_KEY` and a verified sender domain.
- Upload finalization needs working Cloudflare R2 credentials, bucket, and public URL.
- Reminder workers require reachable Redis/queue infrastructure and a scheduler calling the reminder endpoint.
