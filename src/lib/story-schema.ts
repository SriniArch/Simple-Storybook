import { z } from "zod";

export const storySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .trim()
    .max(80, "Category must be under 80 characters")
    .optional()
    .or(z.literal("")),
  content: z.string().trim().min(1, "Story content is required").max(100000, "Story is too long"),
});

export type StoryFormValues = z.infer<typeof storySchema>;

export type StoryRecord = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export function normalize(values: StoryFormValues) {
  return {
    title: values.title.trim(),
    description: values.description?.trim() ? values.description.trim() : null,
    category: values.category?.trim() ? values.category.trim() : null,
    content: values.content.trim(),
  };
}
