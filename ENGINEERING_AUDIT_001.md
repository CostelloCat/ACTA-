# ACTA Engineering Directive 001 — Audit Response

**From:** Claude (Engineering)
**To:** Product & Operations (Ryan / ChatGPT), for approval
**Re:** Personalized Desk Foundation — architecture audit

**Status: NO CODE CHANGED.** This is the audit and proposal only, per the
stop condition. Every claim below was verified by reading the actual
source in this repo, not inferred from docs — where something surprised
me, I've called that out explicitly.

Companion doc: `PRODUCT.md` (North Star, WHAT/WHY/NEXT test, pillar
status). This audit is the architecture that has to carry that vision.

---

## AUDIT

### 1. Current application architecture

TanStack Start (file-based routing + server-side `createServerFn`s), React
19, Vite, Tailwind v4. ~20 routes under `src/routes/`, each a thin page
pulling from a matching `src/lib/*.ts` data module. `shell.tsx`/`mast.tsx`
are the persistent chrome. Zustand is installed and used once (`mode.ts`);
TanStack Query is a dependency but **unused anywhere** — no `useQuery` call
exists in the codebase. Clean, small, no dead routes or orphaned
components found outside what's flagged in §C.

### 2. Authentication

Better Auth is fully wired in `src/lib/auth/*` — Postgres-backed sessions
(Neon in prod, embedded PGLite in preview), an OAuth broker path plus
email/password, session-gate primitives (`SignedIn`/`SignedOut`/
`SignInGate`), and real test coverage (`gate-identity.test.ts`,
`sign-in-gate.test.ts`). It is well-built.

**But it is entirely inert**: there is no `/login` route and no
`/api/auth/$` catch-all route anywhere in `src/routes/`. `AuthProvider` in
`provider.tsx` is a literal no-op passthrough.

**Worth flagging directly**: the on/off switch defaults to **enabled** in
code — `authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false"` — when
the variable is simply absent. The intended "off by default" behavior
comes from a `.grok/app-env.json` file that only exists inside the Grok
sandbox and is gitignored — it is **not** in this GitHub repo. Practical
consequence: deploy this repo as-is to a fresh Vercel project without
explicitly setting `VITE_AUTH_ENABLED=false`, and the client will believe
auth is on and start rendering sign-in affordances against routes that
don't exist. This needs an explicit decision, not a default, before any
deploy outside the original sandbox.

### 3. User model

None beyond Better Auth's own identity tables. No app-owned profile table
exists. No `user_id` column exists anywhere in this codebase's schema,
because no app schema exists yet (see §4).

### 4. Database

`src/lib/db.ts` — Neon (`pg`) when `DATABASE_URL` is set, embedded PGLite
otherwise, with careful type-parity normalization (`int8`→number,
`date`→string) so preview and prod behave identically, HMR-safe singleton
init, and a migration runner (`scripts/migrate.mjs`) that applies
`migrations/*.sql` in order and tracks them in `_migrations`. This is a
genuinely solid, ready foundation.

