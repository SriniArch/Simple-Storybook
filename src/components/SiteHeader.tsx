import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

const navItems = [
  { to: "/", label: "Stories" },
  { to: "/add", label: "Add Story" },
  { to: "/bulk-upload", label: "Bulk Upload" },
  // { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          Stories
        </Link>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
