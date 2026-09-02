import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storySchema, type StoryFormValues } from "@/lib/story-schema";

type Props = {
  initialValues?: Partial<StoryFormValues>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: StoryFormValues) => void;
  onCancel?: () => void;
};

export function StoryForm({ initialValues, submitLabel, pending, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<StoryFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    category: initialValues?.category ?? "",
    content: initialValues?.content ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = storySchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={values.title}
          maxLength={200}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="The Clever Rabbit"
        />
        {errors["title"] && <p className="text-sm text-destructive">{errors["title"]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short description</Label>
        <Input
          id="description"
          value={values.description ?? ""}
          maxLength={500}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="A clever rabbit outwits a hungry lion."
        />
        {errors["description"] && <p className="text-sm text-destructive">{errors["description"]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={values.category ?? ""}
          maxLength={80}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          placeholder="Animals"
        />
        {errors["category"] && <p className="text-sm text-destructive">{errors["category"]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">
          Story <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          value={values.content}
          rows={14}
          onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
          placeholder="Once upon a time..."
          className="text-base leading-relaxed"
        />
        {errors["content"] && <p className="text-sm text-destructive">{errors["content"]}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
