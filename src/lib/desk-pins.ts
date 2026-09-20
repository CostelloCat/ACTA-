export type Pin = {
  slug: string;
  label: string;
  to: string;
};

export const PIN_CATALOG: Pin[] = [
  { slug: "nq", label: "NQ", to: "/nq" },
  { slug: "spx", label: "S&P 500", to: "/spx" },
  { slug: "gold", label: "Gold", to: "/gold" },
  { slug: "silver", label: "Silver", to: "/silver" },
  { slug: "oil", label: "Oil", to: "/oil" },
  { slug: "vix", label: "VIX", to: "/vix" },
  { slug: "btc", label: "BTC", to: "/btc" },
  { slug: "eth", label: "ETH", to: "/eth" },
  { slug: "sol", label: "SOL", to: "/sol" },
  { slug: "xrp", label: "XRP", to: "/xrp" },
  { slug: "xlm", label: "XLM", to: "/xlm" },
  { slug: "mag7", label: "Mag 7", to: "/mag7" },
];

// Keep the persistent rail useful at a glance. The full catalog remains one click away.
export const DEFAULT_PINS = ["nq", "spx", "gold", "btc"];

const KEY = "acta-desk-pins";

export function pinBySlug(slug: string) {
  return PIN_CATALOG.find((p) => p.slug === slug);
}

export function readPins(): string[] {
  if (typeof localStorage === "undefined") return DEFAULT_PINS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PINS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_PINS;
    const slugs = parsed.filter((s): s is string => typeof s === "string" && Boolean(pinBySlug(s)));
    return slugs.length ? slugs : DEFAULT_PINS;
  } catch {
    return DEFAULT_PINS;
  }
}

export function writePins(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
}
