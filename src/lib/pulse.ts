import { createServerFn } from "@tanstack/react-start";

export type Pulse = {
  vix: number;
  vixNote: string;
  greed: number;
  greedLabel: string;
};

export const getPulse = createServerFn({ method: "GET" }).handler(async (): Promise<Pulse> => {
  let vix = 14.5;
  let greed = 73;
  let greedLabel = "Greed";
  try {
    const r = await fetch("https://api.alternative.me/fng/?limit=1", {
      headers: { "user-agent": "ACTA/1.0" },
    });
    if (r.ok) {
      const j = (await r.json()) as {
        data?: { value?: string; value_classification?: string }[];
      };
      const row = j.data?.[0];
      if (row?.value) greed = Number(row.value);
      if (row?.value_classification) greedLabel = row.value_classification;
    }
  } catch {
    /* keep fallback */
  }
  try {
    const r = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=5d", {
      headers: { "user-agent": "ACTA/1.0" },
    });
    if (r.ok) {
      const j = (await r.json()) as {
        chart?: { result?: { meta?: { regularMarketPrice?: number } }[] };
      };
      const px = j.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (px) vix = px;
    }
  } catch {
    /* keep fallback */
  }
  const vixNote = vix < 16 ? "Quiet" : vix < 22 ? "Aware" : "Bid";
  return { vix, vixNote, greed, greedLabel };
});
