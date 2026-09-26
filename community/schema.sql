-- Visitor wall schema for Cloudflare D1 / SQLite. Safe to re-run: every statement is IF NOT EXISTS.
-- CREATE TABLE IF NOT EXISTS never alters an existing table, so any shape change needs an explicit
-- migration (see README.md). tools/community-local.mjs checks columns and refuses to start on a
-- mismatch rather than miscounting. The earlier `visits` table is migrated by that tool, not here.

-- One row per browser session per UTC date. visitor = SHA-256("visit:<day>:<session>"), so rows
-- from different days cannot be joined without the raw session ID, which is never stored.
CREATE TABLE IF NOT EXISTS visit_days (
  day TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (day, visitor)
);

-- Latest coarse state of recently active sessions, used for the boats. Overwritten, never appended.
-- visitor = SHA-256("presence:<session>"); country is Cloudflare's code or '??';
-- zone is the last hall section; last_seen is epoch ms rounded down to the minute.
CREATE TABLE IF NOT EXISTS presence (
  visitor TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  zone TEXT NOT NULL,
  last_seen INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS presence_seen ON presence(last_seen);

-- Guestbook notes. approved = 0 until a moderator approves (automatic only in local preview).
-- session holds SHA-256("note:<day>:<session>") and is used only by the daily note throttle.
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  session TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created INTEGER NOT NULL,
  approved INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS notes_public ON notes(approved, created);
CREATE INDEX IF NOT EXISTS notes_created ON notes(created);
CREATE INDEX IF NOT EXISTS notes_author ON notes(session, created);
