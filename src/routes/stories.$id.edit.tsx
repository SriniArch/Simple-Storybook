import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { StoryForm } from "@/components/StoryForm";
import { storyQueryOptions } from "@/lib/stories-queries";
import { updateStory } from "@/lib/stories.functions";
import type { StoryFormValues } from "@/lib/story-schema";

export const Route = createFileRoute("/stories/$id/edit")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(storyQueryOptions(params.id));
  },
  head: () => ({
    meta: [
      { title: "Edit story — Stories" },
      { name: "description", content: "Update the title, description, category or content of a story." },
      { property: "og:title", content: "Edit story — Stories" },
      { property: "og:description", content: "Update an existing story in your library." },
    ],
  }),
  component: EditStoryPage,
});

function EditStoryPage() {
  const { id } = Route.useParams();
  const { data: story } = useSuspenseQuery(storyQueryOptions(id));
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const save = useServerFn(updateStory);

  const mutation = useMutation({
    mutationFn: (values: StoryFormValues) => save({ data: { id, values } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      router.invalidate();
      toast.success("Story updated");
      navigate({ to: "/stories/$id", params: { id } });
    },
    onError: () => toast.error("Could not save the story"),
  });

  if (!story) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Story not found</h1>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Back to stories
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Edit story</h1>
      <p className="mt-2 text-muted-foreground">Make changes and save when you're ready.</p>
      <div className="mt-8">
        <StoryForm
          initialValues={{
            title: story.title,
            description: story.description ?? "",
            category: story.category ?? "",
            content: story.content,
          }}
          submitLabel="Save changes"
          pending={mutation.isPending}
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={() => navigate({ to: "/stories/$id", params: { id } })}
        />
      </div>
    </div>
  );
}
