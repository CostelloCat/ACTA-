export type Book = {
  slug: string;
  title: string;
  tv: string;
  hits: string;
  bias: string;
  levels: string[];
  note: string;
};

export const BOOKS = {
  nq: {
    slug: "nq",
    title: "NQ / MNQ",
    tv: "https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21",
    hits: "Nasdaq 100 · MAG7 beta",
    bias: "Respect FOMC day. Do not fade the first 15 minutes after 14:00. Mag7 is the engine; NQ is the vehicle.",
    levels: ["Prior day high / low", "ONH / ONL", "VWAP", "Round 100s on NQ"],
    note: "Scalp MNQ off ES confirmation. If ES holds and NQ lags, wait. If NQ runs Mag7 headlines, size down into the presser.",
  },
  spx: {
    slug: "spx",
    title: "S&P 500 / ES",
    tv: "https://www.tradingview.com/chart/?symbol=CME_MINI%3AES1%21",
    hits: "ES · SPX cash",
    bias: "The rate tape. Dots and the statement hit ES first, NQ second.",
    levels: ["Prior day high / low", "VWAP", "Overnight range", "Yearly opening reference"],
    note: "Use ES as the tell for NQ. Iceberg / liquidity sweeps on 10m ES still matter on FOMC.",
  },
  gold: {
    slug: "gold",
    title: "Gold",
    tv: "https://www.tradingview.com/chart/?symbol=TVC%3AGOLD",
    hits: "GC · XAU",
    bias: "Real rates. Hawkish dots = sold. Dovish presser = bid. Don't trade the 8:30 if FOMC is the day.",
    levels: ["Prior day high / low", "London VWAP", "Round 50s"],
    note: "Gold often finishes FOMC opposite the first tick. Wait for Powell, not the statement.",
  },
  silver: {
    slug: "silver",
    title: "Silver",
    tv: "https://www.tradingview.com/chart/?symbol=TVC%3ASILVER",
    hits: "SI · XAG",
    bias: "Beta gold with industrial drag. Moves 1.5–2× gold on the same headline.",
    levels: ["Gold correlation", "Prior day high / low"],
    note: "If gold is the trade, silver is the expression. Size smaller. Spreads widen into 14:00.",
  },
  oil: {
    slug: "oil",
    title: "Oil",
    tv: "https://www.tradingview.com/chart/?symbol=TVC%3AUSOIL",
    hits: "CL · WTI",
    bias: "Inventory Wednesday, geopolitics always. FOMC is secondary unless the dollar rips.",
    levels: ["EIA window 10:30 ET", "Prior settle", "Gap fill"],
    note: "Ignore the TV forecast. Read the draw. Crude can fade a hike if inventories already did the work.",
  },
  vix: {
    slug: "vix",
    title: "VIX",
    tv: "https://www.tradingview.com/chart/?symbol=CBOE%3AVIX",
    hits: "Vol · ES puts",
    bias: "Event vol. FOMC morning bid, crush into the presser if the statement is as-expected.",
    levels: ["Spot 15 / 20 / 25", "Term structure"],
    note: "If VIX is already elevated into 14:00, the statement has to surprise to keep it bid.",
  },
  mag7: {
    slug: "mag7",
    title: "Mag 7",
    tv: "https://www.tradingview.com/chart/?symbol=NASDAQ%3ANVDA",
    hits: "AAPL · MSFT · NVDA · AMZN · META · GOOGL · TSLA",
    bias: "NQ is Mag7. Single-name headlines (NVDA, AAPL) still pin the index more than breadth.",
    levels: ["NQ confirmation", "Single-name VWAP"],
    note: "Don't average a Mag7 dump into FOMC. Let the dots print, then pick the leader.",
  },
  btc: {
    slug: "btc",
    title: "Bitcoin",
    tv: "https://www.tradingview.com/chart/?symbol=BITSTAMP%3ABTCUSD",
    hits: "BTC · DXY",
    bias: "Liquidity coin. Follows real rates and the dollar more than the white paper.",
    levels: ["Prior day high / low", "Round 1000s", "CME gap"],
    note: "If DXY rips on FOMC, BTC usually pays second. Don't fade the first hour.",
  },
  eth: {
    slug: "eth",
    title: "Ethereum",
    tv: "https://www.tradingview.com/chart/?symbol=BITSTAMP%3AETHUSD",
    hits: "ETH · BTC",
    bias: "Beta BTC with ETF flow. Weak ETH/BTC is risk-off inside crypto.",
    levels: ["BTC correlation", "Prior day high / low"],
    note: "ETH is the expression when BTC is the trade. Size down vs BTC.",
  },
  sol: {
    slug: "sol",
    title: "Solana",
    tv: "https://www.tradingview.com/chart/?symbol=BINANCE%3ASOLUSDT",
    hits: "SOL · BTC",
    bias: "High beta. Moves after BTC, not before.",
    levels: ["BTC lead", "Round 10s"],
    note: "If BTC is chop, SOL is a trap. Wait for the coin, then the beta.",
  },
  xrp: {
    slug: "xrp",
    title: "XRP",
    tv: "https://www.tradingview.com/chart/?symbol=BINANCE%3AXRPUSDT",
    hits: "XRP · headlines",
    bias: "Policy tape. Court and ETF headlines > chart.",
    levels: ["Headline VWAP"],
    note: "Don't trade XRP like NQ. It's a clip, not a session.",
  },
  xlm: {
    slug: "xlm",
    title: "Stellar",
    tv: "https://www.tradingview.com/chart/?symbol=BINANCE%3AXLMUSDT",
    hits: "XLM · XRP",
    bias: "Satellite of XRP and BTC. Thin. Size off.",
    levels: ["BTC / XRP lead"],
    note: "If you need beta, SOL is cleaner. XLM is the leftover.",
  },
};
