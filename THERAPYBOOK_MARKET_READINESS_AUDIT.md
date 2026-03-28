## 1. Executive Summary

TherapyBook is **not currently launchable as a general therapy marketplace**. `npm run type-check` and `npm run build` both passed on **March 28, 2026**, so the blockers are not compile-time; they are product-truth, operational, compliance, and lifecycle gaps: no real client account hub, no supervision workflow despite the core promise, incomplete document verification, no refund/payout ops, weak audit/consent evidence, and a session/video model that is not safe enough for healthcare-grade trust.

The most important strategic recommendation is to **stop trying to look like a broad therapy marketplace and relaunch only as a narrow, cash-pay, one-market wedge for supervised trainee therapy after the critical lifecycle fixes below**. If you want to be a supervision-native platform later, build that explicitly; right now the codebase is closer to a thin B2C booking marketplace than a supervision OS.

Scope note: I reviewed every active route emitted by the production build, mapped mounted flows to APIs and Prisma models, and included stale/duplicate paths. I did **not** find an automated test suite in-repo.

## 2. Comprehensive Markdown Audit Table

| Journey / Location & Component | Role | Current Evidence | Market-Ready Target Workflow | Identified Gap | Severity | Required Implementation Fix | Broken Layer(s) | Business Impact | Recommended SaaS Pattern |
|---|---|---|---|---|---|---|---|---|---|
| Global routing, guards, and canonical implementation | All | Public/admin UI is App Router; auth/booking/payments/sessions mostly remain in `pages/api`; duplicate session cancel path exists in App Router and Pages Router; build passes | One canonical router/API contract per domain with clear ownership and no stale endpoints | Mixed App/Pages responsibility and stale duplicate APIs | High | Pick canonical API surfaces, delete duplicate routes, centralize shared DTOs/enums, add contract tests | Routing, API, RBAC, type governance | Drift and future permission bugs | Strangler migration |
| `/` Hero, CTAs, top-funnel conversion | Visitor | CTAs send users to directory, matching, booking, or trainee application; no consult/demo/contact-sales capture | Assisted conversion for a high-trust healthcare purchase with CRM capture and fallback support | Pure self-serve funnel for a high-consideration service | Medium | Add lead capture, consult CTA, support/contact flow, attribution analytics | UI, analytics, ops | Lower conversion, no rescue path | Assisted conversion funnel |
| `/` trust badges, testimonials, supervision claims | Visitor | Marketing states reviewed profiles, supervision, booking/payment/session access, emergency trust framing | Claims should map to auditable operational workflows | Copy overstates supervision/compliance maturity | High | Remove unsupported claims now or implement supervisor assignment, consent, audit, and incident workflows | UI, compliance, ops | Trust and regulatory exposure | Truth-aligned trust center |
| `/directory` filter sidebar, therapist cards, book CTA | Visitor, prospective client | Reads live `/api/providers`; shows approved trainees, specialties, languages, hardcoded per-session price; no detail profile page; filter type supports `busy` but API only emits `available/offline` | Searchable directory with detailed provider profiles, trust signals, supervisor info, clear pricing, next availability | Thin discovery surface; unreachable filter state; no provider detail or conversion proof | High | Add provider detail pages, next-available slot preview, supervisor badge, richer taxonomy, fix availability enum drift | UI, API, schema | Weak conversion and trust | Directory + profile detail pattern |
| `/matching` questionnaire and results | Visitor, prospective client | Client-side heuristic ranking from keyword overlap against `/api/providers`; no persistence, no ops review, no intake record | Persisted intake feeding server-side matching, manual override, and follow-up workflow | "Matching" is mostly cosmetic ranking | High | Persist intake, add match reason schema, server-side scoring, CRM/admin review, outcome feedback loop | UI, API, data, analytics | Poor match quality, churn | Intake-to-assignment workflow |
| `/pricing` pricing cards and FAQ | Visitor, prospective client | Static `EUR 40` and comparison price; FAQ promises therapist switching and supervision quality | Config-driven pricing, public policy pages, switch/refund/cancel workflows | Hardcoded pricing and unsupported policy promises | High | Move pricing/policies to settings, publish terms/cancellation/refund pages, wire therapist-switch support flow | UI, pricing, ops | Disputes, revenue leakage, trust erosion | Config-driven pricing + policy center |
| `/privacy` and GDPR banner | Visitor, client, trainee | Consent is stored client-side only; privacy copy says audit/session-note/document records exist | Server-side consent ledger, versioned policy acceptance, DSR tooling, truthful retention statements | No durable consent proof; privacy page is ahead of actual audit/notes coverage | High | Store consent server-side with policy version/time/IP, expose privacy request workflow, align copy to reality | UI, storage, audit, compliance | Legal and trust risk | Consent ledger + policy versioning |
| `/impressum` and legal footer surface | Visitor | Page explicitly says formal commercial metadata like trade register/VAT are not included and should be added before launch | Complete jurisdiction-appropriate legal pages, terms, booking/cancellation policy, support contacts | Legal/commercial publish surface incomplete | High | Publish terms, refund policy, support SLA, statutory company details before go-live | UI, compliance, ops | Commercial launch blocker | Legal center |
| `/auth/register` | Prospective client | Creates `CLIENT` user, sends verification email, but only minimal post-signup recovery options | Smooth signup with verification recovery, lead attribution, clear next step to book | No resend-verification path or onboarding recovery | Medium | Add resend verification, onboarding state messaging, attribution capture | UI, auth, notifications | Signup drop-off | Progressive onboarding |
| `/auth/signin`, `/auth/verify`, `/auth/error` | Client, trainee applicant | Sign-in does not require verified email; booking alone enforces verification; verify page handles token but no resend | Explicit account-state machine: pending verification, verified, locked, approved | Auth copy and runtime behavior drift | Medium | Either hard-gate sign-in until verify or clearly support unverified state with resend/recovery | Auth, UI, notifications | Confusion and support burden | Account state machine |
| `/auth/forgot-password` and `/auth/reset-password` | Client, trainee, admin | Reachable and wired; no operator visibility into auth recovery events | Password recovery plus security-event logging and ops visibility | Functional but not operationally observable | Low | Log password-reset events and add admin security-event visibility | Auth, audit, ops | Security blind spots | Auth event logging |
| `/trainee-application` Step 1 account creation | Trainee applicant | Step advance auto-registers and auto-signs in as `CLIENT`; applicant identity lives as a client until admin approval | Applicant-specific onboarding state with explicit pending-applicant role/status | Applicant lifecycle is overloaded onto `CLIENT` | High | Add applicant state, applicant dashboard, explicit verification requirements, separate onboarding funnel semantics | Auth, schema, RBAC | Supply onboarding ambiguity | Applicant state machine |
| `/trainee-application` Step 2 office/location | Trainee applicant | Collects practice/location fields, but no market/jurisdiction enforcement | Geography-aware launch rules, service-area gating, local policy requirements | No market boundary control while product copy mixes DACH and US signals | High | Pick one launch geography, enforce locale/currency/legal settings, validate service region at onboarding | UI, schema, compliance, GTM | Compliance and positioning drift | Market-configured onboarding |
| `/trainee-application` Step 3 public profile + R2 uploader | Trainee applicant, approved trainee | Only profile-photo upload is mounted; upload APIs support `CERTIFICATION`, `IDENTIFICATION`, `CLINICAL_NOTE`; public directory reads `TraineeApplication.profilePhotoUrl`, admin reads `Document` records | Required credential/doc upload checklist with verification status and publish gates | Credential/doc lifecycle is not operational; profile asset source-of-truth drifts | Critical | Add certification/ID upload UI, document verification queue, expiration/status actions, single canonical profile image source | UI, API, storage, schema | Unsafe provider launch | Document collection + verification queue |
| Approved-trainee profile edits after approval | Approved trainee, admin | Approved trainees can revisit `/trainee-application` and mutate live profile fields; directory reads the same approved application record | Post-approval edits should route through moderation or draft/publish flow | Reviewed public profile can change without re-review | High | Split draft vs published profile, add moderation queue, lock sensitive fields without admin approval | UI, API, schema, ops | Trust risk and false "reviewed profile" claims | Draft/publish moderation |
| `/trainee-application` Step 4 agreements, referrals, submission | Trainee applicant | Agreement economics and SLA are hardcoded in UI; referrals are collected but never verified; checkbox booleans are the only acceptance record | Versioned agreements with signature evidence and configurable commercial terms | Hardcoded business terms; weak legal evidence | High | Store agreement version, acceptedAt/IP, configurable commercial settings, referral-request lifecycle | UI, schema, audit, ops | Legal disputes and brittle operations | Versioned agreements + e-sign capture |
| Missing `/supervisor` and supervisor workflow | Supervisor, admin, trainee | `SUPERVISOR` exists in Prisma, proxy, and admin role picker; no routes, dashboards, assignments, notes, or signoff flows exist | Supervisor assignment, review queue, signoff, escalation, notes, reporting | Core business promise is structurally absent | Critical | Add supervisor-user relationships, review tasks, signoff records, escalation workflows, supervisor dashboard | Routing, UI, schema, RBAC, ops | Product promise is fake; major trust/compliance blocker | Supervision-native workflow |
| Missing client account portal/dashboard | Authenticated client | Clients can book and later access `/session/[id]` if they know the link; no route lists bookings, receipts, refunds, or history | Client portal for upcoming/past sessions, payment receipts, reschedule/cancel, therapist switch, support | Core customer lifecycle has no home | Critical | Add `/client` dashboard, booking history, receipt download, support and switch-request flows | UI, routing, payments, notifications | High abandonment and support load | Customer portal |
| `/booking` auth and verification gate | Prospective client, client | Redirects unauthenticated users to sign-in; blocks unverified users; no inline resend/repair path | Gated checkout with verification recovery and return-to-book continuity | Recovery UX missing at the purchase edge | Medium | Add resend verification, booking intent persistence, return-to-checkout state | UI, auth, notifications | Checkout drop-off | Gated checkout with recovery |
| `/booking` slot selection and scheduling | Client, trainee | Real slot validation uses provider availability and unavailable slots; availability update API exists but UI only offers add/delete; no timezone or buffer management | Full scheduling rules engine with edit, buffers, windows, timezone normalization, admin override | Scheduling CRUD and policy controls are incomplete | High | Add edit existing availability, buffers, timezone prefs, lead-time and no-show policies, admin override | UI, API, schema | Scheduling errors, low utilization | Availability rules engine |
| `/booking` checkout and payment confirmation | Client | Session and `Payment` records are created before Stripe checkout; success relies on webhook then polling `/api/payments/confirm`; failed/abandoned holds depend on webhook expiration | Booking hold with expiry, recovery email, idempotent payment lifecycle, finance console | Inventory can be tied up before payment; no recovery or ops visibility | High | Add `PENDING_PAYMENT` booking hold state, expiry job, recovery flow, payment ops dashboard, webhook observability | Payments, jobs, UI, ops | Lost inventory and revenue | Hold-expiry + webhook-confirmed booking |
| `/session` index route | Client, trainee | Informational shell only | Redirect to relevant dashboard or remove entirely | Dead-end route | Medium | Replace with contextual redirect or remove from nav/surface | Routing, UI | Confusion | Contextual redirect |
| `/session/[id]` video room | Client, trainee, admin | App route checks participants/admin, but iframe uses deterministic Jitsi room name `TherapyBook-{session.id}` with no visible room password/JWT/waiting room | Authenticated telehealth room with access controls, join logs, consent, supervisor options | Session room model is too weak for healthcare trust | Critical | Use secure telehealth provider or Jitsi JWT/password/waiting-room model, log joins, add consent and incident flow | Video, auth, compliance, audit | Confidentiality risk; non-shippable care delivery | Authenticated telehealth session |
| `/session/[id]` session management panel | Client, trainee, admin | Reschedule/cancel goes through `pages/api/sessions/[id].ts`; 24-hour rule enforced; payment is untouched; client-only notifications for cancel/reschedule; rating route exists elsewhere but no UI | Complete post-booking lifecycle with refund/credit logic, participant notifications, audit, feedback | Cancellation/reschedule changes the appointment but not the money | Critical | Add policy engine for refunds/credits, participant notifications to both sides, audit on the used path, post-session rating UI | UI, API, payments, notifications, audit | Disputes, manual ops, trust loss | Post-booking lifecycle engine |
| `/trainee-dashboard` overview | Approved trainee | Shows basic counts and application status | Task-driven provider home with document, supervision, payout, and session actions | Dashboard is informational, not operational | High | Add pending tasks, approval blockers, payout status, supervisor tasks, completion CTAs | UI, ops, schema | Weak provider activation | Role-based home dashboard |
| `/trainee-dashboard` availability manager | Approved trainee | Can create/read/delete recurring availability and unavailable slots; no edit existing availability | Full CRUD calendar management | Update path exists in API but not in UI | Medium | Add inline edit, duplicate, bulk actions, timezone preview | UI, API | Provider friction | Full CRUD calendar settings |
| `/trainee-dashboard` upcoming/history sessions | Approved trainee | Lists sessions; notes field exists in API but no UI; rating flow is dead; "join link" is internal session page | Provider session closeout with notes, completion, ratings, follow-up, payout visibility | Session lifecycle ends at listing | High | Add therapist notes UI, complete/no-show CTA, feedback capture, payout state, session actions | UI, API, schema | Compliance and retention gap | Closeout workflow |
| `/admin` dashboard | Admin | KPI cards derive mostly from users and applications | Ops dashboard with bookings, payments, reminders, docs, SLA, refunds, incidents | Admin cannot actually run the marketplace from the home screen | High | Add metrics for GMV, payment failures, queue aging, document backlog, utilization, support backlog | UI, analytics, ops | Blind operations | Ops command center |
| `/admin/applications` queue | Admin | Filterable list of applications | Reviewer assignment, SLA aging, internal notes, bulk actions, document readiness | Thin queue tooling | High | Add queue ownership, aging, notes, filters by missing docs/supervisor, bulk review actions | UI, ops | Slow supply activation | Queue-based review tooling |
| `/admin/applications/[id]` detail and decisions | Admin | Can mark `UNDER_REVIEW/APPROVED/REJECTED`; approval auto-promotes user to `TRAINEE`; documents are view-only | Approval should require verified docs, supervisor assignment, checklist completion, and decision audit | Unsafe approval path with no publish prerequisites | Critical | Add approval checklist, document verify/reject actions, supervisor assignment requirement, approval reasoning | UI, API, schema, RBAC, ops | Unsafe supply launch | Gated approval workflow |
| `/admin/users` role and verification management | Admin | Can change role and `emailVerified`; no suspend/archive/deactivate/support/finance roles | Full lifecycle admin console with scoped internal roles and reasons | Internal RBAC is too coarse and user lifecycle is incomplete | High | Add suspend/archive, support and finance roles, reason capture, least-privilege controls | UI, schema, RBAC, audit | Ops risk and weak internal controls | Lifecycle admin console |
| `/admin/sessions` session ops | Admin | Can update statuses on recent sessions; payment shown only as context | Combined session-payment case view with refunds, reminders, no-show handling, notes, audit drill-in | Admin can change status but not resolve money or trust issues | High | Add composite session cases, refund/credit actions, resend reminders, notes/audit side panel | UI, API, payments, notifications | Manual work and slow support | Case management view |
| Missing `/admin/payments`, `/admin/documents`, `/admin/audit` | Admin, finance, compliance | Prisma models and workflows imply these consoles; no routes exist | Finance, compliance, and audit back office | Back office missing for core live-business data | Critical | Add dedicated payments, documents, audit-log consoles with filters/export/actions | Routing, UI, ops | Non-viable operations | Back-office modules |
| `/api/users/profile` | Client, trainee | GET is used by booking and trainee dashboard; PUT exists but no mounted self-serve editor | Account settings page with profile, phone, image, notification prefs | Hidden API with no real UX | Medium | Add account settings UI and wire PUT path | UI, API | Stale data and poor self-service | Account settings CRUD |
| `/api/sessions/[id]/rate` | Client | Route exists and writes rating/audit if called; no mounted UI uses it | Post-session feedback flow | Dead quality loop | Medium | Add rating CTA after completed session or delete route | UI, API, schema | No product learning loop | Customer feedback workflow |
| `pages/api/sessions/reminders` and BullMQ worker | Client, trainee, admin | Cron endpoint exists; no in-repo scheduler invokes it; no sent flags on sessions; reminders email clients only; queue worker is unused | Scheduled, idempotent, observable reminder system for both sides | Reminder system is partial and can miss or duplicate sends | High | Add scheduler, sent markers, retries, both-party reminders, alerting, and queue usage or remove queue code | Jobs, notifications, schema, ops | Missed sessions and support burden | Event-driven messaging |
| Audit, document, payment, and referral schemas vs live ops | Admin, trainee, client | `AuditLog`, `Document`, `Payment`, `Referral` exist, but operational UIs are partial or absent | Every persisted business entity should have lifecycle coverage | Schema models outpace product lifecycle coverage | High | Build model-by-model CRUD/approval/archive surfaces or remove unused scope | Schema, UI, API | Half-built product perception | Lifecycle-complete entity design |

