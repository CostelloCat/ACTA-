# ACTA

Markets, news, and the desk. For the people by the people.

This repo is the source. Open it in **Claude Code**, **ChatGPT Codex**, Cursor, or any editor.

**GitHub:** https://github.com/CostelloCat/acta

## Open in Claude or ChatGPT

1. Clone: `git clone https://github.com/CostelloCat/acta.git`
2. Claude Code: `cd acta && claude`
3. ChatGPT: paste the repo URL into Codex / a project with GitHub connected
4. Or attach this README and say: *edit this TanStack Start app*

The Grok preview URL is a live preview only. It is **not** an editable source link. This GitHub repo is.

## Run

```bash
npm install
npm run dev
```

App listens on port 8080.

```bash
npm run typecheck
npm run build
```

## Stack

- TanStack Start + React + Vite + Tailwind v4
- File routes in `src/routes/`
- Desk, Global News, Trading Calendar, Socials, Crypto, Search
- TradingView widgets for tape and mini charts
- Yahoo Finance for session levels (VWAP, prior day, overnight, yearly open)
- Native-language news wires per country (no US rewrite)

## Layout

| Path | What |
| --- | --- |
| `src/routes/` | Pages |
| `src/components/` | Desk chrome, mosaic, clocks, tape |
| `src/lib/` | Calendar, channels, levels, wires |
| `public/hero/` | Planet, mesh, night Earth |

Not investment advice.
