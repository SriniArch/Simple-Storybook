import { Link } from "@tanstack/react-router";
import { BookOpenText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";

export function SiteHeader() {
  const { isAdmin, logout } = useAdminAuth();
  const navItems = [
    { to: "/", label: "Stories" },
    ...(isAdmin
      ? ([
          { to: "/add", label: "Add Story" },
          { to: "/bulk-upload", label: "Bulk Upload" },
        ] as const)
      : []),
    { to: "/admin", label: isAdmin ? "Admin" : "Admin Login" },
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="group flex items-center gap-3 self-start">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-white to-amber-100 text-sky-500 shadow-sm ring-1 ring-sky-200/60 transition-transform group-hover:-rotate-3 group-hover:scale-105">
            <BookOpenText className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground">
              Stories
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
            </span>
            <span className="text-xs text-muted-foreground">A playful shelf of adventures</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <nav className="flex flex-wrap items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 shadow-sm" aria-label="Main">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground shadow-sm hover:bg-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {isAdmin && (
            <Button type="button" variant="outline" size="sm" onClick={logout} className="rounded-full">
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