## 3. Top 15 Product Failure Risks

1. **Supervision is a core promise, but there is no supervisor workflow.**
2. **Clients have no account hub after booking, so the post-purchase lifecycle is effectively ownerless.**
3. **Session cancellation/reschedule does not trigger refunds, credits, or payment adjustments.**
4. **The video room model is too weak for healthcare trust because the underlying Jitsi room is deterministic and not visibly access-controlled.**
5. **Provider approval is not gated by document verification or supervisor assignment.**
6. **Approved trainees can edit live directory/profile data after approval without re-review.**
7. **There is no admin finance/documents/audit back office, so real operations cannot scale.**
8. **Consent and audit claims exceed the actual durable evidence stored by the system.**
9. **Reminder infrastructure is partial: no scheduler in-repo, no sent flags, client-only reminders.**
10. **Pricing, economics, and business terms are hardcoded, which blocks real commercial operations.**
11. **The product mixes German/EU legal/currency cues with broader marketplace ambitions, weakening compliance and GTM clarity.**
12. **Discovery and matching are too thin to compete with mature marketplaces and directories.**
13. **No payout/earnings workflow exists for trainees or supervisors, so unit economics are not operationalized.**
14. **No automated test suite or end-to-end release safety net exists for core journeys.**
15. **Marketing copy currently overclaims reviewed/supervised/session-quality controls that the code does not yet implement.**

