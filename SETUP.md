# Ketmon scaffold — what's here, what's missing

## Built in this pass
- `prisma/schema.prisma` — exact schema from the spec README §4
- `lib/pricing.ts` — time-band resolution (§3.3) + credit price matrix (§3.4) + Line A payout math (§3.6)
- `lib/booking-rules.ts` — 6h cancellation window, free-cancel/late-cancel/no-show outcomes (§3.7)
- `scripts/seed.ts` — Overpass fetch (cached to disk for reproducibility), two-tier supply strategy (§3.5), slot generation, demo personas
- `app/api/bookings/route.ts` — create booking, deduct credits
- `app/api/bookings/[id]/cancel/route.ts` — cancel with correct refund/forfeit
- `app/api/demo/route.ts` — presenter tool: mark attended/no-show, trigger Line B conversion
- `messages/ko.json`, `messages/en.json` — i18n stubs covering the golden path's copy

## Gaps found while scaffolding (flagging, not guessing)
1. **Free-cancel gym payout is unstated.** The spec says forfeited credits pay the gym, but doesn't say whether a *free* cancel (≥6h) pays the gym or not. I implemented "no payout on free cancel" (the slot can realistically be resold with 6h notice) — confirm this is the intended behavior before the demo.
2. **Distance sorting isn't specified.** The home screen needs "distance" as a sort/filter axis but the spec doesn't say how it's computed. Reuse plain haversine in application code (no PostGIS needed at this scale — see the earlier discussion on architecture options).
3. **No UI/component layer yet** — this pass is data + business logic + API routes only. Screens, the map component, the design system tokens, and the demo control panel's UI are not built.
4. **Supabase auth wiring isn't done** — Google OAuth callback route, session middleware, and role-based redirect (MEMBER → member home, OWNER → owner dashboard) are still needed.
5. **Owner revenue aggregation isn't built** — the Revenue screen needs a query that rolls up gym payouts + no-show compensation + commissions per gym; not yet written.
6. **The exact CTA copy/placement for "Convert to membership"** isn't specified — needs a decision on which screen surfaces it (member-side "become a member here" button vs. owner-side manual trigger) before building it.

## What to hand to a local model next
See `LOCAL_MODEL_PROMPT.md` — split into 6 parts sized for a 7B–14B local coding model, meant to be fed one at a time with this scaffold as context, each reviewed before moving to the next.
