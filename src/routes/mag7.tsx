import { createFileRoute } from "@tanstack/react-router";
import { MarketView } from "@/components/market-view";
import { BOOKS } from "@/lib/markets";

export const Route = createFileRoute("/mag7")({
  component: () => <MarketView book={BOOKS.mag7} />,
});
