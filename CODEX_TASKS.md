# Switch — task handoff for Codex

This file is a work assignment for a second coding agent (Codex) working on this
repo in parallel with another agent (Claude) and the project owner. Read this
fully before touching anything. The goal is to move fast on a hackathon deadline
without two agents editing the same files or racing on the same database.

## Project in one paragraph

Switch (repo name `ketmon`, formerly branded Ketmon) is a no-contract fitness
credit marketplace: Next.js 14 App Router + TypeScript + Tailwind, Prisma ORM
against a Supabase Postgres, Supabase Auth (Google OAuth) for login, deployed on
Vercel with auto-deploy from `main` on GitHub (`yakubka/ketmon`). Users buy
credits, browse gyms/studios near Incheon Yeonsu-gu, and book class slots or
drop-in gym time. It's being demoed at a hackathon in Incheon very soon.

## Hard rules — do not violate these

- No comments in code (project convention, enforced by the owner).
- Never `git add -A` or `git add .` — stage specific files only.
- Never use `--no-verify`, `--amend` (unless asked), or force-push.
- All user-facing strings go through `messages/en.json` and `messages/ko.json`
  (both files, keep them in sync) via the `useMessages()` hook. No hardcoded
  UI strings, no emojis anywhere in the UI (use icons instead).
- Before any `prisma db push` or schema change: read `prisma/schema.prisma`
  first, and warn/confirm with the owner if the change could conflict with
  work the other agent might be doing on the same tables. See "Coordination"
  below.
- Run `npx tsc --noEmit -p tsconfig.json` and `npm run build` locally before
  considering a task done. The build has ESLint-as-error enabled
  (`next/core-web-vitals`) — an unresolvable `eslint-disable` comment
  (referencing a rule/plugin not configured in `.eslintrc.json`) will silently
  fail every production deploy. This exact bug already burned hours once this
  session — do not reintroduce it. Check `.eslintrc.json` before adding any
  `eslint-disable` comment.
- Commit messages: lowercase, imperative, no period, explain *why* not *what*,
  no `Co-Authored-By` trailer. Look at `git log --oneline -15` for tone.
- Never push directly if you're unsure whether the other agent has unpushed
  work — `git pull --rebase origin main` first, resolve conflicts carefully
  (see file ownership below to make conflicts unlikely in the first place).

## Coordination with the other agent (Claude)

Both agents work in the same git checkout on the same machine, against the
same live Supabase database. To avoid stacking duplicate work or corrupting
each other's changes:

1. **Stay inside your assigned files/areas only** (listed below). If a task
   needs a file outside your lane, stop and flag it instead of editing it.
2. **Before running any destructive DB operation** (delete, truncate, a
   `prisma db push` that drops/renames a column) — check `git log -p -- prisma/schema.prisma`
   for very recent changes first, since the schema may have moved under you.
3. **Commit and push in small increments**, one logical change per commit, so
   the other agent's `git pull` doesn't fight a giant diff.
4. **Do not touch**: `app/home/page.tsx`, `components/icons/SportIcons.tsx`,
   `components/WheelPicker.tsx`, `scripts/seed.ts`, `middleware.ts` — these are
   Claude's lane this round (see "NOT your tasks" below). If one of your tasks
   seems to require editing these, build your piece so it plugs in without
   modifying them (e.g., a new component that home/page.tsx will import later,
   built and tested standalone first).
5. When done with a task, mark it `[x]` in this file and commit that edit too,
   so progress is visible to everyone reading this file.

## Already done (do not redo, do not revert)

- Onboarding has 4 steps: name → favorite sports (icon grid, saves to
  `User.favoriteSports`) → time-of-day preference (`User.preferredTimeBand`,
  one of `morning`/`midday`/`evening`/`night`, see `lib/time-band.ts`) → plan.
