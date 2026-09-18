# OPS DIRECTIVE 001 — Repository Normalization + Operating Model

Owner: Ryan
Ops/Product: ChatGPT
Engineering: Claude
Design/Challenge: Grok

## Business constraint
Target outcome: profitable product, not a hobby build.
Current AI overhead is roughly $75/month, so engineering time and external services must be cost-conscious.
Avoid paid vendors, subscriptions, and infrastructure unless they create clear product value or remove material risk.

## Product north star
ACTA should keep traders at the desk by organizing relevant market information around what they trade and answering:
1. WHAT is happening?
2. WHY is it happening?
3. WHAT matters next?

Personalization is core architecture, not decoration.

## Immediate engineering task
Do not implement product features yet.

Normalize the repository so GitHub contains the actual ACTA source files, not only a ZIP archive.

Required:
- Extract the application source into the repository branch.
- Preserve directory structure.
- Include package.json and project config.
- Add ENGINEERING_AUDIT_001.md as a normal Markdown file.
- Verify/add .gitignore.
- Exclude .env files, credentials, API keys, node_modules, build outputs, caches, and local-only files.
- Do not change application behavior.
- Do not merge PR #1.

After correction, report:
- total files added
- top-level directories
- package.json present: yes/no
- ENGINEERING_AUDIT_001.md present: yes/no
- secrets/.env excluded: yes/no
- normal code/text diffs visible in PR: yes/no

## Operating rules
- GitHub is the source of truth.
- Use branches + PRs for meaningful changes.
- No wholesale rewrites without Ops approval.
- Reuse working code before adding dependencies.
- Prefer deterministic data pipelines for market facts.
- AI may summarize/rank/explain, but factual outputs must be traceable to sources/data.
- Keep maintenance burden low.
- Flag any new recurring cost before adding it.
- Stop at architecture review gates when requested.

## Feedback loop
Ryan has traders and non-traders review the product weekly.
Treat that feedback as a recurring product-input stream. Capture:
- confusion/friction
- missing utility
- unnecessary features
- repeated requests
- willingness-to-pay signals

Prioritize recurring patterns over one-off preferences.
