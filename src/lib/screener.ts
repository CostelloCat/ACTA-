export type ScreenRow = {
  when: string;
  who: string;
  event: string;
  hits: string;
  live: string;
  href: string;
  tag: "live" | "prints" | "speeches" | "addresses" | "hearings";
};

export const SCREEN: ScreenRow[] = [
  {
    when: "On the wire",
    who: "Donald J. Trump",
    event: "Remarks / press — watch the wire",
    hits: "OIL · GOLD · NQ",
    live: "C-SPAN live",
    href: "https://www.c-span.org/live/",
    tag: "live",
  },
  {
    when: "On the wire",
    who: "Donald J. Trump",
    event: "Truth / X firehose",
    hits: "OIL · GOLD",
    live: "Truth",
    href: "https://x.com",
    tag: "live",
  },
  {
    when: "On the wire",
    who: "Kevin Warsh",
    event: "When Warsh speaks",
    hits: "NQ · GOLD · DXY",
    live: "C-SPAN",
    href: "https://www.c-span.org/search/?searchtype=Videos&query=kevin+warsh",
    tag: "speeches",
  },
  {
    when: "On the wire",
    who: "White House",
    event: "State of the Union (next)",
    hits: "NQ · ES · OIL",
    live: "C-SPAN SOTU",
    href: "https://www.c-span.org/congress/",
    tag: "addresses",
  },
  {
    when: "On the wire",
    who: "Congress",
    event: "House / Senate floor",
    hits: "NQ · OIL",
    live: "C-SPAN 1",
    href: "https://www.c-span.org/live/?channel=1",
    tag: "hearings",
  },
  {
    when: "On the wire",
    who: "Federal Reserve",
    event: "Fed speakers — live board",
    hits: "NQ · GOLD · VIX",
    live: "Fed YouTube",
    href: "https://www.youtube.com/@federalreserve",
    tag: "speeches",
  },
];
