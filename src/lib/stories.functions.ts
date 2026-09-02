import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { storySchema } from "./story-schema";
import type { StoryRecord } from "./story-schema";

const idSchema = z.object({ id: z.string().uuid("Invalid story id") });

const payloadSchema = storySchema.transform((values) => ({
  title: values.title.trim(),
  description: values.description?.trim() ? values.description.trim() : null,
  category: values.category?.trim() ? values.category.trim() : null,
  content: values.content.trim(),
}));

export const listStories = createServerFn({ method: "GET" }).handler(async (): Promise<StoryRecord[]> => {
  const { listStories: read } = await import("./stories.server");
  return read();
});

export const getStory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }): Promise<StoryRecord | null> => {
    const { getStory: read } = await import("./stories.server");
    return read(data.id);
  });

export const createStory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }): Promise<StoryRecord> => {
    const { insertStory } = await import("./stories.server");
    return insertStory(data);
  });

export const updateStory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), values: payloadSchema }).parse(input),
  )
  .handler(async ({ data }): Promise<StoryRecord | null> => {
    const { updateStory: write } = await import("./stories.server");
    return write(data.id, data.values);
  });

export const deleteStory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }): Promise<{ deleted: boolean }> => {
    const { deleteStory: remove } = await import("./stories.server");
    return { deleted: await remove(data.id) };
  });

export const bulkCreateStories = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ stories: z.array(payloadSchema).min(1).max(500) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ added: number }> => {
    const { insertStories } = await import("./stories.server");
    return { added: await insertStories(data.stories) };
  });
