# Simple Stories App

A clean, minimal app for storing, reading, and managing stories, backed by your own Neon Postgres database.

## Pages

- `/` — **Stories**: card grid of all stories (title, short description, category chip). Simple search box filtering by title/description/category, plus a category filter row. Click a card to read.
- `/stories/$id` — **Read**: distraction-free view with title, category, large readable body text, and "Back to stories" + Edit/Delete actions.
- `/add` — **Add Story**: form with Title (required), Description, Category, Content (required).
- `/stories/$id/edit` — **Edit Story**: same form, prefilled; includes Delete with confirmation.
- `/bulk-upload` — **Bulk Upload**: pick a CSV, see a parsed preview table of valid rows and a list of row-level errors (missing title/content), confirm to import, then a summary: added / skipped / errors.

Top navigation: Stories | Add Story | Bulk Upload.

## Design

Clean modern direction: white background, soft grey cards (#F3F4F6), near-black text (#111827), blue accent (#2563EB). Sans-serif UI, generous whitespace, medium rounded corners, no decorative animation. Reading view uses a narrow measure and large type. Fully responsive, all colors as semantic tokens in `src/styles.css`.

## Database (Neon)

Single table, intentionally extensible:

```text
stories
  id          uuid primary key default gen_random_uuid()
  title       text not null
  description text
  content     text not null
  category    text
  created_at  timestamptz default now()
  updated_at  timestamptz default now()
```

A trigger keeps `updated_at` fresh. Three sample stories are inserted on first setup so the app is never empty.

## Technical notes

- I'll ask you to store your Neon connection string as a server-side secret (`DATABASE_URL`). It is read only inside server handlers, never exposed to the browser.
- Data access via `@neondatabase/serverless` (Workers-compatible) in a server-only module `src/lib/stories.server.ts`; all queries parameterized.
- Public API surface: `src/lib/stories.functions.ts` with TanStack `createServerFn` handlers — `listStories`, `getStory`, `createStory`, `updateStory`, `deleteStory`, `bulkCreateStories`. Schema setup + seed runs once via an idempotent `ensureSchema()` guarded server function.
- Validation with zod on both client and server (title/content required, length caps).
- Reads through TanStack Query (`ensureQueryData` in loaders + `useSuspenseQuery`); mutations invalidate the stories query.
- CSV parsed client-side with `papaparse` (quoted fields and commas handled), validated before any insert; bulk insert done in one server call.
- Per-route `head()` metadata with distinct titles/descriptions.

## Out of scope (MVP)

No auth, comments, ratings, favorites, analytics, AI features, or advanced import mapping.
