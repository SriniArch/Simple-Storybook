import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpenText, Cloud, Sparkles, Star } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/SiteHeader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="relative max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-[0_20px_70px_-28px_rgba(125,140,170,0.38)] backdrop-blur">
        <div className="absolute left-4 top-4 text-sky-200" aria-hidden="true">
          <Cloud className="h-8 w-8" />
        </div>
        <div className="absolute right-5 top-6 text-amber-200" aria-hidden="true">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-white to-amber-100 text-sky-500 shadow-sm ring-1 ring-sky-200/70">
          <BookOpenText className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-foreground">404</h1>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">This page flew away</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved to another shelf.
        </p>
        <div className="mt-7">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Back to stories
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
          <span>Tiptoe back to the story shelf</span>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-[0_20px_70px_-28px_rgba(125,140,170,0.38)] backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 via-white to-sky-100 text-violet-500 shadow-sm ring-1 ring-violet-200/70">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent"
          >
            Back to stories
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Stories — A playful storybook" },
      { name: "description", content: "A modern, playful story library for curious kids." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Stories — A playful storybook" },
      { property: "og:description", content: "A modern, playful story library for curious kids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-Q2Q8GWHTXL"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q2Q8GWHTXL');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen overflow-hidden text-foreground">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-16 top-20 h-40 w-40 rounded-full bg-sky-200/25 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-rose-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl" />
          <div className="absolute left-[8%] top-[18%] text-sky-200/40">
            <Star className="h-5 w-5" />
          </div>
          <div className="absolute right-[12%] top-[28%] text-amber-200/40">
            <Star className="h-4 w-4" />
          </div>
          <div className="absolute bottom-[18%] right-[18%] text-violet-200/40">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div className="relative z-10">
          <SiteHeader />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
      </div>
    </QueryClientProvider>
  );
}
