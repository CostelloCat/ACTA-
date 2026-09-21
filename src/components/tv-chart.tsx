import { useEffect, useRef } from "react";

export function TvChart({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.replaceChildren();
    const wrap = document.createElement("div");
    wrap.className = "tradingview-widget-container h-full";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget h-full";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#050506",
      hide_legend: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    wrap.append(inner, script);
    host.append(wrap);
  }, [symbol]);

  return <div ref={ref} className="bg-surface border-line h-[420px] overflow-hidden rounded-xl border sm:h-[520px]" />;
}
