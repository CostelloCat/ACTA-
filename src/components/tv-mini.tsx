import { useEffect, useRef } from "react";

export function TvMini({ symbol }: { symbol: string }) {
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
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.text = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    });
    wrap.append(inner, script);
    host.append(wrap);
  }, [symbol]);

  return (
    <div className="bg-surface border-line h-52 overflow-hidden rounded-2xl border">
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