## 4. Mock and Hardcoded Data Inventory

**Public pricing and trust surfaces**
- `/pricing`: session price and "traditional therapy" comparison are hardcoded; FAQ promises therapist switching and supervision quality. This misleads users and blocks dynamic pricing.
- `lib/pricing.ts`: default session price/currency are hardcoded. This blocks market-by-market pricing and margin control.
- `components/LandingPage/Testimonials.tsx`, `components/Common/TrustBadges.tsx`, and parts of the footer: trust copy implies more complete compliance and supervision operations than the product currently has. This misleads users.

**Matching and discovery**
- `/matching`: scoring is a client-side heuristic over keyword overlap and availability. It is not a real matching engine and should not be marketed as one.
- `utils/trainee-form-constants.ts`: specialties/languages/orientations are code-managed taxonomy, not admin-managed master data. This blocks ops agility.

**Supply onboarding and commercial terms**
- `Step4Agreements.tsx`: commercial split, SLA, and minimum-session commitments are embedded in frontend code. This is a shipping blocker for real legal/commercial operations.
- Public directory pricing on cards is derived from the same hardcoded session price, not provider/product configuration.

**Compliance and consent**
- `lib/store/consent.ts` and `components/gdpr-banner.tsx`: consent is browser-local only. That is not durable legal evidence.
- `/privacy`: claims around operational audit/session-note/document handling are only partially true in the implemented lifecycle.

