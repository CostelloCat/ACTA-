# ACTA OPS STATUS

_Last updated: 2026-09-18 (Claude, engineering pass — see PR #1 for detail)_

## North Star
Keep the trader at the desk. ACTA should quickly answer **WHAT / WHY / NEXT** while preserving user choice and source transparency.

## Current Gate
**Build/run validation before feature expansion.**

## Complete
- [x] Repository normalized into real source files
- [x] 167 source files extracted from ZIPs
- [x] package.json present
- [x] ENGINEERING_AUDIT_001.md present
- [x] .env/secrets excluded
- [x] Normal GitHub code diffs visible
- [x] PR #1 remains unmerged
- [x] Brand direction retained: planet/light pillar, ACTA lockup, live-honesty
- [x] Weekly trader + non-trader feedback loop established

## Active / Launch-Critical
- [x] Confirm clean local build/run path — verified 2026-09-18 (Claude): `npm install`/`typecheck`/`build`/`dev` all clean, spot-checked routes 200 with clean console; see PR #1 comments.
- [x] Confirm production build path — verified 2026-09-18 (Claude): `npm run build` produces `.vercel/output/` (Vercel preset), client + SSR functions built clean.
- [ ] Verify shareable deployment — not started. This needs an Ops/Ryan decision (which host/project, `DATABASE_URL`/`VITE_AUTH_ENABLED` for that target) before Claude can execute it; see `ENGINEERING_AUDIT_001.md` §2 on the auth-flag default.
- [x] Investigate inconsistent TradingView chart/open behavior — root-caused and fixed 2026-09-18 (Claude). The VIX book page used `CBOE:VIX` for its inline mini-chart (correct — matches CLAUDE.md's known-good list) but `TVC:VIX` for its "Open TradingView →" external link — `TVC:VIX` is exactly the symbol CLAUDE.md documents as broken, so that one link opened a dead/wrong chart while the inline chart worked. Fixed in `src/lib/markets.ts` to use `CBOE:VIX` in both places. Also hardened a dead fallback in `market-view.tsx` (`NASDAQ:NDX`, also a documented-broken symbol, unreachable today but a landmine for the next instrument added) to `NASDAQ:QQQ`. Checked every other TradingView symbol in the app (mini-chart map, external links, ticker tape) against CLAUDE.md's known-good list and each other — no other mismatches found. Not investigated: whether the futures continuous-contract links (`CME_MINI:NQ1!`/`CME_MINI:ES1!`) need a TradingView login to fully resolve — not documented as broken anywhere in this repo, so left as-is pending an actual report.
- [x] Fix visible text clipping/alignment in white ticker/banner area — fixed 2026-09-18 (Claude), pushed in `48a17d8`: wrong widget theme + a `#ffffff` CSS token + a wrapper-height/CSS-height mismatch, all in `tape-strip.tsx`/`styles.css`. See PR #1 for details.

## Launch Polish — After Build Gate
- [x] Restore intended iridescent ACTA typography treatment — done 2026-09-18 (Claude), refined against the canonical reference (comment `5724696603`): dropped the gold/cream anchor entirely (spec explicitly says "not metallic gold") and now cycle through lavender → pink → peach → pale green → cyan, evenly spaced, same `.foil` animation mechanism. Visually verified frame-by-frame in a headless browser — five frames each showing a distinct hue from the spec. One CSS rule, no layout change. **Open question**: the spec also says this should be "strongest on... the hero headline," but nothing in the app is currently an unambiguous marketing hero headline — the only large display text besides the ACTA lockup is functional (e.g. the live session name "ASIA"/"LONDON"/"NEW YORK", or a book page's `<h1>` like "NQ / MNQ"). Applying an animated gradient to a live status indicator risks hurting legibility of something functional, which the spec itself guards against ("body/interface copy remains highly readable"). Holding off extending `.foil` anywhere else until you point to the specific element meant by "hero headline."
- [ ] Replace top "Desks, prints, Grok..." text with a universal ACTA search field — **holding, scoping note**: a full universal-search *page* already exists at `/search` (`src/routes/search.tsx`) and already indexes desks, calendar prints, and app pages, plus book-news and an Ask-Grok fallback — it's most of what's being asked for. The header field (`search-bar.tsx`) already submits into it. The open question is UX, not plumbing: does "replace the top text" mean (a) just change the placeholder copy, or (b) turn the header field into a live inline-typeahead dropdown (a real nav-behavior change)? (b) is more than a copy change and is the kind of thing that could "destabilize navigation" per your own caveat — want Claude to scope that as a small design proposal before touching it, or is (a) all that's wanted for launch?
- [ ] Verify search supports broad discovery across symbols, events, news, media, and ACTA destinations — mostly true already per above; not yet verified against "media" specifically (YouTube/live streams aren't in `/search`'s current index, only a raw YouTube search link).

## Product Discovery — Do Not Block Launch (research complete, no code changed)
- [x] Evaluate optional user-connected personal AI/provider choice — analysis below.

**Value**: today ACTA pays 100% of AI cost per `askTape` call from its own `XAI_API_KEY` (rate-limited, but still ACTA's spend). Letting a user bring their own key inverts that: power users get to use a provider/model they already pay for and trust, and ACTA's own recurring AI cost stops scaling with usage — directly serves the "extremely lean recurring cost" constraint in `OPS_DIRECTIVE_001.md`.

**Auth/privacy implications**: a stored API key is a credential to a *third party's* billing account — this needs real per-user accounts (today's auth is off, per `ENGINEERING_AUDIT_001.md` §2) and encryption at rest, not a plain DB column; it must never reach logs/analytics/error reporting. This is meaningfully more security surface than anything ACTA holds today and should not be built before auth is actually turned on for real.

**Provider constraints**: providers don't share one API shape. The good news: xAI's own API (already integrated in `tape.ts`, `https://api.x.ai/v1/chat/completions`) is OpenAI-compatible, so "OpenAI-shaped chat completions" as the first supported shape covers OpenAI *and* xAI *and* most self-hosted/compatible endpoints with one integration, not three. Anthropic's native Messages API is a different shape and would be a second, separate integration — real work, not a config toggle, and worth sequencing after the first shape ships.

**Recurring-cost impact**: net **reduction** in ACTA's own AI spend as adoption grows (usage shifts to the user's own provider bill), at the cost of building and maintaining a second (BYO-key) code path alongside the existing ACTA-hosted one.

**Lean architecture recommendation**: (1) sequence this after real accounts exist — a stored key has to be scoped to a signed-in user, so this is downstream of the Desk Profile/auth work already audited, not a parallel track; (2) ship one OpenAI-compatible BYO-key path first (covers OpenAI + xAI + compatible endpoints); (3) keep the current ACTA-hosted `askTape` as the permanent, always-on default — BYO-key is additive, never a wall in front of the free experience, per "ACTA should not force one AI provider" (and per not gating the core product behind user setup).

No code changed for this item — discovery only, per Ops's instruction.

## Later / V2
- [ ] Global News redesign
- [ ] "Go Against the Current" discovery mode for international/non-mainstream/non-US perspectives
- [ ] Broader media/source choice while preserving source identity and live-status honesty
- [ ] Personalization / multiple desks / Pro intelligence layer
- [ ] Deeper Socials hub

## Persistent Product Requirements
- [ ] **User-selectable Light and Dark themes** (Ops, 2026-09-18): the iridescent brand treatment must work in both and must never replace the user's theme choice. **Correcting the record**: the current app (2.0) has no light theme today — checked directly (no `data-theme`/`prefers-color-scheme`/theme toggle/theme library anywhere in `src`, and `styles.css`'s `@theme` block defines exactly one, dark, palette). The V1 static prototype did have a light/dark toggle (see `PRODUCT.md`), but that's a different, unrelated codebase. Building a real light theme is feature work, not polish — a second color palette for every token plus a toggle and persistence — not something to fold into the brand-sheen fix. Logging it here as a standing requirement so it isn't lost; the `.foil` gradient chosen for the sheen is tuned against the current dark background and will need revisiting (contrast, not necessarily hue) once a light theme actually exists. Not starting this without an explicit go-ahead, since it's squarely outside "small tasteful polish."

## Product Principle
ACTA should not become a content gatekeeper. It should help users reach, compare, and understand sources while making provenance visible.

## Owner Map
- Ryan: vision, style, utility, weekly human feedback
- ChatGPT/Ops: sequencing, scope, economics, review gates
- Claude: engineering, QA, deployment
- Grok: creative/UX challenge, brand critique
