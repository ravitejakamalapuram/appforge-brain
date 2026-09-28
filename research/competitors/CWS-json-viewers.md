# Competitor set — JSON viewers/formatters on the Chrome Web Store

Compiled 2026-09-28 by CPO for [OPP-0001](../opportunities/OPP-0001-json-workbench-activation.yaml).
Per master plan §10.2, a RESEARCHING→VALIDATING transition needs `competitors ≥ 3` or "none found"
with a search log. Six are recorded below; the search log is at the bottom.

## The category (direct substitutes for "open a JSON page and read it")

| Extension | Users | Rating | Last updated | JSONL/NDJSON | jq / JSONata | Local SQL | Diff | Verified 10 MB+ |
|---|---:|---|---|---|---|---|---|---|
| [JSON Formatter](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa) | ~2,000,000 | 4.3 (2.1K) | 2026-05-16 | no | no | no | no | **no — "gave up at 10 MB"** |
| [JSON Viewer Pro](https://chromewebstore.google.com/detail/json-viewer-pro/eifflpmocdbdmepbjaopkkhbfmdgijcc) | ~300,000 | 4.6 (218) | 2026-08-21 | no | no | no | no | yes, but median **14,258 ms** at 10 MB |
| JSONView | ~100,000 | — | — | no | no | no | no | **no — "hung at 10 MB"** |
| JSON Viewer (teocci) | ~100,000 | — | — | no | no | no | no | **no — "gave up at 10 MB"** |
| JSON Lite | ~20,000 | — | — | no | no | no | no | yes, median **1,852 ms** at 10 MB |
| [JSON Formatter & Viewer](https://chromewebstore.google.com/detail/json-formatter-viewer/bfpdkldgjmfhlocflmbjclfmamjdoonj) | not shown | 0 (0) | 2026-03-17 | no | no | no | no | not tested |
| **JSON Workbench (ours)** | **3** (public listing; CWS dashboard reported 5 on 2026-09-27) | 5.0 (1) | 2026-09-25 | yes | yes (both) | yes (DuckDB-WASM) | yes (RFC 6902 + visual) | own bench: 10 MB / 244 ms, 100 MB / 2.29 s, 500 MB / 11.82 s (parser throughput only) |

User counts, ratings and the 10 MB/50 MB figures for the first five rows come from FormatArc's
2026-07-11 comparative benchmark of seven extensions
(<https://formatarc.com/en/blog/chrome-extension-json-formatter/>), cross-checked against the live
CWS listings on 2026-09-28 for JSON Formatter and JSON Viewer Pro (both matched).

## The finding that matters

> "only 2 of the 6 auto-formatting extensions managed to format a 10 MB JSON file (JSON Lite,
> median 1,852 ms; JSON Viewer Pro, median 14,258 ms)" … "none of them formatted 50 MB"
> — FormatArc, 2026-07-11

This is **independent** third-party confirmation that the large-file job is unserved on CWS. It is
the single strongest piece of evidence in OPP-0001, and it is about the *product*, not about the
listing or the first-run experience.

## Adjacent, not direct

- **NDJSON Viewer** — DevTools Network-panel NDJSON inspector. Overlaps on JSONL only.
- **JSON Crack**, **JSON Hero** — visualisation-first; both hand the payload to a hosted web app,
  so they lose on the local-first/privacy axis rather than the capability axis.
- **Dadroit JSON Viewer** — native desktop app for multi-GB JSON with JSON-Lines support.
  Evidence that people will install a *separate desktop application* for the large-file job.

## Search log (what was searched, and what was not found)

Searched 2026-09-28:

1. `Chrome Web Store JSON Formatter JSON Viewer extension users ratings 2026`
2. `Chrome extension jq JSONata pipeline JSON transform "Chrome Web Store" DuckDB SQL in browser JSON`
3. `"JSON Crack" OR "JSON Hero" OR "JSON Viewer Awesome" chrome extension users JSON diff large files NDJSON 2026`

**No CWS extension other than JSON Workbench was found offering jq *and* JSONata *and* local SQL.**
Search 2 returned JSON Workbench's own GitHub repo as the top substantive hit; the remaining hits
were DuckDB/JSONata library and blog content, not browser extensions. Treat "none found" as
"none found by three searches", not as proof of absence.

## The August 2026 trust shock (added 2026-09-28)

A JSON Formatter extension with 200K+ users went closed-source in mid-2026, partnered with
GiveFreely, and began injecting geolocation tracking and donation popups into checkout pages. The
response was mass uninstalls. A developer then tested "every JSON viewer after the formatter
scandal" against four criteria — **fully open source + handles large files + privacy-guaranteed +
feature-complete** — found that none of the five he tested met all four, and built his own
(**ClearJSON**, "zero network requests for free users").

Source: <https://dev.to/wayknow123/i-tested-every-json-viewer-after-the-formatter-scandal-heres-what-i-found-4dcl>
(2026-08-06, edited 2026-08-17), retrieved 2026-09-28.

Two things follow, and they cut in opposite directions:

- **For us.** That four-criteria list is JSON Workbench's positioning, written independently, by
  someone who is not us, six weeks *before* JSON Workbench was public (first release 2026-09-20).
  It is the cleanest available evidence that the positioning is demand-shaped rather than
  founder-shaped.
- **Against us.** ClearJSON now exists, occupies the privacy axis, and launched with an audience
  already attached to a widely-read post. Competing on trust alone is late. Competing on trust
  **and** the large-file capacity no incumbent has (see the benchmark above) is still open.

Also from that post: the open-source JSON Formatter fork (arnav-kr) "starts to struggle" above
~5 MB, and JsonDiscovery is the category's highest-rated at 4.88 — neither closes the large-file
gap.

## Where the demand is currently served (added 2026-09-28)

Searching the user's own words — "how to open a large JSON file" — returns a sustained commercial
content market (Dadroit, Pandia, alljsontools, openformatter, several DEV Community posts). Every
one of those answers points **out of the browser**: jq on the command line, VS Code, Notepad++, or
a native desktop viewer. The recurring numbers quoted across that content are ~10 MB before
browser tools slow and ~50 MB before they crash — the same thresholds the FormatArc benchmark
measured.

Read together with the benchmark: the demand is real and commercially served, and no one
recommends a Chrome extension for it because until 2026-09-20 none could do it. That is the gap
JSON Workbench occupies and does not currently say out loud in its store listing.

## Read-through for positioning

The category is enormous (~2.5M users across five listings) and completely undifferentiated —
every incumbent is a *formatter*, and the largest one by 6× cannot open a 10 MB file. JSON
Workbench is not competing for the "pretty-print this JSON tab" job, which is won and saturated.
It is the only CWS entrant for the "I have a 200 MB JSONL file and need to query it" job, and
nothing in its current store listing says that in the words someone with that problem would search.