**Profile/document drift**
- Profile imagery can live in `User.image`, `TraineeApplication.profilePhotoUrl`, and `Document` records. That is not mock data, but it is hardcoded source-of-truth drift that will produce inconsistent public/admin views.

## 5. Dead/Unwired Components and Routes

**Mounted but broken or misleading**
- `/session`: informational dead-end instead of a real navigation node.
- `/session/[id]` management panel: cancellation/reschedule works at the appointment layer but not at the payment/refund layer.
- `/admin/applications/[id]`: documents are view-only even though document statuses imply a verification workflow.
- Booking success state confirms payment but does not route the client into any ongoing account-management surface.
- `TherapistDirectory` availability filter supports `busy`, but `/api/providers` never emits it.

**Unmounted but clearly intended**
- `components/TraineeApplication/StepNavigation.tsx`
- `components/ui/command.tsx`
- `components/ui/popover.tsx`
- `components/ui/slider.tsx`
- `components/ui/index.ts`
- `lib/jobs/workers/notificationWorker.ts`
- `lib/services/AuditService.ts`
- `lib/db/dexie-store.ts`
- `lib/error-handling.ts`
- `lib/image-utils.ts`

**Routes/APIs that exist but are not part of a real user journey**
- `/supervisor` and `/api/supervisor/*`: protected in proxy, but no implementation exists.
- `app/api/sessions/[id]/cancel`: duplicate cancel path, not used by mounted UI.
- `app/api/sessions/[id]/rate`: fully implemented route with no mounted caller.
- `pages/api/users/profile` `PUT`: usable API, no mounted settings page.
- `pages/api/therapists/[id]/availability` `PUT`: update path exists, no mounted edit UI.
- `pages/api/sessions/[id]` `DELETE`: appears unused by mounted UI.
- `pages/api/sessions/reminders`: no scheduler in-repo.
- `pages/api/health`: no in-repo monitoring or alerting uses it.

