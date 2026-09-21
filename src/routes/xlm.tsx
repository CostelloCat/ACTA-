import { createFileRoute } from "@tanstack/react-router";
import { MarketView } from "@/components/market-view";
import { BOOKS } from "@/lib/markets";

export const Route = createFileRoute("/xlm")({ component: () => <MarketView book={BOOKS.xlm} /> });