**It has never been used for app data.** `migrations/` contains exactly
one file: `migrations/auth/0001_auth.sql` (Better Auth's own schema). Zero
app tables exist.

### 5. Existing watchlist functionality

`src/lib/desk-pins.ts`: a fixed catalog of 12 instruments (`PIN_CATALOG`);
the user toggles a subset, persisted to `localStorage` (key
`acta-desk-pins`) only — anonymous, single-device, no server round-trip,
no relevance concept beyond the order the user dragged them into. This is
the closest existing analog to a Desk Profile, and its shape (an ordered
slug list against a fixed catalog) is a reasonable seed — it just needs a
server-backed home.

### 6. Existing personalization

`src/lib/mode.ts`: a two-value Zustand store (`"learn" | "trade"`),
in-memory only, resets on every reload, never persisted, never tied to a
user. That is the entire personalization surface today.

### 7. Existing market-data structure

Two layers, and this is the most important finding for the Instrument
Influence Map (§E):

- **Live**: `levels.ts` (Yahoo Finance VWAP/prior-high-low/overnight-range/
  year-open per symbol) and `desk.ts` (index quotes). Server-only, now
  cached with sane TTLs (fixed in the prior pass).
- **Authored/qualitative**: `markets.ts`'s `BOOKS` map. Each instrument
  already carries hand-written `bias`, `levels`, and free-text `note`
  fields describing what actually drives it — e.g. NQ: *"Mag7 is the
  engine, NQ is the vehicle"*; gold: *"real rates... don't trade the 8:30
  if FOMC is the day"*; oil: *"Inventory Wednesday, geopolitics always"*;
  BTC: *"follows real rates and the dollar more than the white paper"*;
  XRP: *"policy tape. Court and ETF headlines > chart."* **This prose is,
  unlabeled, an existing Instrument Influence Map** — someone already did
  the domain thinking; it just isn't structured data yet.

### 8. News architecture

`desk.ts`: a fixed `region → RSS feed URL[]` map (9 regions), regex-based
RSS parsing (no XML dependency), a keyword-regex classifier (`tagWire`)
into OIL/RATES/INFLATION/MAG7/GEO/CRYPTO, per-region static fallback
content, now cached 60s. `filings.ts` pulls the live SEC EDGAR
current-filings feed. **No user targeting exists** — every visitor gets
the same wires regardless of what they trade.

### 9. Calendar/events

`calendar.ts`: a hand-curated, hard-dated `EVENTS[]` array (dated across
Sept 2026) with historical trading context per event (`context`,
`history`) and instrument tags (`hits`). This is static content, not a
live economic-calendar feed — it will need either a manual-update cadence
or a real calendar API before this survives past the current rollout
window (the same class of issue as the stale hardcoded date I fixed in
`tape.ts` last pass).

### 10. Sessions

`sessions.ts`: 3 fixed sessions (Asia/London/New York), hardcoded ET-hour
windows, pure date math, no persistence, not personalizable — someone who
only trades the NY session still sees all three with equal weight.

### 11. Current APIs

All `createServerFn`, all public/unauthenticated, all global (no user
identity in or out): `getDesk`, `getNameNews`, `getCryptoNews` (desk.ts) ·
`getLevels` (levels.ts) · `getMosaic` (channels.ts) · `getFilings`
(filings.ts) · `getPulse` (pulse.ts) · `askTape` (tape.ts — the one paid/AI
endpoint, rate-limited in the prior pass). None of these take or return
anything personalized today.

### 12. Existing AI functionality

`askTape` is the only AI feature: one xAI (`grok-4.5`) chat-completion
call, server-side, given the full static calendar as context, input capped
at 800 chars, now rate-limited (6/min/client, 60/min global — added last
pass). It answers a free-text question; it does not summarize live market
state, cite sources, or connect to the "why is X moving" composite concept
in PRODUCT.md yet.

Separately: `src/lib/app-data/*` is unused connector-gate scaffolding for
a **viewer's own Google/Microsoft/Notion data** — a generic platform
feature, unrelated to trading, not imported by any ACTA route or
component. It is dead code today (see §C).

---

## PROPOSAL

### A. KEEP

- Route-per-instrument structure and the `shell.tsx`/`mast.tsx` chrome.
- `db.ts` as-is — Neon/PGLite dual backend and the migration runner are
  exactly the right foundation for Desk Profile storage; they've simply
  never been asked to hold app data yet.
- The Better Auth wiring in `src/lib/auth/*` — don't rebuild identity, just
  finish switching it on (§2, §M Phase 0).
- The `markets.ts` `BOOKS` content — the authored insight is the seed of
  §E, not something to throw away and re-derive.
- `ttl-cache.ts` / `rate-limit.ts` (added last pass) — extend this pattern
  to any new personalized or AI-backed endpoint rather than inventing a
  second caching approach.
- `calendar.ts`, `desk.ts`, `filings.ts`, `levels.ts` data pipes exactly as
  they are — they become **inputs** to relevance scoring, not something
  relevance scoring replaces.

### B. MODIFY

- `desk-pins.ts`: keep the slug-catalog shape; move persistence from
  `localStorage`-only to a server-backed Desk Profile once auth is live,
  keeping `localStorage` only as the pre-login/anonymous fallback it
  already is.
- `mode.ts`: fold `"learn"/"trade"` into the Desk Profile as a stored
  preference instead of a state that resets on every reload.
- Instrument metadata currently duplicated across `PIN_CATALOG`
  (desk-pins.ts), `BOOKS` (markets.ts), and `YAHOO` (levels.ts): these
  three already disagree slightly in shape and will drift further under
  personalization. Consolidate into one instrument registry (§E) so a new
  instrument is added in one place, not four.
- `/socials` and `pulse.ts`: don't let relevance scoring consume these
  as-is — `/socials` is a link list, not a feed, and `pulse.ts`'s
  "sentiment" is VIX + Fear&Greed relabeled. Fix or clearly scope before
  wiring them into anything personalized (PRODUCT.md's "don't fake data"
  rule applies directly here).

### C. REMOVE or DEPRECATE

- `src/lib/app-data/*` (the unused connector-gate scaffolding) — confirmed
  zero imports from any route or component. Remove if nothing on ACTA's
  roadmap needs a viewer's own Google/Microsoft/Notion data; it's dead
  weight that will confuse the next contributor into thinking it's load-
  bearing.
- `src/lib/multiplayer/p2p.ts` (WebRTC room scaffolding) — also zero
  imports outside itself. Either this becomes the seed of the "Community"
  pillar from PRODUCT.md, or it should go. Don't let it rot as a third
  piece of unused platform scaffolding.
- Nothing else. The codebase is otherwise lean — no zombie routes or
  orphaned components turned up in this audit.

### D. Proposed Desk Profile data model

Additive migration, `migrations/0002_desk_profile.sql`, following the
existing house rule (snake_case, `user_id text` scoped, applied on both
Neon and PGLite by the existing runner):

```sql
create table if not exists desk (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  name text not null,                    -- "NQ Desk", "Oil Desk"
  trading_style text,                    -- 'day' | 'swing' | 'position', free text for now
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists desk_instrument (
  desk_id text not null references desk(id) on delete cascade,
  instrument_id text not null references instrument(id),
  priority integer not null default 0,   -- lower = higher on screen
  primary key (desk_id, instrument_id)
);

create table if not exists desk_source_pref (
  desk_id text not null references desk(id) on delete cascade,
  source_key text not null,              -- 'wire:Russia', 'youtube:federalreserve', ...
  enabled boolean not null default true,
  primary key (desk_id, source_key)
);

create table if not exists desk_layout (
  desk_id text primary key references desk(id) on delete cascade,
  layout jsonb not null default '{}',    -- saved module order/visibility
  notification_prefs jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists desk_user_id_idx on desk (user_id);
```

`desk` (not a single profile row) from day one, so "multiple desks" — an
explicit requirement in the directive — doesn't force a second migration
later.

### E. Proposed Instrument Influence Map

Additive migration, `migrations/0003_instrument_graph.sql`, seeded from
content that already exists in `markets.ts` (a data-entry pass over
existing prose, not new research):

```sql
create table if not exists instrument (
  id text primary key,           -- 'nq', 'cl', 'gold', 'btc', ...
  asset_class text not null,     -- 'index', 'energy', 'metal', 'crypto', 'rate', 'fx'
  label text not null
);

create table if not exists instrument_influence (
  instrument_id text not null references instrument(id),
  influenced_by text not null references instrument(id),
  weight real not null default 1.0,   -- ranking signal, not a precise beta
  relationship text,                  -- 'leads' | 'lags' | 'correlates' | 'inverse'
  note text,                          -- human-readable why, seeded from markets.ts
  primary key (instrument_id, influenced_by)
);

create table if not exists instrument_source (
  instrument_id text not null references instrument(id),
  source_key text not null,      -- 'fed', 'eia', 'opec', 'sec-edgar', 'wire:Crypto', ...
  weight real not null default 1.0,
  primary key (instrument_id, source_key)
);
```

Seed example, straight from `markets.ts`'s own `bias` text: NQ
`influenced_by` MAG7/DXY/10Y; oil `influenced_by` EIA/OPEC/DXY; BTC
`influenced_by` DXY/10Y ("real rates and the dollar"); XRP `influenced_by`
"headline"/legal rather than chart. This turns domain knowledge ACTA
already encodes as prose into the graph the ranking engine reads.

### F. Personalization flow through the existing app

1. **Onboarding** (new, minimal): pick instrument(s) → creates a `desk`
   row + `desk_instrument` rows, default priority seeded from
   `PIN_CATALOG`'s existing order.
2. The `/` route loader (or `__root.tsx`) fetches the active desk plus its
   `desk_instrument`/`desk_source_pref` rows server-side, alongside the
   existing `getDesk`/`getPulse`/`getLevels` calls it already makes.
3. A new **deterministic** function — `rankForDesk(desk, marketSnapshot,
   newsItems, events)` — merges `instrument_influence` weights with
   `desk_instrument.priority` into a sort order. Existing components
   (`mover-strip.tsx`, `book-news.tsx`, `next-print.tsx`) keep rendering
   the same data they do today, just pre-sorted/filtered by this function
   instead of showing everything to everyone.
4. `askTape` (and the future "why is X moving" composite from PRODUCT.md)
   reads the active desk to scope which correlated instruments/sources it
   pulls in — same endpoint, desk-aware input, not a new AI surface.
5. **Signed-out visitors see exactly today's behavior** — global, unranked,
   `desk-pins.ts` via `localStorage`. Personalization is additive; it never
   gates the product behind a login wall.

### G. Required database migrations

`0002_desk_profile.sql` and `0003_instrument_graph.sql`, both drafted
above, both additive, both leave `0001_auth.sql` untouched, both apply
cleanly on Neon and the PGLite fallback under the existing migration
runner's own contract (ordered files, tracked in `_migrations`, never
re-run).