## 6. Schema Models Missing Operational UI

| Model | Create | Read | Update | Delete / Archive | Roles with actual lifecycle | Missing market-ready UI / ops |
|---|---|---|---|---|---|---|
| `User` | Partial | Partial | Partial | No | Client register; trainee applicant creation via onboarding; admin list/update | Client settings, suspend/archive, reverification on email changes |
| `TraineeApplication` | Yes | Yes | Partial | No | Applicant and admin | Approval checklist, moderation after approval, archive/reopen lifecycle |
| `Referral` | Partial | Partial | Partial | Partial | Applicant via Step 4; admin read | Standalone referral verification/contact flow |
| `Session` | Yes | Yes | Partial | No | Client booking; trainee/admin read; admin status patch | Refund/credit engine, no-show policies, notes UI, archive/reporting |
| `TherapistAvailability` | Yes | Yes | API-only partial | Yes | Approved trainee | Mounted edit UI, admin override, richer scheduling rules |
| `UnavailableSlot` | Yes | Yes | No | Yes | Approved trainee | Edit UI, policy tagging, admin controls |
| `Payment` | Auto-create only | Partial | Webhook-only partial | No | Client payment confirmation; admin session context | Refunds, payouts, receipts UI, finance console, reconciliation |
| `Document` | Partial | Partial | No | No | Profile-photo upload only; admin read-only | Credential uploads, verify/reject actions, expiration and retention controls |
| `AuditLog` | Partial system-only | No UI | No | No | Some admin App Router routes and dead rating/cancel routes | Audit viewer, exports, broader event coverage, DSR tooling |

## 7. Role and Permission Coverage Matrix

