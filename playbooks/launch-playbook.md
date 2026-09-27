# Launch / growth-channel playbook

Digest of `~/git-personal/.claude/launch/*` (README, positioning, launch-posts, channels-and-plan,
in-product-growth, store-listing-review — seeded 2026-09-27, drafted 2026-09-23 for EchoKit and
JSON Workbench).

## Top 5 highest-leverage actions (in order)

1. **Fix the store listing before pushing any traffic.** A launch that sends people to a thin
   listing (no real screenshots, missing differentiators in the summary) wastes the traffic spike.
2. **Add first-run sample data/demo before any public launch post.** Near-zero effort, biggest
   lever on whether launch-day traffic converts to installs that reach the "aha" moment — which is
   also what earns reviews and word of mouth.
3. **Ship Show HN + Product Hunt drafts staggered one product per week, and personally answer
   every comment same-day.** Highest-leverage traffic event available to a solo dev with no
   existing audience.
4. **Turn on tasteful in-app review-request triggers before launch week, not after.** Review count
   directly affects store search conversion; the trigger has to exist before the traffic that
   would generate reviews arrives.
5. **Submit to 3–5 well-targeted awesome-lists in week 4** (e.g. awesome-duckdb, data-engineering
   and CLI-tools lists for JSON Workbench; testing/API-mocking lists for EchoKit). Small one-time
   PRs, permanent compounding backlinks — unlike the one-day spike from Reddit/HN.

## Distribution channels used so far

Show HN, Reddit (r/dataengineering, r/webdev, r/commandline), Product Hunt, awesome-lists,
newsletters (Console.dev, JavaScript Weekly, Data Engineering Weekly), AlternativeTo/SaaSHub.
Posting from the founder's own accounts always needs the founder's per-post approval (never
autonomous) — cross-reference `policies/autonomy-levels.md`.

## Cross-promo rules already in practice

Only between products sharing an audience tag (e.g. `developer`). ≤ 1 impression per user per 14
days, never in the first 3 sessions, never mid-task (only in options/about/footers — this is the
existing JSON Workbench footer pattern, reused as the standard). "Hide suggestions" persists
forever. No cross-product user linkage (separate install ids per product).

## Things this playbook could NOT confirm at seed time (verify before reuse)

- Exact current CWS screenshot count limit (assumed ≤ 5).
- Exact current submission URLs for the newsletters listed above.
- Exact current names/URLs of the specific awesome-list repos referenced.
- Whether the public hub page lists every product (it lives outside `~/git-personal`, not
  inspectable from here).
- Whether a given product's "opt-in telemetry" is actually wired up and reporting anywhere before
  relying on it for install→active measurement.

## Related

- `research/opportunities/` — one opportunity record per growth idea this playbook generates.
- `products/json-workbench/product-facts.yaml` — the first product this playbook was applied to.
- `decisions/DEC-0003-first-factory-product-json-workbench.md` — why JSON Workbench first.
