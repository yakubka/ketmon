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

## Round 2 tasks — added after an audit found gaps in round 1

The owner asked for a full audit of the session against what actually shipped.
These are the gaps that land in your lane (don't overlap Claude's files below).
Do these after finishing your round 1 list above, same coordination rules apply.

### 5. Verify/fix: wallet plan cards still clipped
This was task 1 in round 1. Status is unknown — the owner posted a screenshot
*after* a fix was supposedly shipped showing the third (amber) plan card still
cut off at the edge, not the full "see all three at once, no scroll" outcome
that was asked for. Before doing anything else: check the actual current state
of `app/wallet/page.tsx` in this checkout (someone may have already fixed it -
check `git log -p -- app/wallet/page.tsx` for recent commits first). If it's
still a horizontal scroll row instead of a non-scrolling `grid-cols-3`, fix it
for real this time and confirm visually (or via computed styles) that all
three cards render with no overflow at a 375px viewport width before calling
it done.

### 6. Weekly calendar grid for booking (columns per day)
File: still don't edit `app/gym/[id]/page.tsx` directly — build
`components/WeeklyBookingGrid.tsx` standalone, Claude composes it in.

The owner asked for this repeatedly and it never landed: a real week-view
grid (columns = the next 7 days, like a calendar app week view) for browsing
scheduled-class slots, not the current day-strip-plus-list pattern. Keep it
information-light per the owner's own correction ("много инфы это мусор
буквально, просто на неделю показать, более грамотно по колонкам") - this is
NOT meant to show every slot with full detail, it's a compact overview: one
column per day, each cell showing just a time (or a couple of times) that
falls within the member's `preferredTimeBand` window, tappable to jump into
booking that slot. Pull `preferredTimeBand` from the `User` record the same
way `app/gym/[id]/page.tsx` already does (see its `preferredTimeBand` state -
read that file to see the fetch pattern, just don't edit it). Component props:
`activities` (from the gym's class activities + their slots for the next 7
days) and `onSelectSlot(slotId)`.

### 7. Slot crowd-level hint
Small addition to whatever slot-rendering component you're already touching
(the new weekly grid, and/or `GymReviews`/detail info block from round 1):
show a rough "busy" / "quiet" signal per time slot so a lazy user can avoid
peak crowds. `ClassSlot` already has `capacity` and `booked` - derive it
client-side, no schema change needed: `booked/capacity < 0.4` → quiet,
`> 0.75` → busy, otherwise don't show anything (don't clutter every slot with
a label, only flag the two extremes). Use short, plain language, no emojis,
through the i18n files as usual.

### 8. "You may also like" — adjacent-sport suggestions
New standalone component `components/YouMayAlsoLike.tsx` + a small helper
`lib/sport-similarity.ts` exporting a static adjacency map, e.g.:

```ts
export const SPORT_ADJACENCY: Record<string, string[]> = {
  pilates: ["yoga", "dance"],
  swimming: ["yoga", "crossfit"],
  yoga: ["pilates", "dance"],
  boxing: ["martial_arts", "crossfit"],
  martial_arts: ["boxing", "crossfit"],
  crossfit: ["gym", "boxing"],
  gym: ["crossfit", "martial_arts"],
  dance: ["pilates", "yoga"],
  tennis: ["gym", "crossfit"],
};
```

