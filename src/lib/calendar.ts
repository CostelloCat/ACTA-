export type CalKind = "rates" | "inflation" | "oil" | "mag7";

export type CalEvent = {
  date: string;
  time?: string;
  sourceUrl?: string;
  title: string;
  short: string;
  kind: CalKind;
  hits: string;
  context: string;
  history: string;
};

export const KIND_LABEL: Record<CalKind, string> = {
  rates: "Rates",
  inflation: "Inflation",
  oil: "Oil",
  mag7: "Mag 7",
};

export const EVENTS: CalEvent[] = [
  {
    date: "2026-09-04",
    time: "8:30",
    title: "NFP / Employment Situation (Aug)",
    short: "NFP",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Jobs print sets the rate path. Soft = duration bid. Hot = dollar up, gold down.",
    history:
      "NFP surprises >100k vs consensus usually gap NQ/ES 0.4–0.8% in the first 5 minutes. Gold fades a hot print, bids a miss. The 9:00–10:00 ET fade is common unless revisions are ugly.",
  },
  {
    date: "2026-09-07",
    title: "US Labor Day",
    short: "Labor Day",
    kind: "rates",
    hits: "NQ · ES",
    context: "Cash equity closed. Futures thin. Gulf and London still print oil and gold.",
    history:
      "US holiday sessions: NQ range compresses. Fake breaks in Asia get faded into London. Don't size like a Tuesday.",
  },
  {
    date: "2026-09-09",
    time: "13:00",
    title: "Apple event",
    short: "AAPL event",
    kind: "mag7",
    hits: "NQ · AAPL",
    context: "Hardware cycle. MAG7 tape, not oil.",
    history:
      "AAPL events gap the name, not the index, unless guidance changes the multiple. Fade the first NQ spike if it's just hardware theater.",
  },
  {
    date: "2026-09-10",
    time: "8:30",
    title: "PPI",
    short: "PPI 08:30",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "Pipeline inflation into Friday CPI. Hot PPI front-runs a hawkish tape.",
    history:
      "Hot core PPI usually dumps duration and NQ into CPI. Soft PPI is a gold bid that often gives back if CPI doesn't confirm. Trade the first 15 minutes, then wait for CPI.",
  },
  {
    date: "2026-09-10",
    title: "NVDA Goldman Sachs conference",
    short: "NVDA GS",
    kind: "mag7",
    hits: "NQ · NVDA",
    context: "Guidance tone moves the Nasdaq more than the print.",
    history:
      "NVDA conference tone moves NQ more than ES. A cautious data-center comment can fade NQ 0.3–0.6% even on a quiet macro day.",
  },
  {
    date: "2026-09-10",
    title: "OPEC MOMR",
    short: "OPEC MOMR",
    kind: "oil",
    hits: "CL · GOLD",
    context: "Monthly oil report. Inventory surprise. Ignore the TV forecast. Read the draw.",
    history:
      "MOMR moves CL if the demand revision is >0.5 mb/d. Gold follows only if crude rips >3%. NQ usually ignores it.",
  },
  {
    date: "2026-09-10",
    title: "ECB decision",
    short: "ECB",
    kind: "rates",
    hits: "ES · GOLD",
    context: "Euro path into FOMC week. Dovish ECB = dollar bid into Wednesday.",
    history:
      "Dovish ECB = EUR fade, DXY bid, gold heavy into a US hike week. Hawkish ECB can bid gold for 30–60 minutes then fade into FOMC.",
  },
  {
    date: "2026-09-11",
    time: "8:30",
    title: "CPI",
    short: "CPI 08:30",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "The print that FOMC actually sits on. Core is the tape.",
    history:
      "Core CPI ±0.1 vs cons is a 15-minute NQ/ES impulse then a grind. ±0.2 is a trend day. Gold is inverse DXY. Stop chasing after 9:15 unless breadth confirms.",
  },
  {
    date: "2026-09-16",
    time: "8:30",
    title: "Retail Sales (Aug)",
    short: "Retail",
    kind: "inflation",
    hits: "NQ · ES",
    context: "Consumer spend into a hike day. Soft sales cap the hawk.",
    history:
      "Retail sales rarely own the day if FOMC is later. Soft control-group sales cap the hawk for an hour, then the dots take over.",
  },
  {
    date: "2026-09-16",
    time: "14:00",
    title: "FOMC + dots",
    short: "FOMC + dots",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Quarterly SEP. Decision 14:00, presser 14:30. Dots > the 25bp.",
    history:
      "The 14:00 decision is often a fake. Real tape is 14:30–15:15 in the presser. Dots > the 25bp. Gold typically dumps a hawkish SEP, then chops. NQ shorts the first spike if the dots don't cut 2026.",
  },
  {
    date: "2026-09-17",
    time: "8:30",
    title: "Housing starts / claims",
    short: "Housing",
    kind: "rates",
    hits: "NQ · ES",
    context: "Post-FOMC digestion. Claims for the labor path, not the headline.",
    history:
      "Post-FOMC housing/claims: initial spike is usually faded. Claims +20k vs cons can bid duration and gold; housing rarely moves NQ unless it misses 8%+.",
  },
  {
    date: "2026-09-17",
    title: "Bank of England",
    short: "BoE",
    kind: "rates",
    hits: "ES · GOLD",
    context: "Cable and gold. Secondary to last night's dots.",
    history:
      "BoE is a cable/gold 20-minute event. ES only cares if they surprise vs the Fed path. Fade unless it's a 25bp miss.",
  },
  {
    date: "2026-09-18",
    time: "9:15",
    title: "Industrial production",
    short: "IP",
    kind: "rates",
    hits: "ES",
    context: "Factory pulse. Rarely the tape unless it misses hard.",
    history: "IP is a 5-minute ES twitch unless the miss is >0.8%. Don't size it like CPI.",
  },
  {
    date: "2026-09-11",
    time: "10:00",
    title: "UMich sentiment (prelim)",
    short: "UMich",
    kind: "inflation",
    hits: "NQ · GOLD",
    context: "Inflation expectations inside the survey move gold more than the headline.",
    history:
      "UMich 5y inflation expectations ±0.2 move gold more than the headline sentiment print. NQ cares if 1y inflation jumps. Fade the headline, trade the inflation table.",
  },
  {
    date: "2026-09-24",
    time: "10:00",
    title: "New home sales",
    short: "Homes",
    kind: "rates",
    hits: "ES",
    context: "Rate-sensitive demand. Follows claims, not CPI.",
    history:
      "New home sales move rates more than NQ. A 10% miss can bid ES for an hour if it confirms cooling housing into the next NFP.",
  },
  {
    date: "2026-09-25",
    time: "8:30",
    sourceUrl: "https://www.census.gov/manufacturing/m3/release_schedule.html",
    title: "Durable goods",
    short: "Durables",
    kind: "rates",
    hits: "ES · NQ",
    context: "Capex pulse. Core ex-aircraft is the read.",
    history:
      "Ignore the headline. Core capex ex-aircraft is the read. A 1%+ miss can fade NQ with Mag7 if it smells like capex slowdown.",
  },
  {
    date: "2026-09-25",
    time: "10:00",
    sourceUrl: "https://data.sca.isr.umich.edu/fetchdoc.php?docid=79628",
    title: "UMich sentiment + inflation expectations (final)",
    short: "UMich final",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context:
      "The inflation-expectations revisions are the tape. Read the 1-year and 5-year measures before the sentiment headline.",
    history:
      "A material upward revision to inflation expectations can lift yields and DXY while pressuring NQ and gold. A softer revision can reverse that path. The headline sentiment number matters less unless the revision is large and rates confirm.",
  },
  {
    date: "2026-09-29",
    time: "10:00",
    sourceUrl: "https://www.bls.gov/schedule/news_release/jolts.htm",
    title: "JOLTS (Aug)",
    short: "JOLTS",
    kind: "rates",
    hits: "NQ · ES",
    context: "Openings into Friday NFP week. Quits rate is the wage tell.",
    history:
      "JOLTS openings ±300k vs cons move NQ/ES into NFP week. Quits rate is the wage tell — that's what gold and duration actually trade.",
  },
  {
    date: "2026-09-29",
    time: "10:00",
    sourceUrl: "https://www.conference-board.org/topics/consumer-confidence/",
    title: "Consumer confidence (Sep)",
    short: "Confidence",
    kind: "rates",
    hits: "ES · NQ · DXY",
    context: "Confidence and labor-market expectations can shift the growth story ahead of payrolls.",
    history: "Compare expectations and jobs-availability details with JOLTS at the same time. Watch yields and ES breadth before assigning a direction.",
  },
  {
    date: "2026-09-29",
    time: "13:00",
    sourceUrl: "https://devday.openai.com/",
    title: "OpenAI DevDay — Sam Altman keynote",
    short: "Altman",
    kind: "mag7",
    hits: "NQ · MSFT · NVDA",
    context: "Confirmed 10:00 a.m. Pacific keynote. Product, model and compute economics matter more than a stage appearance.",
    history: "First watch MSFT and NVDA, then semiconductor breadth and NQ. Separate capacity or pricing changes from demo headlines.",
  },
  {
    date: "2026-09-30",
    time: "8:15",
    sourceUrl: "https://mediacenter.adp.com/2026-09-02-ADP-National-Employment-Report-Private-Sector-Employment-Increased-by-38%2C000-Jobs-in-August",
    title: "ADP private employment (Sep)",
    short: "ADP",
    kind: "rates",
    hits: "ES · NQ · GOLD",
    context: "Private-payroll signal ahead of Friday NFP. Compare job gains and pay with yields and the dollar.",
    history: "ADP is a separate payroll measure, not a one-for-one forecast of NFP. The 8:30 PCE release can overwrite its first reaction.",
  },
  {
    date: "2026-09-30",
    time: "8:30",
    sourceUrl: "https://www.bea.gov/news/schedule",
    title: "PCE + GDP (Q2 3rd)",
    short: "PCE + GDP",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "Fed's preferred inflation. Core PCE is the one that sticks to the dots.",
    history:
      "Core PCE ±0.1 is a real FOMC-path print. Hot core PCE dumps gold and NQ together. GDP revisions are noise unless they rewrite the recession call.",
  },
  {
    date: "2026-09-30",
    time: "10:30",
    sourceUrl: "https://www.eia.gov/petroleum/supply/weekly/schedule.php",
    title: "EIA weekly petroleum inventories",
    short: "EIA oil",
    kind: "oil",
    hits: "CL · BRENT · ES",
    context: "Crude, Cushing, gasoline and distillate stocks test whether an oil move has a physical demand or supply basis.",
    history: "Compare the full inventory mix with Brent and WTI; a crude draw alone need not confirm a broad energy shock.",
  },
  {
    date: "2026-10-01",
    time: "8:30",
    sourceUrl: "https://oui.doleta.gov/unemploy/claims.asp",
    title: "Weekly jobless claims",
    short: "Claims",
    kind: "rates",
    hits: "ES · NQ · GOLD",
    context: "Fresh labor read one day before payrolls. Focus on both initial and continuing claims.",
    history: "A one-week move is noisy. Watch whether Treasury yields and NQ respond before treating it as a labor trend.",
  },
  {
    date: "2026-10-01",
    time: "10:00",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/rob-report-calendar/",
    title: "ISM manufacturing (Sep)",
    short: "ISM mfg",
    kind: "inflation",
    hits: "ES · NQ · CL",
    context: "New orders, employment and prices paid can shift growth and inflation expectations.",
    history: "Read orders and prices together: weak demand with rising input costs has a different rate and equity path than broad expansion.",
  },
  {
    date: "2026-10-02",
    time: "8:30",
    sourceUrl: "https://www.bls.gov/schedule/news_release/empsit.htm",
    title: "NFP (Sep)",
    short: "NFP",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "First jobs print after the September hike. Sets October FOMC odds.",
    history:
      "First NFP after a hike: the market trades the labor-crack, not the headline. Soft NFP = NQ squeeze and gold bid. Hot NFP = DXY rip, gold dump, NQ heavy into October FOMC.",
  },
  {
    date: "2026-10-05",
    time: "10:00",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/rob-report-calendar/",
    title: "ISM services (Sep)",
    short: "ISM svc",
    kind: "inflation",
    hits: "ES · NQ · GOLD",
    context: "Services activity, employment and prices paid can move the rates path after NFP.",
    history: "Check whether services inflation confirms the payroll and PCE picture. Yields and dollar response matter more than the headline alone.",
  },
  {
    date: "2026-10-06",
    time: "8:30",
    sourceUrl: "https://www.bea.gov/news/schedule",
    title: "U.S. international trade (Aug)",
    short: "Trade",
    kind: "rates",
    hits: "ES · NQ · DXY",
    context: "Trade balance and import/export composition inform growth and tariff transmission.",
    history: "A large surprise can change GDP tracking or currency expectations. Confirm with yields, DXY and index breadth.",
  },
  {
    date: "2026-10-07",
    time: "14:00",
    sourceUrl: "https://www.federalreserve.gov/newsevents/2026-october.htm",
    title: "FOMC minutes (Sep 15–16)",
    short: "Minutes",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Three weeks after the hike. Dissent and the path into October 28.",
    history:
      "Minutes after a hike: the market trades whether they wanted more. Hawkish dissent dumps gold. Dovish discussion of labor cracks bids NQ into the next print.",
  },
  {
    date: "2026-10-14",
    time: "8:30",
    title: "CPI (Sep)",
    short: "CPI 08:30",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "BLS. Last CPI before October FOMC. Core is the tape.",
    history:
      "CPI into an FOMC is a 15-minute impulse then a grind to Wednesday. ±0.2 core is a trend day. Gold inverse DXY.",
  },
  {
    date: "2026-10-15",
    time: "8:30",
    title: "PPI + Retail sales (Sep)",
    short: "PPI / Retail",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "BLS PPI and Census retail the morning after CPI. Confirms or fades yesterday.",
    history:
      "PPI the day after CPI is a cleanup print. Soft retail into FOMC caps the hawk for an hour. Don't size it like CPI.",
  },
  {
    date: "2026-10-28",
    time: "14:00",
    title: "FOMC decision",
    short: "FOMC",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Oct 27–28 meeting. Statement 14:00, Warsh presser 14:30. No SEP this meeting.",
    history:
      "Non-SEP FOMC: the statement is the tape, not the dots. Presser 14:30–15:15 is the real session. Fade the 14:00 spike unless they change the funds range.",
  },
  {
    date: "2026-10-29",
    time: "8:30",
    title: "GDP (Q3 advance) + PCE (Sep)",
    short: "GDP + PCE",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "BEA. Morning after FOMC. Core PCE is the one that sticks.",
    history:
      "GDP the day after FOMC is usually faded. Core PCE ±0.1 still reprices gold if it fights last night's statement.",
  },
  {
    date: "2026-11-03",
    time: "10:00",
    title: "JOLTS (Sep)",
    short: "JOLTS",
    kind: "rates",
    hits: "NQ · ES",
    context: "BLS openings into Friday NFP. Quits is the wage tell.",
    history: "JOLTS ±300k openings move NQ into NFP week. Quits rate is what gold actually trades.",
  },
  {
    date: "2026-11-05",
    title: "Bank of England",
    short: "BoE",
    kind: "rates",
    hits: "ES · GOLD",
    context: "BoE. Bank Rate + November Monetary Policy Report.",
    history: "BoE + MPR is a cable/gold 20-minute event. ES only if they surprise vs the Fed path.",
  },
  {
    date: "2026-11-06",
    time: "8:30",
    title: "NFP (Oct)",
    short: "NFP",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "BLS Employment Situation. First jobs print after October FOMC.",
    history:
      "NFP after a hold: the market trades the labor crack. Soft = gold bid, NQ squeeze. Hot = DXY rip.",
  },
  {
    date: "2026-11-10",
    time: "8:30",
    title: "CPI (Oct)",
    short: "CPI 08:30",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "BLS. Core into December SEP.",
    history: "Core CPI ±0.1 is a 15-minute impulse. ±0.2 is a trend day. Gold inverse DXY.",
  },
  {
    date: "2026-11-11",
    title: "Veterans Day",
    short: "Veterans",
    kind: "rates",
    hits: "NQ · ES",
    context: "Bond market closed. Equities open, futures thinner than a Tuesday.",
    history: "Veterans Day: cash can still print. Don't size rates products like a CPI Tuesday.",
  },
  {
    date: "2026-11-13",
    time: "8:30",
    title: "PPI (Oct)",
    short: "PPI 08:30",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "BLS pipeline inflation after Tuesday CPI.",
    history:
      "Hot core PPI dumps duration if CPI already ran. Soft PPI is a gold bid that gives back if PCE doesn't confirm.",
  },
  {
    date: "2026-11-18",
    time: "14:00",
    title: "FOMC minutes (Oct 27–28)",
    short: "Minutes",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Three weeks after October decision.",
    history: "Minutes into Thanksgiving week: range. Only a dissent surprise owns the hour.",
  },
  {
    date: "2026-11-26",
    title: "Thanksgiving",
    short: "Thanksgiving",
    kind: "rates",
    hits: "NQ · ES",
    context: "Cash closed. Friday is a half-tape. Don't invent a trend.",
    history: "Holiday sessions compress NQ. Fake breaks in Asia get faded into London.",
  },
  {
    date: "2026-12-04",
    time: "8:30",
    title: "NFP (Nov)",
    short: "NFP",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "BLS. Last jobs print before December SEP.",
    history:
      "NFP into a dots meeting: the labor crack is the whole story. Soft NFP = they can't hike again.",
  },
  {
    date: "2026-12-09",
    time: "14:00",
    title: "FOMC + dots",
    short: "FOMC + dots",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Dec 8–9. Statement 14:00, presser 14:30, quarterly SEP.",
    history:
      "December SEP is the year-end path. Dots > the 25bp. Gold dumps a hawkish SEP, then chops. Real tape is the presser.",
  },
  {
    date: "2026-12-10",
    time: "8:30",
    title: "CPI (Nov)",
    short: "CPI 08:30",
    kind: "inflation",
    hits: "NQ · ES · GOLD",
    context: "BLS. Morning after December FOMC.",
    history: "CPI the day after FOMC is usually faded unless core fights the statement by 0.2.",
  },
  {
    date: "2026-12-15",
    time: "8:30",
    title: "PPI (Nov)",
    short: "PPI 08:30",
    kind: "inflation",
    hits: "NQ · GOLD",
    context: "BLS. Pipeline into year-end.",
    history: "Year-end PPI is a 10-minute twitch. Don't size it like CPI week.",
  },
  {
    date: "2026-12-17",
    title: "Bank of England",
    short: "BoE",
    kind: "rates",
    hits: "ES · GOLD",
    context: "BoE last 2026 decision.",
    history: "December BoE is cable/gold. ES only on a 25bp miss vs the Fed path.",
  },
  {
    date: "2026-12-25",
    title: "Christmas",
    short: "Christmas",
    kind: "rates",
    hits: "NQ · ES",
    context: "Cash closed. Globex is a trap.",
    history: "Holiday futures: thin NQ, fake breaks. Size off.",
  },
  {
    date: "2027-01-27",
    time: "14:00",
    title: "FOMC decision",
    short: "FOMC",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Jan 26–27. No SEP. Statement 14:00, presser 14:30.",
    history: "January FOMC is a cleanup after December dots. Fade 14:00 unless the range changes.",
  },
  {
    date: "2027-02-04",
    title: "Bank of England + MPR",
    short: "BoE",
    kind: "rates",
    hits: "ES · GOLD",
    context: "BoE. February report.",
    history: "BoE + MPR is cable/gold. ES only on a surprise vs the Fed path.",
  },
  {
    date: "2027-03-17",
    time: "14:00",
    title: "FOMC + dots",
    short: "FOMC + dots",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Mar 16–17. Quarterly SEP.",
    history: "March SEP resets the year. Dots > the 25bp. Presser is the session.",
  },
  {
    date: "2027-04-28",
    time: "14:00",
    title: "FOMC decision",
    short: "FOMC",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Apr 27–28. No SEP.",
    history:
      "Non-SEP FOMC: statement is the tape. Fade the 14:00 spike unless they move the range.",
  },
  {
    date: "2027-04-29",
    title: "Bank of England + MPR",
    short: "BoE",
    kind: "rates",
    hits: "ES · GOLD",
    context: "BoE. April report.",
    history: "BoE is a 20-minute cable/gold event.",
  },
  {
    date: "2027-06-09",
    time: "14:00",
    title: "FOMC + dots",
    short: "FOMC + dots",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Jun 8–9. Quarterly SEP.",
    history:
      "June SEP is the mid-year path. Gold dumps a hawkish set of dots, then chops in the presser.",
  },
  {
    date: "2027-07-28",
    time: "14:00",
    title: "FOMC decision",
    short: "FOMC",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Jul 27–28. No SEP.",
    history: "Summer FOMC: thin tape, real move is the presser. Don't average the first tick.",
  },
  {
    date: "2027-09-15",
    time: "14:00",
    title: "FOMC + dots",
    short: "FOMC + dots",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Sep 14–15. Quarterly SEP.",
    history: "September SEP is the second-half path. Dots > the 25bp.",
  },
  {
    date: "2027-10-27",
    time: "14:00",
    title: "FOMC decision",
    short: "FOMC",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Oct 26–27. No SEP.",
    history: "Non-SEP FOMC: statement then presser. Fade 14:00 unless the range changes.",
  },
  {
    date: "2027-12-08",
    time: "14:00",
    title: "FOMC + dots",
    short: "FOMC + dots",
    kind: "rates",
    hits: "NQ · ES · GOLD",
    context: "Fed. Dec 7–8. Quarterly SEP.",
    history: "December SEP is the year-end path. Presser is the session.",
  },
];

