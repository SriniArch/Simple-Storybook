import { queryOptions } from "@tanstack/react-query";
import { getStory, listStories } from "./stories.functions";

export const storiesQueryOptions = () =>
  queryOptions({
    queryKey: ["stories"] as const,
    queryFn: () => listStories(),
  });

export const storyQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["stories", id] as const,
    queryFn: () => getStory({ data: { id } }),
  });
