# ACTA — North Star

> ACTA exists so a trader doesn't have to leave their desk to understand
> what is happening, why it is happening, and what matters next.

Every feature gets tested against that sentence: does it help answer
**WHAT / WHY / NEXT**? If not, it's feature creep — cut it.

ACTA is not trying to beat TradingView (charts), a broker (execution), or
Discord (community) at their own game. It exists to **eliminate the other
10 tabs** a trader opens around their chart. Broker/chart stays the
trader's execution surface; ACTA is the context layer that feeds it.

```text
               YOUR BROKER / CHART
                      │
                 execution
                      │
                      ▼
                    ACTA
                      │
       ┌──────────────┼──────────────┐
       │              │              │
     MARKET          WHY           PEOPLE
       │              │              │
 NQ / ES / VIX      News          YouTube
 Oil / Gold       Catalysts       Social
 Crypto           Calendar        Streams
 Sessions         Filings         Sentiment
 Movers           Macro           Community
       └──────────────┼──────────────┘
                      │
                 ONE SCREEN
```

## Where the codebase actually stands (verified, not assumed)

**MARKET — built.** Session-scoped pages for NQ/ES(SPX)/VIX/Gold/Silver/Oil/
Crypto(BTC/ETH/SOL/XRP/XLM)/Mag7, live Yahoo Finance levels, session clocks,
mover strip. This pillar needs hardening, not invention.

**WHY — built.** News wires (`desk.ts`), calendar with historical context per
event (`calendar.ts`), live SEC EDGAR current-filings feed (`filings.ts`),
catalyst-tagging that links a live speaker to the instruments it moves
(`movers.ts`). Real data, real pipes.

**PEOPLE — thin, partly fake right now.** This is the pillar to build:
- YouTube live-check + mosaic: real, but scrapes an undocumented internal
  endpoint — fragile, fails safe, will need re-work as YouTube changes it.
- **Social** (`/socials`): currently just a page of outbound links to X,
  Discord, Robinhood, Truth Social, Kick. No feed is actually pulled in.
- **Sentiment** (`pulse.ts`): VIX level + the Fear & Greed Index API,
  relabeled. Not social/crowd sentiment — just two market-fear proxies.
- **Community**: doesn't exist as a feature. There's dormant WebRTC room
  scaffolding (`multiplayer/p2p.ts`) never wired to any route — either use
  it or delete it, don't let it rot as dead weight.

**Execution (top of diagram)**: absent entirely. Out of scope for now —
ACTA stays read-only intelligence. Revisit only if a real broker
integration (e.g. deep-linking an order ticket) becomes the ask.

## What V1 (the single-file prototype) actually contains — verified

V1 is a static mockup, not a data source. Its philosophy is worth stealing;
its code and its "data" are not.

- **Real idea worth building**: a congressional-disclosure feed (STOCK Act
  filings via House Clerk / Senate eFD), Form 4 insider transactions, 13Fs.
  **Correction to the earlier read of V1**: the tables under "Public
  filings" in V1 are not a live feed — they are hand-typed sample rows
  explicitly frozen "as of 4 Sep 2026" (Steve Cohen, Kevin Hern, etc., with
  no fetch behind them). This is new build work for 2.0, on the same pattern
  as the already-working EDGAR feed in `filings.ts` — not a port.
- **Real idea worth stealing (UI pattern)**: every filing row in V1 has a
  one-click "Post" button that opens a pre-filled `x.com/intent/post` share
  link. Cheap, zero-backend virality mechanic — steal this pattern for any
  card in 2.0 (a mover, a filing, a calendar print).
- **Real idea worth stealing (positioning)**: naming primary-source
  categories explicitly — Fed, Treasury, CFTC, EIA, OPEC, IEA, CME, ECB,
  Reuters/AP, C-SPAN — as a checklist of "primary sources a trader currently
  visits by hand." Use this as the backlog for the WHY/PEOPLE pillars, not
  as a claim that V1 already aggregates them (it doesn't — these are static
  links/labels, same as `/socials` in 2.0 today).
