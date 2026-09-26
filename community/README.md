# Visitor wall service

A small service behind the hall's boats, 28-day visitor graph and note wall. It runs as a
Cloudflare Worker with a D1 database (`community/worker.mjs`, `community/schema.sql`) or locally
through `tools/community-local.mjs`. **No live backend is deployed or configured.** Everything
below the "Public writes" heading still needs a review before any launch.

## Local commands

```powershell
node tools/community-local.mjs                  # http://127.0.0.1:5190, data in _local/community.sqlite
node --test tools/check-community.mjs           # behavioural checks (Node 22.15+, no packages)

# Optional isolation (PowerShell):
$env:COMMUNITY_PORT = '5191'; $env:COMMUNITY_DB = ':memory:'; node tools/community-local.mjs
```

| Variable | Default | Meaning |
| --- | --- | --- |
| `COMMUNITY_PORT` | `5190` | Port on `127.0.0.1`; `0` picks a free port. The host is always loopback. |
| `COMMUNITY_DB` | `_local/community.sqlite` | SQLite file, or `:memory:`. |
| `COMMUNITY_ORIGINS` | `http://127.0.0.1:5186,…:5187`, `http://localhost:5186,…:5187` | Exact origins allowed to write. |

Ctrl+C closes the listener, waits up to two seconds for open connections and then closes the
database. `_local/` must stay in `.gitignore`. Node prints an ExperimentalWarning for `node:sqlite`;
it is expected.

## HTTP contract

- `GET /summary` → `{ mode: 'local'|'live', days: [{ day, visits }], visits: [{ country, zone }], notes: [{ id, name, message }] }`
  - `days`: exactly 28 UTC dates, oldest first, today last. `visits` = distinct browser session IDs
    seen on that UTC date.
  - `visits` (the boats): up to 12 sessions active in the last 24 hours, most recent first, each
    with its latest section only. A recent sample, not all-time unique people.
  - `notes`: up to 12 newest approved notes.
- `POST /visit` `{ session, zone }` → `{ ok: true }`. Zones: `entrance`, `work`, `projects`, `about`, `contact`.
- `POST /note` `{ session, name?, message }` → `201 { ok: true, local }`. `local: false` means the
  note waits for moderation and is not shown.
- `OPTIONS` preflight is answered for allowed origins.

Write rules: an allowed `Origin` header is required, `Content-Type` must be `application/json`
(so browsers preflight), the body is at most 4096 bytes and is cut off while streaming. `session`
must be a UUID (versions 1–8, RFC variant, case-insensitive). Name ≤ 32 and message 2–180 Unicode
characters; whitespace (including newlines) collapses to single spaces; other control characters,
bidi overrides and broken surrogates are refused. Errors: 400 invalid, 403 origin/writes disabled,
404, 413 too large, 415 not JSON, 429 note limit, 503 database unavailable.

`ALLOWED_ORIGINS` entries must be exact origins (`https://example.com`, no path or trailing slash);
other entries are ignored. Requests without `Origin` may read the summary but not write.

## Storage and privacy

| Table | Holds | Kept |
| --- | --- | --- |
| `visit_days` | UTC day + `SHA-256("visit:<day>:<session>")` | 28 displayed days |
| `presence` | `SHA-256("presence:<session>")`, Cloudflare country or `??`, latest zone, last-seen minute | 24 hours |
| `notes` | id, name, message, created, approved, `SHA-256("note:<day>:<session>")` | pending 30 days; approved until removed |

- Raw session IDs, IP addresses, user agents, referrers and paths are never stored. The Worker
  reads country only from Cloudflare's `request.cf.country`; the client cannot supply it. Locally
  it is always `??`.
- Daily keys change each UTC date, so stored rows cannot be joined into a per-browser history.
  A session that crosses midnight counts once on each date and remains one boat.
- Presence is overwritten on each visit, so there is no movement trail.
- Retention runs from the Worker `scheduled` handler (needs a cron trigger, e.g. hourly) and locally
  at startup and hourly. Summary queries filter by date anyway, so a missed run does not change the
  numbers. It only affects storage.
- Old rows in the earlier `visits` table on a local database are kept, not deleted (see below).

## Honest limitations

- Counts are browser session IDs per UTC day, not people. How long an ID lasts depends on the client
  (a new tab or cleared storage counts again). Anyone can script requests with fresh UUIDs, so treat
  counts as a rough, possibly inflated signal.
- A day's count stops rising at 5000 to bound storage. Read a value of 5000 as "at least 5000".
- CORS and session IDs are **not** spam or abuse prevention. Non-browser clients can send any
  `Origin`. The note caps (3 per session per UTC day, 100 per UTC day overall) are atomic storage
  throttles only. One client can use up the daily allowance.
- Responses are `no-store`. Add a short cache before any real traffic if needed.

## Notes and moderation

- `LOCAL_PREVIEW=1` approves notes immediately, but only when the request host is loopback
  (`127.0.0.1`, `localhost`, `[::1]`). If the setting leaks into a deployment, notes still stay pending.
- Live notes are stored with `approved = 0` and never appear in `/summary`. There is no admin UI:
  approve with `UPDATE notes SET approved = 1 WHERE id = '…'` and remove with `DELETE FROM notes WHERE id = '…'`.
  Unreviewed notes are deleted after 30 days.

## Public writes (disabled)

Without `LOCAL_PREVIEW` on loopback, `POST` returns 403 unless `PUBLIC_WRITES=1` is set. Do not set
it until a deployment review covers at least:

- a bot check (e.g. Turnstile) verified server-side before notes, and preferably visits;
- edge rate limiting per client at Cloudflare (not stored by this service);
- a moderation routine, removal/takedown path and a privacy notice for visitors;
- a cron trigger for retention, a D1 binding named `DB`, exact `ALLOWED_ORIGINS`, no `LOCAL_PREVIEW`;
- monitoring for 429/503 rates and table sizes.

## Schema and migrations

`schema.sql` is idempotent (`IF NOT EXISTS`) and is what a fresh D1 database would be created from.
`IF NOT EXISTS` never changes an existing table, so:

- `tools/community-local.mjs` checks the required columns before and after applying the schema and
  their types and primary keys, and refuses to start with a clear error rather than miscounting.
  Schema creation and legacy migration share one transaction, so a failed migration leaves the
  database unchanged. It never drops or rewrites tables.
- Earlier local databases had one `visits` table (one row per session, first day only). On startup
  those rows are copied into `visit_days`/`presence` (hashed the same way as new rows, so a same-day
  return is not double counted), and the table is renamed to `visits_legacy_v1` and kept. Delete it
  by hand if you no longer want it. Legacy local notes keep their original `session` values.
- Future shape changes need a new, explicit migration step (new table or `ALTER TABLE`), plus an
  update to `REQUIRED_COLUMNS` in the local tool. No D1 database exists yet, so the Worker
  has no migration path of its own. The legacy hashing cannot be done in plain SQL.