export function eventsOn(iso: string) {
  return EVENTS.filter((e) => e.date === iso).sort(
    (a, b) => eventStamp(a).getTime() - eventStamp(b).getTime(),
  );
}

export function upcomingFrom(iso: string, n = 8) {
  return EVENTS.filter((e) => e.date >= iso)
    .sort((a, b) => eventStamp(a).getTime() - eventStamp(b).getTime())
    .slice(0, n);
}

export function eventStamp(e: CalEvent) {
  const [h, m] = (e.time ?? "09:30").split(":").map(Number);
  const [y, mo, d] = e.date.split("-").map(Number);
  const wallClockUtc = Date.UTC(y, (mo ?? 1) - 1, d ?? 1, h ?? 9, m ?? 30, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
    year: "numeric",
  });
  const offsetLabel =
    formatter.formatToParts(new Date(wallClockUtc)).find((part) => part.type === "timeZoneName")
      ?.value ?? "GMT-5";
  const match = offsetLabel.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const sign = match?.[1] === "-" ? -1 : 1;
  const offsetMinutes = match ? sign * (Number(match[2]) * 60 + Number(match[3] ?? 0)) : -300;
  return new Date(wallClockUtc - offsetMinutes * 60_000);
}

export function nextEvent(from = new Date()) {
  return (
    [...EVENTS]
      .sort((a, b) => eventStamp(a).getTime() - eventStamp(b).getTime())
      .find((e) => eventStamp(e).getTime() > from.getTime()) ?? null
  );
}

export function remainingParts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function monthGrid(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startPad = first.getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: Array<{ day: number | null; iso: string | null }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ day: null, iso: null });
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, iso });
  }
  while (cells.length % 7) cells.push({ day: null, iso: null });
  return cells;
}

export function shiftMonth(year: number, monthIndex: number, delta: number) {
  const d = new Date(Date.UTC(year, monthIndex + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}
