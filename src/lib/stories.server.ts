import { neon } from "@neondatabase/serverless";

export type Story = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export type StoryInput = {
  title: string;
  description?: string | null;
  category?: string | null;
  content: string;
};

function db() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

const SAMPLE_STORIES: StoryInput[] = [
  {
    title: "The Clever Rabbit",
    description: "A clever rabbit outwits a hungry lion.",
    category: "Animals",
    content:
      "Once upon a time, in a forest where the trees leaned close to whisper secrets, there lived a rabbit who was known for thinking faster than he could run.\n\nOne morning a lion declared that every animal must send him a meal each day. The rabbit arrived late, and the lion roared, \"Why do you keep me waiting?\"\n\n\"Forgive me,\" said the rabbit. \"Another lion stopped me on the path and said he was the true king of this forest.\"\n\nFurious, the lion demanded to be shown the impostor. The rabbit led him to a deep, still well and pointed inside. The lion looked down, saw his own reflection, and roared at it. The reflection roared back. Blind with rage, he leapt at his rival and was never seen again.\n\nThe rabbit walked home slowly, because there was no longer any reason to hurry.",
  },
  {
    title: "The Lost Kite",
    description: "A child searches the whole town for a runaway kite.",
    category: "Adventure",
    content:
      "One sunny afternoon, Maya's red kite slipped from her fingers and rode the wind over the rooftops.\n\nShe followed it past the bakery, where the baker pointed a floury hand toward the market. She followed it past the market, where a fruit seller nodded toward the river. She followed it to the river, where an old fisherman was already untangling a red paper wing from his net.\n\n\"It came to me,\" he said, \"so I suppose it was looking for someone.\"\n\nMaya carried the kite home, and every time she flew it after that, she tied the string twice — once for the wind, and once for luck.",
  },
  {
    title: "The Lantern Keeper",
    description: "A small town keeps one light burning for a reason nobody remembers.",
    category: "Folk Tales",
    content:
      "At the edge of the village stood a lantern that had never been allowed to go out. Each night a different family carried oil up the hill, and each night the flame leaned into the dark like something listening.\n\nWhen the youngest keeper asked why, the elders admitted they had forgotten. \"But a traveller once found their way home by it,\" said the oldest. \"And someone, somewhere, is still walking.\"\n\nSo the girl filled the lantern, trimmed the wick, and sat with the light until morning — which, she decided, was reason enough.",
  },
];

export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = db();
      await sql`create extension if not exists pgcrypto`;
      await sql`
        create table if not exists stories (
          id uuid primary key default gen_random_uuid(),
          title text not null,
          description text,
          content text not null,
          category text,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;
      const rows = (await sql`select count(*)::int as count from stories`) as { count: number }[];
      if ((rows[0]?.count ?? 0) === 0) {
        for (const story of SAMPLE_STORIES) {
          await sql`
            insert into stories (title, description, category, content)
            values (${story.title}, ${story.description ?? null}, ${story.category ?? null}, ${story.content})
          `;
        }
      }
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export async function listStories(): Promise<Story[]> {
  await ensureSchema();
  const sql = db();
  return (await sql`
    select id, title, description, content, category, created_at, updated_at
    from stories
    order by created_at desc
  `) as Story[];
}

export async function getStory(id: string): Promise<Story | null> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`
    select id, title, description, content, category, created_at, updated_at
    from stories
    where id = ${id}
  `) as Story[];
  return rows[0] ?? null;
}

export async function insertStory(input: StoryInput): Promise<Story> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`
    insert into stories (title, description, category, content)
    values (${input.title}, ${input.description ?? null}, ${input.category ?? null}, ${input.content})
    returning id, title, description, content, category, created_at, updated_at
  `) as Story[];
  return rows[0]!;
}

export async function insertStories(inputs: StoryInput[]): Promise<number> {
  await ensureSchema();
  let added = 0;
  for (const input of inputs) {
    await insertStory(input);
    added += 1;
  }
  return added;
}

export async function updateStory(id: string, input: StoryInput): Promise<Story | null> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`
    update stories
    set title = ${input.title},
        description = ${input.description ?? null},
        category = ${input.category ?? null},
        content = ${input.content},
        updated_at = now()
    where id = ${id}
    returning id, title, description, content, category, created_at, updated_at
  `) as Story[];
  return rows[0] ?? null;
}

export async function deleteStory(id: string): Promise<boolean> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`delete from stories where id = ${id} returning id`) as { id: string }[];
  return rows.length > 0;
}