### H. Required future APIs/data sources

- Deterministic, build first: `saveDeskProfile`, `getMyDesk` (new
  `createServerFn`s, `authMiddleware`-gated), `rankForDesk` (pure
  function, unit-testable, no I/O).
- To make the PEOPLE pillar real (a PRODUCT.md gap this plan inherits, not
  a new one): an actual social feed (X API — needs current pricing/ToS
  research), a real congressional-disclosure feed (House Clerk / Senate
  eFD, same shape as the already-working EDGAR pull in `filings.ts`), Form
  4 / 13F from EDGAR's own full-text or XBRL feeds (same pattern, new
  endpoint).
- Optional, priced: a real economic-calendar API to replace the
  hand-curated `EVENTS[]` once past the current rollout window.

### I. Deterministic logic vs. AI-generated logic

- **Deterministic, always**: prices, VWAP/level math, session windows,
  calendar dates/times, filing contents, influence-graph ranking, all
  relevance scoring.
- **AI, always labeled and sourced**: a single summary/synthesis step over
  outputs the deterministic layer already assembled — never inventing a
  price, filing, or event time. This matches PRODUCT.md's own rule ("AI
  should summarize, rank, connect and explain; it should not invent market
  facts") and the directive's traceability requirement: every AI sentence
  should be renderable next to the deterministic card it summarized, not
  floating free of a source.

