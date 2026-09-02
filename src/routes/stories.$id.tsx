import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { storyQueryOptions } from "@/lib/stories-queries";
import { deleteStory } from "@/lib/stories.functions";

export const Route = createFileRoute("/stories/$id")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(storyQueryOptions(params.id));
  },
  head: () => ({
    meta: [
      { title: "Read a story" },
      { name: "description", content: "A distraction-free reading view for your story." },
      { property: "og:title", content: "Read a story" },
      { property: "og:description", content: "A distraction-free reading view for your story." },
    ],
  }),
  component: ReadStoryPage,
});

function ReadStoryPage() {
  const { id } = Route.useParams();
  const { data: story } = useSuspenseQuery(storyQueryOptions(id));
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const remove = useServerFn(deleteStory);

  const deleteMutation = useMutation({
    mutationFn: () => remove({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      router.invalidate();
      toast.success("Story deleted");
      navigate({ to: "/" });
    },
    onError: () => toast.error("Could not delete the story"),
  });

  if (!story) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Story not found</h1>
        <p className="mt-2 text-muted-foreground">This story may have been deleted.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Back to stories
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to stories
      </Link>

      {story.category && (
        <span className="mt-6 inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
          {story.category}
        </span>
      )}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {story.title}
      </h1>
      {story.description && <p className="mt-3 text-lg text-muted-foreground">{story.description}</p>}

      <div className="mt-8 space-y-5 text-lg leading-8 text-foreground">
        {story.content.split(/\n\s*\n/).map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-6">
        <Button asChild variant="outline">
          <Link to="/stories/$id/edit" params={{ id }}>
            Edit story
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this story?</AlertDialogTitle>
              <AlertDialogDescription>
                “{story.title}” will be permanently removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
