import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bulkCreateStories } from "@/lib/stories.functions";
import { storySchema, type StoryFormValues } from "@/lib/story-schema";

type RowError = { row: number; message: string };
type Summary = { added: number; skipped: number; errors: number };

type Props = {
  title: string;
  description: ReactNode;
};

export function BulkUploadStories({ title, description }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const importStories = useServerFn(bulkCreateStories);

  const [fileName, setFileName] = useState<string | null>(null);
  const [valid, setValid] = useState<StoryFormValues[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const mutation = useMutation({
    mutationFn: () => importStories({ data: { stories: valid } }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      router.invalidate();
      setSummary({ added: result.added, skipped: errors.length, errors: errors.length });
      setValid([]);
      toast.success(`${result.added} ${result.added === 1 ? "story" : "stories"} imported`);
    },
    onError: () => toast.error("Import failed"),
  });

  function reset() {
    setValid([]);
    setErrors([]);
    setSummary(null);
  }

  function handleFile(file: File) {
    reset();
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const nextValid: StoryFormValues[] = [];
        const nextErrors: RowError[] = [];

        results.data.forEach((raw, index) => {
          const rowNumber = index + 2;
          const parsed = storySchema.safeParse({
            title: raw["title"] ?? "",
            description: raw["description"] ?? "",
            category: raw["category"] ?? "",
            content: raw["content"] ?? "",
          });
          if (parsed.success) {
            nextValid.push(parsed.data);
          } else {
            nextErrors.push({
              row: rowNumber,
              message: parsed.error.issues.map((issue) => issue.message).join("; "),
            });
          }
        });

        if (nextValid.length === 0 && nextErrors.length === 0) {
          toast.error("No rows found in that CSV");
        }
        setValid(nextValid);
        setErrors(nextErrors);
      },
      error: () => toast.error("Could not read that file"),
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>

      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-5">
        <Input
          type="file"
          accept=".csv,text/csv"
          aria-label="Choose a CSV file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="max-w-sm bg-background"
        />
        {fileName && <p className="mt-3 text-sm text-muted-foreground">Selected: {fileName}</p>}
      </div>

      {summary && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-card-foreground">Import summary</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>Stories added: {summary.added}</li>
            <li>Rows skipped: {summary.skipped}</li>
            <li>Rows with errors: {summary.errors}</li>
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-5">
          <h2 className="text-base font-semibold text-foreground">
            {errors.length} {errors.length === 1 ? "row" : "rows"} will be skipped
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {errors.slice(0, 20).map((error) => (
              <li key={error.row}>
                Row {error.row}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {valid.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-foreground">
            Preview — {valid.length} {valid.length === 1 ? "story" : "stories"} ready to import
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Content</th>
                </tr>
              </thead>
              <tbody>
                {valid.slice(0, 25).map((story, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="px-4 py-2 font-medium text-foreground">{story.title}</td>
                    <td className="max-w-[16rem] truncate px-4 py-2 text-muted-foreground">
                      {story.description || "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{story.category || "—"}</td>
                    <td className="max-w-[20rem] truncate px-4 py-2 text-muted-foreground">
                      {story.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {valid.length > 25 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing the first 25 rows. All {valid.length} valid rows will be imported.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? "Importing..." : `Import ${valid.length} stories`}
            </Button>
            <Button variant="outline" onClick={reset} disabled={mutation.isPending}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