| Role | Routes / Actions That Actually Work | Critical Missing Workflows |
|---|---|---|
| Visitor / marketing lead | Can view marketing pages, directory, matching, pricing, privacy/impressum, start trainee application | No assisted conversion, no provider detail pages, no lead capture, no support/contact-sales path |
| Prospective client with account, unverified | Can sign in, browse booking page, use forgot/reset password | No resend-verification path, cannot convert smoothly into checkout, no account home |
| Authenticated client, verified | Can book a session, pay, access own session route if link is known | No client dashboard, no receipts, no refund flow, no therapist switch request, no ratings flow |
| Trainee applicant | Can complete 4-step application and submit; admin can review it | No document checklist/verification, no applicant dashboard, no supervision assignment, no signed agreement evidence |
| Approved trainee therapist | Can access trainee dashboard, manage availability, see session list, join sessions | No notes workflow, no payout/earnings, no document tasks, no supervision workflow, no moderated profile edits |
| Supervisor | Can exist in enum and admin role picker only | No routes, assignments, queue, notes, approvals, or reporting |
| Admin / operations | Can view dashboard, applications, users, sessions; change statuses/roles | No payments console, no documents verification queue, no audit viewer, no support/finance role separation |
| Support / finance / compliance operator | Not implemented as roles | Entire role family is missing |

## 8. Competitive Market Analysis

Public product/pricing pages below were accessed on **March 28, 2026**. Product/pricing facts are source-backed from the linked pages; the "better than TherapyBook" and differentiation columns are my inference from those facts plus the audited codebase. Where public sites do not disclose exact pricing, I mark pricing as non-public.

