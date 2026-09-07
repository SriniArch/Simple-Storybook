import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpenText, Cloud, Search, Sparkles, Star, WandSparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";
import { storiesQueryOptions } from "@/lib/stories-queries";
import { getStoryTone } from "@/lib/story-style";

function shuffleStories<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stories — A simple story library" },
      {
        name: "description",
        content: "Browse, search and read every story in your library.",
      },
      { property: "og:title", content: "Stories — A simple story library" },
      {
        property: "og:description",
        content: "Browse, search and read every story in your library.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(storiesQueryOptions());
  },
  component: StoriesPage,
});

function StoriesPage() {
  const { isAdmin } = useAdminAuth();
  const { data: stories } = useSuspenseQuery(storiesQueryOptions());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const randomStories = useMemo(() => shuffleStories(stories), [stories]);

  const categories = useMemo(
    () => Array.from(new Set(stories.map((s) => s.category).filter((c): c is string => !!c))).sort(),
    [stories],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return randomStories.filter((story) => {
      if (category && story.category !== category) return false;
      if (!q) return true;
      return [story.title, story.description ?? "", story.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [randomStories, search, category]);

  const activeTone = getStoryTone(category ?? filtered[0]?.category ?? stories[0]?.category ?? "stories");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-white via-sky-50/80 to-rose-50/80 px-5 py-7 shadow-[0_18px_60px_-36px_rgba(125,140,170,0.45)] sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-3 top-4 text-sky-200/70">
            <Cloud className="h-9 w-9" />
          </div>
          <div className="absolute right-5 top-5 text-amber-200/70">
            <Star className="h-5 w-5" />
          </div>
          <div className="absolute bottom-4 right-6 text-violet-200/70">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/60">
              <WandSparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              {stories.length} {stories.length === 1 ? "storybook" : "storybooks"} ready to explore
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              A cozy shelf of stories for curious readers
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Search by title, topic, or mood, then open any story like a page in a favorite book.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3 lg:w-[24rem]">
            {[
              { label: "Randomized", value: "Fresh each visit" },
              { label: "Kid-friendly", value: "Ages 6–13" },
              { label: "Reading time", value: "At your pace" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-1 break-words text-sm font-semibold text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-6 rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stories, characters, or topics"
                aria-label="Search stories"
                className="h-12 rounded-full border-border/70 bg-background pl-10 text-base shadow-sm transition-shadow focus-visible:shadow-md"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpenText className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Pick a category or wander the whole shelf.</span>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={category === null ? "default" : "outline"}
                onClick={() => setCategory(null)}
                className="rounded-full"
              >
                All stories
              </Button>
              {categories.map((c) => {
                const tone = getStoryTone(c);
                return (
                  <Button
                    key={c}
                    size="sm"
                    variant={category === c ? "default" : "outline"}
                    onClick={() => setCategory(c)}
                    className={`rounded-full ${category === c ? "shadow-sm" : "bg-white/70"}`}
                  >
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                    {c}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-border/70 bg-card/90 p-10 text-center shadow-[0_18px_60px_-36px_rgba(125,140,170,0.45)]">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${activeTone.panel} text-primary shadow-sm ring-1 ${activeTone.ring}`}>
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-lg font-semibold text-foreground">No stories match your search.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Try a different word or choose another category from the shelf.
          </p>
          {isAdmin ? (
            <Link to="/add" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:text-primary/80">
              Add a story
            </Link>
          ) : (
            <Link
              to="/admin"
              search={{ redirect: "/add" }}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:text-primary/80"
            >
              Login as admin to add stories
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story) => {
            const tone = getStoryTone(story.category ?? story.title);

            return (
              <li key={story.id}>
                <Link
                  to="/stories/$id"
                  params={{ id: story.id }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-5 shadow-[0_12px_40px_-26px_rgba(125,140,170,0.45)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_-28px_rgba(125,140,170,0.55)] focus-visible:-translate-y-1"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone.accent}`} aria-hidden="true" />
                  <div className="absolute right-4 top-4 text-amber-200 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" aria-hidden="true">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="absolute bottom-4 right-4 text-sky-200 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                    <Cloud className="h-6 w-6" />
                  </div>
                  {story.category && (
                    <span className={`mb-4 w-fit rounded-full border px-3 py-1 text-xs font-semibold ring-1 ${tone.badge}`}>
                      {story.category}
                    </span>
                  )}
                  <h2 className="text-2xl font-semibold tracking-tight text-card-foreground transition-colors group-hover:text-primary">
                    {story.title}
                  </h2>
                  {story.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{story.description}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform duration-200 group-hover:translate-x-1">
                    Read story
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