### J. Security/privacy considerations

- Fix the auth default before deploying anywhere new (§2) — don't let
  `VITE_AUTH_ENABLED` fall through silently.
- Every new table is scoped by `user_id`/`desk_id` **server-side**, never
  by a client-sent id — this is already the stated house rule in
  `0001_auth.sql`'s own comments and `middleware.ts`; Desk Profile just has
  to actually follow it once it exists.
- `askTape` and any future AI endpoint should move from per-IP to per-user
  rate limiting once real accounts exist — the current limiter (added last
  pass) was a stopgap for a fully anonymous endpoint, not the long-term
  answer.
- Trading style + instrument selection is a user's private trading
  behavior, not sensitive in the PII sense, but still deserves normal
  auth-gated access control — no exotic handling needed beyond that.

### K. Performance implications

- Desk-aware loading adds one query (desk + its rows) to routes that
  already do server-side data loading — cheap, one round trip, cacheable
  per-user with the same TTL pattern already in `ttl-cache.ts`.
- Ranking runs in-process over dozens of instruments, not thousands —
  sub-millisecond, no need for a graph database or scoring service at this
  scale.
- The real cost driver is unchanged: upstream fan-out (Yahoo/RSS/YouTube).
  Desk Profile should **narrow** that fan-out (fetch only what a desk
  actually watches) rather than widen it — a net performance win over
  today's fetch-everything-for-everyone `getDesk`.

### L. Estimated ongoing infrastructure/API costs

Rough and current-data-only — flagged as estimates, not quotes:

- **Neon Postgres**: free tier is likely sufficient until real user volume
  justifies a paid tier.
- **xAI (`askTape`)**: bounded by the 60-calls/min global ceiling already
  added; per-call cost depends on current `grok-4.5` pricing at roughly
  500 output tokens/call — worth a fresh pricing check before treating
  this as a paid feature rather than estimating further here.
- **A real social feed (X API)**: priced per-tier/month and changes often
  — needs a live pricing lookup before this is scoped, not a guess here.
- **Everything else currently in use** (Yahoo Finance's unofficial quote/
  chart endpoints, Google News RSS, SEC EDGAR, YouTube scraping) is free
  and unofficial, carrying the same "can rate-limit or block us" risk
  flagged in the prior review. Desk Profile doesn't add cost here — by
  narrowing fetches to what a desk watches, it reduces request volume
  against those fragile upstreams.

### M. Phased implementation plan

- **Phase 0 (blocks everything else)**: decide the auth on/off answer for
  real, explicitly, for every deploy target; if turning it on, ship
  `/login` and `/api/auth/$`.
- **Phase 1**: land `0002_desk_profile.sql` + `0003_instrument_graph.sql`;
  seed `instrument`/`instrument_influence`/`instrument_source` from
  `markets.ts`'s existing `BOOKS` content — a data-entry pass, not new
  research.
- **Phase 2**: single-instrument onboarding (pick NQ or CL to prove the
  model on one), `saveDeskProfile`/`getMyDesk`, desk-aware `/` loader that
  re-sorts what's already rendered. No new UI chrome yet.
- **Phase 3**: multi-instrument desks, `desk_source_pref`, saved layout
  (`desk_layout`) — Desk Profile fully lands.
- **Phase 4**, only after 1–3 are real: the "why is X moving" composite
  card from PRODUCT.md, with `askTape` made desk-aware. Sequenced last on
  purpose — its SOCIAL/SENTIMENT panels need the real PEOPLE-pillar data
  this plan doesn't yet have, or they ship embarrassing.

---

## STOP CONDITION — acknowledged

No implementation has begun. Awaiting Product & Operations sign-off before
Phase 0.