- Real sport icons live in `public/icons/*.png`, wired through
  `components/icons/SportIcons.tsx`. Root `/icons` folder (project root, not
  `/public`) is the source the owner dropped the files in — it is NOT served
  by Next.js, don't reference paths under it directly from app code.
- Home page (`app/home/page.tsx`): search bar, sport filter chips, inline
  filter panel (`components/FilterSheet.tsx`, NOT a bottom sheet — this was
  changed on purpose, do not revert to a modal/sheet), responsive grid
  (2/3/4/5 columns depending on breakpoint), quick-book button per card using
  `nextSlot` data returned by `/api/gyms`.
- Gym detail page (`app/gym/[id]/page.tsx`): calendar-style day strip (not a
  plain list), drop-in "gym" sport activities use `WheelPicker` for time
  selection, scheduled classes sort with the member's preferred time band
  first and get a "fits your schedule" tag.
- Won (₩) amounts removed from credit-cost displays everywhere booking
  happens (gym detail, `BookingConfirmModal`) — kept ONLY on the wallet
  purchase cards, where real money is spent. Do not add ₩ back to booking UI.
- Google Calendar sync on booking already works end-to-end
  (`lib/google-calendar.ts`, called from `app/api/bookings/route.ts`) — no
  work needed here.
- Database: pruned to Incheon Yeonsu-gu only (30 gyms, all within ~8km of
  37.4106, 126.6784). `scripts/seed.ts` now self-prunes anything further out
  on reseed.
- Fixed a KST/UTC date-boundary bug (`lib/kst.ts`) that made "today" return
  zero slots for Korean users between midnight and 9am server-relative time.
- Fixed a build-breaking `eslint-disable` comment in `components/ui/chart.tsx`
  that silently failed every production deploy for hours.

## Your tasks (Codex) — do these, in this order

### 1. Wallet plan cards: fix clipping, make all three visible at once
File: `app/wallet/page.tsx` only.

Current state: three plan cards (Starter/Standard/Premium) in a horizontal
`overflow-x-auto` scroll row with `snap-x`. The owner has said twice now this
still looks clipped and wants **all three visible simultaneously, no
scrolling required** ("просто фулл картину разом видеть").

Fix: replace the horizontal-scroll flex row with a `grid grid-cols-3 gap-2`
(no `overflow-x-auto`, no snap). Shrink card internals to fit three columns
even on a narrow mobile viewport (~360-430px): smaller number font (try
`text-3xl` or `text-4xl` instead of `text-5xl`), tighter padding, shorter
labels. Keep the three distinct gradients and the "POPULAR" badge on
Standard. Keep the `~N visits` estimate line. Test at 375px width (iPhone SE)
and confirm nothing truncates or wraps awkwardly.

### 2. Bottom nav: compact "dock" style instead of the current full-width bar
New file: `components/icons/DockNav.tsx` (or similar name) that Claude will
wire into `components/NavBar.tsx` later — build it as a self-contained,
exported component so it drops in cleanly. Do not edit `NavBar.tsx` yourself.

The owner pasted this exact shadcn-style reference component and wants
something visually similar (small floating pill, not a page-width slab):

```tsx
"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface DockProps {
  className?: string
  items: { icon: LucideIcon; label: string; onClick?: () => void }[]
}
// ... (full component the owner supplied uses framer-motion float animation,
// backdrop-blur pill container, hover tooltip labels)
```

Install `framer-motion` (`npm install framer-motion`) — this is a new
dependency, the owner explicitly asked for this component and supplied the
code, so this is not a stack change, just an addition.

Constraints from the owner's feedback:
- Keep it at the **bottom** of the screen (do not move nav to the top).
- Make it visually smaller/more compact than the current full-width bar in
  `components/NavBar.tsx` — a floating pill, not a slab spanning the width.
