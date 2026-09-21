import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/watch")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
