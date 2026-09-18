import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/truth")({
  beforeLoad: () => {
    throw redirect({ to: "/socials" });
  },
});