- Apple-light theme, session-clock design, and the "your desk" (pinned
  streams via localStorage) feature are reasonable reference material for
  polish, secondary to the above.

**Bottom line for the three builders: keep 2.0's architecture. Mine V1 for
product ideas and the "primary sources" backlog. Do not port V1 code or
treat any of its tables as real data — verify every source yourself before
wiring it in.**

## The feature that defines ACTA: "Why is X moving"

Trigger: an instrument the trader is watching makes an unusual move.
Instead of the trader leaving to search, ACTA assembles, on one card:

1. **MARKET** — the move itself plus correlated instruments (VIX, 10Y, DXY,
   sector proxy) that confirm or contradict the story.
2. **CATALYST** — what just happened (a speaker going live, a print
   crossing the wire, a headline).
3. **NEWS** — ranked by recency/relevance, not a raw firehose.
4. **PRIMARY SOURCE** — the actual transcript/release, not a summary of a
   summary.
5. **SOCIAL** — real discussion, once a real feed exists (see PEOPLE gap
   above — do not fake this with placeholder posts).
6. **VIDEO/LIVE** — relevant live coverage if something is actually on air.
7. **CALENDAR** — what's next that could extend or reverse the move.
8. **SUMMARY** — a short, generated synthesis of 1–7, not new information.

This is a connective feature, not a new data pillar — it composes existing
MARKET/WHY/PEOPLE data plus one new piece of UI. Build order: get PEOPLE's
Social/Sentiment real first (steps 5–6 need real data to not be embarrassing),
then wire the composite card.

## The Desk — information hierarchy, not a widget wall

On open, lead with hierarchy, not fifty boxes:

```
THE DESK — 10:42:17 ET
RIGHT NOW   what's moving unusually
WHY         what's causing it
NEXT        what's scheduled
WATCH       what could matter to my instruments
```

Everything else (Markets / News / Calendar / Sessions / Filings / Social /
Live / Research) is one level down. This avoids "Bloomberg Terminal Jr."

## Personalization

One-time instrument selection reweights what's on The Desk — this is also
the subscription wedge, since it's the thing free aggregators don't bother
doing:

- Trades NQ/MNQ → emphasize Nasdaq futures, VIX, 10Y/2Y, DXY, MAG7,
  semis, Fed, CPI/PPI/PCE/NFP, Treasury auctions, big tech earnings,
  relevant geopolitics, Asia/London/NY sessions.
- Trades CL → emphasize WTI, Brent, DXY, EIA, OPEC, Middle East,
  tankers/shipping, inventories, refiners, energy equities, calendar.

Same platform, different desk, from one flag set at onboarding.

## Non-goals (say no on purpose)

- Don't rebuild charting (TradingView embed is fine — a means, not the
  product).
- Don't rebuild execution/brokerage.
- Don't ship a widget wall — every new panel competes with "RIGHT NOW / WHY
  / NEXT / WATCH" for the top of the screen; if it doesn't fit one of those,
  it's one level down or it's cut.
- Don't fake data. If Social/Sentiment/Community can't be wired to something
  real yet, ship it absent rather than mocked — a fabricated STOCK Act table
  (V1's mistake) is a liability, not a feature, once this handles real money
  decisions.

## How to judge a contribution

For every PR/change from any of the three builders, ask:
1. Does it help answer WHAT, WHY, or NEXT — and can you point to which?
2. Is the data behind it real, or is it a placeholder dressed as real?
3. Did it add a widget to the wall, or strengthen RIGHT NOW/WHY/NEXT/WATCH?
4. Cost/abuse check for anything hitting a paid or rate-limited upstream
   (see `src/lib/rate-limit.ts`, `src/lib/ttl-cache.ts` for the existing
   pattern — extend it, don't bypass it).
