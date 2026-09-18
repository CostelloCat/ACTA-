import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/screener")({
  beforeLoad: () => {
    throw redirect({ to: "/calendar" });
  },
  component: () => null,
});