- Darken it slightly so it's easier to notice against light page backgrounds.
- Use `components/icons/NavIcons.tsx` icons (Home/Calendar/Wallet/User) —
  don't introduce `lucide-react` icons for the actual nav items unless you
  also handle the active-route highlighting the current `NavBar.tsx` does
  (compare `usePathname()` against each link's `href`).
- Preserve the existing owner-only extra link behavior in `NavBar.tsx` (shows
  a switch-to-owner-dashboard link when `role === "OWNER"`) — your component
  should accept whatever `items` array is handed to it, that logic stays in
  `NavBar.tsx` when Claude wires it in.

Build and visually test this standalone (e.g., temporarily render it on any
page) since you can't safely edit `NavBar.tsx` yourself this round.

### 3. Gym detail page: photo carousel, address, amenities info
Files: `app/gym/[id]/page.tsx` is off-limits for direct edits (Claude's file
this round) — instead build these as new standalone components Claude will
compose in:
- `components/GymPhotoCarousel.tsx`
- Schema/data changes below

**3a. Multiple photos per gym (schema change — read carefully):**
`Gym` model currently has a single `imageUrl String?` field. Add
`images String[] @default([])` to `prisma/schema.prisma` (additive, does not
touch `imageUrl` — leave `imageUrl` as-is for backward compat, other code
still reads it). Run `npx prisma db push --skip-generate` then
`npx prisma generate`. **Before running `db push`: check
`git log -p -- prisma/schema.prisma` for any uncommitted/very recent change
from the other agent first** — if Claude is mid-schema-change, wait or flag it
instead of pushing over it.

Backfill: write a one-off script (put it in the repo root as
`scratch-<something>.mjs`, run it, then delete it — do not commit scratch
scripts) that sets `images` to 2-3 URLs per existing gym, reusing the
`GYM_IMAGES` pool already in `scripts/seed.ts` (copy the array, don't import
across a `.ts`/`.mjs` boundary awkwardly) plus its own `imageUrl` as the
first entry. Also update `scripts/seed.ts` itself so future reseeds populate
`images` (array of 2-3 URLs from `GYM_IMAGES`, decorrelated per gym like the
existing `imageUrl` assignment does with `(i * 7) % GYM_IMAGES.length`).

**3b. Carousel component using the owner's supplied embla-carousel spec:**
Install `embla-carousel-react`. The owner pasted a full shadcn `carousel.tsx`
+ demo — adapt it into `components/GymPhotoCarousel.tsx` taking `images:
string[]` as a prop, rendering each as a `<img>` (not Next `<Image>`, this
codebase doesn't use next/image elsewhere, stay consistent — check
`app/home/page.tsx` for the pattern: plain `<img>` with `object-cover`).
Square-ish aspect ratio per the owner's ask ("фотку в лево и чуть больше в
формате квадрата"), left-aligned in a two-column layout (photo left, info
right) that Claude will drop into the gym detail page layout — build it as an
isolated block so it composes easily (accept `className` for outer sizing).

Hover behavior the owner asked for: on hover, cycle to the next photo instead
of zooming in (current card hover elsewhere in the app zooms — this one
should cycle). On click, open a larger view using the same carousel (a simple
full-screen overlay is fine, reuse the carousel component).

**3c. Address and amenities data:**
`Gym.address` is `null` for every fallback-seeded gym (only the real-OSM seed
path ever set it). Add a synthetic but plausible address per fallback gym in
`scripts/seed.ts`: `"인천광역시 연수구 {area} " + a plausible street/building
number`. This is clearly-fictional demo data for a real neighborhood, not
meant to deceive — keep it simple, don't invent named streets that could be
confused with real currently-operating businesses.

Add these fields to the `Gym` model (additive, coordinate with Claude's
schema check same as 3a): `closesAt String?` (e.g. `"22:00"`),
`hasTrainer Boolean @default(false)`, `trainerFee Int?` (credits, nullable),
`hasParking Boolean @default(false)`. Populate plausible values per gym in
seed (randomize reasonably: ~40% have a trainer option, ~50% have parking,
closing hours in a realistic range like 21:00-23:00). Surface these in the
new right-column info block next to the photo carousel (small icon + text
lines): closing time, trainer available (with fee if any, in credits not
won), parking.

