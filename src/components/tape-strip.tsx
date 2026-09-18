import { useEffect, useRef } from "react";

export function TapeStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.replaceChildren();
    const wrap = document.createElement("div");
    wrap.className = "tradingview-widget-container";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify({
      symbols: [
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "TVC:GOLD", title: "GOLD" },
        { proName: "TVC:SILVER", title: "SILVER" },
        { proName: "TVC:USOIL", title: "WTI" },
        { proName: "TVC:UKOIL", title: "BRENT" },
        { proName: "CBOE:VIX", title: "VIX" },
        { proName: "FX_IDC:USDX", title: "DXY" },
      ],
      showSymbolLogo: true,
      colorTheme: "light",
      isTransparent: false,
      displayMode: "compact",
      locale: "en",
    });
    wrap.append(inner, script);
    host.append(wrap);
  }, []);

  return (
    <div className="px-3 sm:px-4">
      <div className="bg-tape mx-auto h-[46px] max-w-6xl overflow-hidden rounded-full">
        <div ref={ref} className="tape-host h-[46px] w-full" />
      </div>
    </div>
  );
}
