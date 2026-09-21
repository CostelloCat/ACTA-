import { createFileRoute } from "@tanstack/react-router";
import { MarketView } from "@/components/market-view";
import { BOOKS } from "@/lib/markets";

export const Route = createFileRoute("/oil")({ component: () => <MarketView book={BOOKS.oil} /> });
