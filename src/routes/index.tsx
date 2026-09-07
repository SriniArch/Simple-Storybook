import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";
import { storiesQueryOptions } from "@/lib/stories-queries";

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">All stories</h1>
        <p className="text-muted-foreground">
          {stories.length} {stories.length === 1 ? "story" : "stories"} in your library, shown in random order.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description or category"
          aria-label="Search stories"
          className="max-w-md"
        />
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={category === null ? "default" : "outline"}
              onClick={() => setCategory(null)}
            >
              All
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-muted/40 p-10 text-center">
          <p className="text-foreground">No stories match your search.</p>
          {isAdmin ? (
            <Link to="/add" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Add a story
            </Link>
          ) : (
            <Link
              to="/admin"
              search={{ redirect: "/add" }}
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Login as admin to add stories
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story) => (
            <li key={story.id}>
              <Link
                to="/stories/$id"
                params={{ id: story.id }}
                className="flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                {story.category && (
                  <span className="mb-3 w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {story.category}
                  </span>
                )}
                <h2 className="text-lg font-semibold text-card-foreground">{story.title}</h2>
                {story.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{story.description}</p>
                )}
                <span className="mt-4 text-sm font-medium text-primary">Read story →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