| Competitor | Category | Target ICP | Pricing / Monetization Model | Core Strengths | Core Weaknesses | What They Do Better Than TherapyBook | Where TherapyBook Can Differentiate |
|---|---|---|---|---|---|---|---|
| [Psychology Today](https://www.psychologytoday.com/) | Therapist directory | Therapists seeking leads; clients browsing broad supply | Provider-subscription directory; public join flow pricing is around `$29.95/mo` on public signup materials | Massive supply density, recognizable brand, simple discovery | Weak workflow depth after lead generation | Far better supply depth and search liquidity | TherapyBook can own lower-cost supervised-trainee care, not broad directory scale |
| [BetterHelp](https://www.betterhelp.com/advice/therapy/how-much-does-betterhelp-cost/) | Therapy marketplace | Direct-to-consumer online therapy | Official pricing article: roughly `$70-$100/week`, billed every 4 weeks | Consumer brand, always-on therapy framing, strong retention model | Less provider choice transparency; mixed quality perception | Better conversion funnel, retention, account lifecycle, and support | TherapyBook can win on transparent supervised-trainee positioning and lower per-session entry price |
| [Talkspace](https://help.talkspace.com/hc/en-us/articles/360056145232-How-much-does-Talkspace-cost) | Therapy marketplace / tele-mental-health | Consumers, employers, health plans | Out-of-pocket pricing publicly disclosed on official help pages | Multi-product care model, strong consumer ops, mature billing flows | More complex and more expensive for simple low-acuity therapy | Better auth, billing, post-booking account management, and care operations | TherapyBook can stay simpler and cheaper for a narrower low-acuity wedge |
| [Alma](https://helloalma.com/for-providers/) | Provider enablement + directory + marketplace | Independent licensed therapists | Official public pricing: `$125/mo` or `$1,140/yr` membership | Strong provider value prop, referrals, practice tools, telehealth/admin | Geared to licensed clinicians, not trainee supply | Better provider acquisition and provider tooling | TherapyBook can own trainee-specific onboarding and supervision economics |
| [Headway](https://headway.co/) | Insurance-enabled marketplace / practice platform | Patients using insurance; clinicians seeking payer admin help | Insurance-first model; public provider materials emphasize no-cost platform, patient copay transparency, and payer admin rather than subscription pricing | Insurance handling, provider admin, strong trust signals | Hard to differentiate on insurance marketplace scale | Better payment/admin ops, provider tooling, and patient trust | TherapyBook should avoid competing on insurance and focus on cash-pay supervised trainees |
| [Grow Therapy](https://growtherapy.com/) | Insurance-enabled marketplace | Patients wanting faster access; providers wanting payer/admin help | Insurance/copay marketplace; exact public pricing not clearly disclosed | Fast-access positioning, payer/admin support, mobile/client operations | Less differentiated if you lack insurance leverage | Better scheduling, provider admin, and marketplace ops maturity | TherapyBook can differentiate on affordability plus supervision transparency |
| [Rula](https://www.rula.com/) | Insurance-enabled therapy marketplace | Patients using insurance; therapists/psychiatrists | Official public copy highlights average copay under `$25`; public cash-pay pricing is also disclosed on patient pages | Fast access, payer integration, strong patient pricing clarity | Insurance complexity and broad-scope operations | Better pricing transparency, provider supply, and booking confidence | TherapyBook can compete only as a narrower, cheaper supervised-trainee option |
| [SonderMind](https://www.sondermind.com/) | Marketplace + telehealth + care ops | Insurance and cash-pay therapy seekers | Insurance-based; exact public pricing varies and is not uniformly disclosed | Mature session operations, telehealth trust, stronger follow-through | Broad category, less niche focus | Better care-delivery operations and post-booking lifecycle | TherapyBook can differentiate on trainee supply and education-linked supervision, if real |
| [Zocdoc](https://www.zocdoc.com/) | Discovery + booking marketplace | Healthcare providers needing patient acquisition | Public provider materials describe pay-per-new-patient booking fees rather than subscription-only pricing | Powerful booking/search distribution and urgency demand capture | Generalist healthcare marketplace, weak therapy specialization | Better search liquidity, scheduling, and acquisition engine | TherapyBook can focus on therapy-specific trust and supervised affordability |
| [SimplePractice](https://www.simplepractice.com/pricing/) | Practice management / scheduling / intake / billing | Solo and small-group practices | Official pricing starts at `$49/$79/$99` monthly; payments and add-ons layered on top | Deep admin completeness: intake, calendar, billing, telehealth, portal | Not a demand-generation marketplace | Better operational completeness across the entire care lifecycle | TherapyBook should copy the lifecycle completeness, not the feature sprawl |
| [Jane](https://jane.app/pricing) | Practice management / scheduling / telehealth | Health practices and clinics | Official pricing publicly listed by plan on the pricing page | Strong scheduling, telehealth, clinic ops, polished admin workflows | Not marketplace-led demand gen | Better calendar/admin maturity and clinic usability | TherapyBook can stay demand-led and trainee-specific while adopting Jane-level ops rigor |
| [Motivo](https://www.motivohealth.com/) | Supervision marketplace / supervision infrastructure | Supervisees, supervisors, clinics | Supervision marketplace and program model; exact public pricing is not front-and-center | Real supervision network, supervisor discovery, supervision-native workflow | Not a full client marketplace | Better supervision credibility and workflow than TherapyBook by a wide margin | TherapyBook can combine client demand plus supervision only if it actually builds the supervision layer |

Practice-management note: even without a full table row for every vendor, **TheraNest/Ensora belongs in the same benchmark set as SimplePractice and Jane** for operational completeness. TherapyBook is materially behind that category on billing, intake, client portal, and admin controls.

## 9. Market Positioning Recommendation

- **Best category to win first:** supervised-trainee therapy marketplace, not general online therapy and not full practice-management software.
- **Best ICP to focus on first:** cash-pay, cost-sensitive adults with mild-to-moderate anxiety, stress, adjustment, or relationship concerns in one launch geography.
- **Sharpest value proposition:** "Lower-cost video therapy with approved trainee therapists under visible supervision, fast booking, and transparent quality controls."
- **What to explicitly avoid trying to be:** a BetterHelp clone, a nationwide insurance marketplace, a general telehealth platform, or a full EHR/practice-management suite.

Because the current product already uses `EUR`, German emergency/legal framing, and GDPR-style copy, the **least-friction launch path is one DACH-market cash-pay wedge**, not a US-style insurance marketplace.

## 10. Pricing and Business Model Recommendation

- **Do not launch at `EUR 40/session` if supervision is real and TherapyBook is paying for ops/support.** The margin is too thin once payment fees, support, supervision, and acquisition are included.
- **Recommended launch price:** `EUR 49` intro session, `EUR 59` standard 50-minute session.
- **Recommended economics:** roughly `60%` trainee payout, `10%` supervision/quality reserve, `30%` platform gross share before fixed overhead. If partner institutions subsidize supervision, platform share can flex down.
- **What should be free:** directory browsing, matching, account creation, trainee application, and basic client portal.
- **What should be paid:** all therapy sessions; optional bundles only after you prove retention and attendance.
- **Operational assumptions required:** one geography, one currency, cash-pay only, low-acuity client scope, every provider manually approved, every provider assigned to a named supervisor, payouts only after completed sessions and refund window, support response within 2 business days.

If you later pivot to B2B2C with universities or training clinics, add a second monetization layer: **program fee per active trainee/supervisor seat**, then reduce marketplace take-rate.

## 11. Recommended Build Order To Make The App Truly Usable And Sellable

**Phase 1: must-fix to become real, Days 0-30**
- Pick one launch market, one currency, one legal/compliance stance; remove unsupported cross-market copy.
- Build the missing client portal with upcoming/past sessions, receipts, reschedule/cancel, and support entry point.
- Fix cancellation/payment lifecycle: booking holds, refund/credit logic, failed/abandoned checkout expiry, finance visibility.
- Replace or harden the session room with real access control, join logging, and consent handling.
- Add required credential/document upload and make approval impossible until docs are reviewed.

**Phase 2: must-have to launch, Days 31-60**
- Build the supervisor model: assignment, review, notes, signoff, escalation.
- Add `/admin/payments`, `/admin/documents`, and `/admin/audit`.
- Lock reviewed public profiles behind moderation or draft/publish review.
- Add reminder scheduler with sent flags, retries, both-side notifications, and alerting.
- Add analytics instrumentation and a minimal end-to-end smoke-test suite for signup, booking, payment, session join, and application approval.

**Phase 3: differentiators to compete, Days 61-90**
- Add provider detail pages with richer trust signals, next availability, and supervisor transparency.
- Turn matching into a persisted intake-to-assignment flow with admin override.
- Add ratings, feedback, therapist-switch workflow, and post-session follow-up loop.
- Add earnings/payout visibility for trainees and supervisor workload reporting.

**Phase 4: scale and optimization, Day 90+**
- Add program/clinic accounts if you pursue B2B2C.
- Add cohort analytics, liquidity dashboards, and automated ops playbooks.
- Expand geography only after market-specific legal/payment/compliance packaging is explicit.
- Consider insurance or broader care categories only after the core wedge has proven repeat-session retention.

## 12. Launch Checklist

**Product**
- Client portal exists and is the default post-booking destination.
- Supervision workflow is real, visible, and enforced.
- Approval is gated on verified documents and checklist completion.
- Cancellation, refund, no-show, and switch policies are published and operational.

**Engineering**
- Canonical APIs are chosen and duplicate/stale endpoints removed.
- Webhooks, reminder jobs, and payment recovery paths are observable.
- Smoke tests cover signup, verification, booking, checkout, webhook completion, session join, and admin approval.
- Monitoring/alerting exists for auth, payments, reminders, uploads, and video join failures.

**Operations**
- Admin payments, documents, and audit consoles exist.
- Queue ownership and SLA tracking exist for trainee applications.
- Support workflows exist for refunds, failed bookings, therapist switches, and session disputes.
- Provider/supervisor payout rules are defined and documented.

**Compliance / trust**
- Server-side consent and policy acceptance are recorded.
- Session-room access is authenticated and logged.
- Emergency/crisis scope is clearly stated and consistent with actual service boundaries.
- Legal pages are complete for the launch market.

**Analytics**
- Funnel events exist for landing -> directory -> booking -> checkout -> paid booking -> session completed.
- Supply-side events exist for application started/submitted/approved/live/booked.
- Ops events exist for reminders sent, refunds issued, and review SLA breaches.
- Marketplace liquidity metrics are visible daily.

**Support**
- Support ownership and SLA are published.
- Refund and booking-recovery scripts exist.
- Client and provider help paths are visible inside the product.
- Escalation path exists for safety/session incidents.

## 13. Success Metrics

- **Activation:** visitor-to-directory CTR, matching completion rate, account signup rate, verified-email rate, trainee application completion rate.
- **Booking conversion:** verified-client to slot-selected rate, slot-selected to checkout-start rate, checkout completion rate, abandoned hold expiry rate.
- **Payment capture:** webhook success rate, payment failure rate, average refund turnaround, percentage of bookings needing manual payment intervention.
- **Session completion:** paid booking-to-attended-session rate, no-show rate, cancellation rate, join-failure rate, reminder send success rate.
- **Supply utilization:** approved-trainee-to-live-profile rate, median time from approval to first booking, available-hours-to-booked-hours fill rate, sessions per active trainee per week.
- **Marketplace liquidity:** median time to next available appointment, percentage of client searches with at least 3 viable matches, provider response/acceptance speed if you add assignment workflows.
- **Retention:** first-session to second-session rebook rate, 30-day client retention, 90-day client retention, average sessions per retained client.
- **Economics:** contribution margin per completed session, blended LTV/CAC, CAC payback period, refund rate, support cost per completed session.
- **Admin workload:** application review SLA, manual interventions per 100 bookings, support tickets per 100 bookings, document-verification backlog age.

Working assumption for day-one economics: target **LTV/CAC > 3x**, **CAC payback < 3 months**, and positive contribution margin **after** supervisor reserve and payment fees, not before.

## 14. Final Recommendation

The current product should **stay private beta**.

The path out is not "ship a few more features and launch broadly." It is: **narrow the wedge, make the supervision/payment/client lifecycle real, and then launch a much smaller, sharper product**. If you do that, TherapyBook can become commercially credible as a supervised-trainee therapy marketplace in one market. If you do not, it will read as a polished demo with unsafe operational gaps rather than a real healthcare business.