### 4. Reviews section on gym detail page
New Prisma model (additive):

```prisma
model Review {
  id        String   @id @default(cuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id])
  authorName String
  rating    Int
  comment   String
  createdAt DateTime @default(now())
}
```

Add `reviews Review[]` back-reference on `Gym`. Same schema-change caution as
above — check for concurrent changes before `db push`.

New API route `app/api/gyms/[id]/reviews/route.ts` — `GET` returns reviews
for a gym ordered by `createdAt desc`.

Seed 3-5 short reviews per gym in `scripts/seed.ts`, with rating/comment pairs
that make the gym's overall `rating` field make sense — e.g. a gym rated 3.5
should have a couple of reviews mentioning a real-sounding gripe (no windows,
stuffy, crowded at peak hours) alongside a positive one, not five generic
five-star blurbs. A 4.8-rated gym should read as consistently good. Write
these in Korean (matching the rest of the seeded content — see how gym/sport
names are bilingual-labeled elsewhere for tone), keep them short (1-2
sentences), no emojis.

New component `components/GymReviews.tsx` taking `gymId: string`, fetching
from the new route client-side, rendering author + rating + comment + relative
date. Claude will place this at the bottom of the gym detail page — build it
standalone.

Add i18n keys to both `messages/en.json` and `messages/ko.json` under a new
`reviews` section (`title`, `noReviews`) — keep both files in sync, this is
a hard rule above.

## NOT your tasks (Claude's lane this round — do not touch these files)

- `app/home/page.tsx`
- `components/icons/SportIcons.tsx` (mid-fix: crossfit and tennis icons)
- `components/WheelPicker.tsx`
- `scripts/seed.ts` **structure/generation logic** — you MAY append to it per
  tasks 3a/3c/4 above (new fields, new review seeding), but do not touch the
  day-of-week slot generation logic, that's Claude fixing a different bug
  (classes currently run every day at identical times — being changed to run
  on specific days only). If your edits land in the same file around the same
  time as Claude's, coordinate via a `git pull --rebase` before pushing and
  resolve any overlap by hand rather than force-pushing over either side.
- `middleware.ts`
- Anything about Google OAuth Console, Supabase Auth URL config, Vercel
  domain/team settings — these are dashboard-only, owner has to do them by
  hand, no agent has credentials for them.
- The recommendation-scoring bug (favorite sports not visibly affecting
  results) — Claude is investigating this.

## Open questions nobody has answered yet — don't guess

- RESOLVED: location basis stays Incheon Yeonsu-gu (37.4106, 126.6784), the
  Sadang (Seoul) mention was dropped by the owner — real venue data outside
  Incheon is genuinely too sparse/hard to get, owner confirmed sticking with
  Incheon rather than switching. Do not revisit this.
- "вместо звезды сделай стрелочки" (on the wallet page) — unclear what "the
  star" refers to, there's no star icon currently on the wallet page. Ask
  before guessing.
- Pulling real gym advertising photos from wherever venue data originates —
  not feasible. OSM/Overpass (the free real-venue-data source used in
  `scripts/seed.ts`) carries name + coordinates only, no photos. Stock photos
  are the realistic option for this demo; flag this to the owner rather than
  spending time trying to scrape photos from elsewhere.

## Access you'll need

- Full repo access (already implied).
- `.env` / `.env.local` in the repo root has `DATABASE_URL` (pooled, port
  6543, for the app) and `DIRECT_URL` (port 5432, required for
  `prisma db push` — the pooled connection rejects schema DDL with
  `P1017: Server has closed the connection`, use the direct one for any
  schema push). Both already point at the live Supabase Postgres — there is
  no separate staging database, you are working against the same data the
  owner and Claude are using. Be careful with anything destructive.
- No Vercel token needed for your tasks — you're not touching deploy config.
