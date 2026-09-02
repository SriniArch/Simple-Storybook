import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
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
  return <Navigate to="/" replace />;
}
