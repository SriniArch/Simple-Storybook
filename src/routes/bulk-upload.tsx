import { Navigate, createFileRoute } from "@tanstack/react-router";
import { BulkUploadStories } from "@/components/BulkUploadStories";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/bulk-upload")({
  head: () => ({
    meta: [
      { title: "Bulk upload — Stories" },
      {
        name: "description",
        content: "Import many stories at once from a CSV file with title, description, category and content columns.",
      },
      { property: "og:title", content: "Bulk upload — Stories" },
      { property: "og:description", content: "Import many stories at once from a CSV file." },
    ],
  }),
  component: BulkUploadPage,
});

function BulkUploadPage() {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) {
    return <Navigate to="/admin" search={{ redirect: "/bulk-upload" }} replace />;
  }

  return (
    <BulkUploadStories
      title="Bulk upload"
      description={
        <>
          Upload a CSV with the columns <code className="rounded bg-muted px-1 py-0.5 text-sm">title</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">description</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">category</code> and{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">content</code>. Title and content are required.
        </>
      }
    />
  );
}