Component takes `favoriteSports: string[]` and `allGyms` (whatever shape the
`/api/gyms` response already has - read `app/home/page.tsx`'s `GymSummary`
type for the shape, don't edit the file) and renders a horizontal row of gym
cards whose sports overlap the adjacency suggestions but NOT the user's actual
favorites (the point is showing something *new*, not restating their
interests). Claude will place this on the home page below the main grid -
build and export it so it just needs an import and a props hookup.

### 9. Landing page copy pass
File: `app/page.tsx` is fine for you to edit directly - nobody else is
touching it this round.

Only the sport icons on the landing page got fixed this session; the actual
copy was never touched despite being asked for explicitly early on
("максимально привлечь пользователя лендосом", i.e. make the landing page
actually sell the product hard when someone finds it searching "switchfits").
Go through `messages/en.json` and `messages/ko.json`'s `landing` section and
rewrite for a stronger hook - lead with the no-contract/credits angle instead
of a flat feature list, sharpen the hero subtitle, make the three feature
blurbs concrete instead of generic ("Variety" / "Credits" / "Convenience" read
like placeholder headers). Keep the existing key names so `app/page.tsx`
doesn't need code changes, just better copy in both locale files.

### 10. Map page: marker photos, default center
Files: `components/MapContent.tsx`, `app/map/page.tsx` - fully yours now,
Claude was going to do this but the owner reassigned it to you.

Two concrete bugs, both untouched all session:
- `MapContent.tsx`'s `MapContainer` has `center={[37.4979, 127.0276]}` -
  that's Seoul (roughly Gangnam), not Incheon. Change it to Incheon Yeonsu
  (`[37.4106, 126.6784]`), matching `INCHEON_YEONSU` already used in
  `app/home/page.tsx` (read for reference, don't edit it). This only matters
  when geolocation fails/is denied - `UserLocationMarker` re-centers on the
  real user position when it succeeds, but Seoul is a bad fallback.
- Marker popups show only name + rating + a "Details" link - no photo. The
  `Gym` type in `MapContent.tsx` and the fetch in `app/map/page.tsx` don't
  even select `imageUrl` from `/api/gyms`. Add it to both, and render a small
  thumbnail (use the existing `GymImage` component at
  `components/GymImage.tsx` - it already handles broken-image fallback via
  the sport icon, reuse it rather than a bare `<img>`) in the Leaflet popup
  above the name/rating line.

Note: gym coordinates that were landing inside real parks/water have already
been fixed (commit `479eeb8`, checked against real OSM polygons, not just a
screenshot) - don't re-touch `scripts/seed.ts` coordinates for this task,
that part is done.

### 11. Progress-indicator stepper for onboarding
File: `app/onboarding/page.tsx` - fully yours now.

The owner pasted a full shadcn-style `progress-indicator.tsx` component early
in the session (framer-motion, animated dot progress bar that expands per
step, a Back button that slides in after step 1, Continue/Finish morphing
button) and it was never integrated - onboarding still uses four static
`bg-teal-500`/`bg-slate-200` dots with no animation and no back-navigation.
Install `framer-motion` if not already present (check `package.json` first -
it may already be there from the dock nav work). Adapt the component's visual
language (animated progress fill, Back/Continue buttons) to drive the
existing 4-step onboarding state (`step`, `setStep` in
`app/onboarding/page.tsx`) instead of its own internal `useState` - the
existing step content (name/sports/time/plan panels) and their validation
guards (e.g. can't leave the name step without `userId` and a non-empty name)
must keep working exactly as they do now. Don't change the save logic
(`saveName`, `saveProfileAndAdvance`, `handlePlan`), only the step-indicator
chrome and add a working Back button (currently there's no way to go back a
step at all).

### 12. Hover effect on home page gym cards
File: `app/home/page.tsx` - narrow, surgical exception. Do not touch anything
else in this file, and do not restructure it - this is a one-line class
change, in and out.

Find this in the card's image wrapper:
```
className="h-full w-full object-cover transition-transform group-hover:scale-105"
```
on the `GymImage` inside the gym card `.map()` in the grid render (search for
`aspect-[4/3]` to locate it fast). The owner asked for hover to cycle through
photos instead of zooming in. Currently there's only one photo per gym
(`imageUrl`), so a literal cycle isn't possible without also doing task 3a
from round 1 (the `images: String[]` field) - if you've already done that
task, wire real cycling here (swap the displayed image on a `setInterval`
while `:hover`, or a CSS-only multi-background crossfade). If you haven't
gotten to task 3a yet, do that first, then come back to this - don't ship a
fake "cycle" over a single repeated image. At minimum, drop the zoom
(`group-hover:scale-105`) even if you can't do real cycling yet, since the
owner was explicit that zoom is the wrong effect.

## NOT your tasks (Claude's lane this round — do not touch these files)

Nothing left in this lane as of this update - the owner moved every
remaining round-1 item to you (tasks 10-12 above). Claude is stepping back to
avoid duplicate work. If that changes, this section will say so.
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
