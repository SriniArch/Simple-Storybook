import { FormEvent, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : "/",
  }),
  staticData: {
    hideInMenu: true,
    hidden: true,
    nav: false,
  },
  head: () => ({
    meta: [
      { title: "Admin — Stories" },
      {
        name: "description",
        content: "Import stories in bulk from a CSV file. This page is intended for administrators.",
      },
      { property: "og:title", content: "Admin — Stories" },
      { property: "og:description", content: "Import stories in bulk from a CSV file." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { isAdmin, login, logout } = useAdminAuth();
  const [code, setCode] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(code);
    if (!ok) {
      toast.error("Invalid admin code");
      return;
    }

    toast.success("Admin access granted");
    navigate({ to: search.redirect || "/" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Admin</h1>
      <p className="mt-2 text-muted-foreground">Enter the admin code to manage stories.</p>

      {isAdmin ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-foreground">You are signed in as admin.</p>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={() => navigate({ to: "/" })}>
              Go to stories
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                logout();
                toast.success("Logged out");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-foreground" htmlFor="admin-code">
            Admin code
          </label>
          <Input
            id="admin-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            autoComplete="off"
          />
          <Button type="submit">Login</Button>
        </form>
      )}
    </div>
  );
}
