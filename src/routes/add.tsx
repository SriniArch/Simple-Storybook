import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { StoryForm } from "@/components/StoryForm";
import { createStory } from "@/lib/stories.functions";
import type { StoryFormValues } from "@/lib/story-schema";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add a story — Stories" },
      { name: "description", content: "Write a new story with a title, optional description and category." },
      { property: "og:title", content: "Add a story — Stories" },
      { property: "og:description", content: "Write and save a new story to your library." },
    ],
  }),
  component: AddStoryPage,
});

function AddStoryPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useServerFn(createStory);

  const mutation = useMutation({
    mutationFn: (values: StoryFormValues) => create({ data: values }),
    onSuccess: async (story) => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      router.invalidate();
      toast.success("Story added");
      navigate({ to: "/stories/$id", params: { id: story.id } });
    },
    onError: () => toast.error("Could not save the story"),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Add a story</h1>
      <p className="mt-2 text-muted-foreground">Title and story content are required.</p>
      <div className="mt-8">
        <StoryForm
          submitLabel="Save story"
          pending={mutation.isPending}
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={() => navigate({ to: "/" })}
        />
      </div>
    </div>
  );
}
