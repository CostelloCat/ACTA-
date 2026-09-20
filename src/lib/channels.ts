import { createServerFn } from "@tanstack/react-start";

export type Lane = "main" | "current";
export type DeskId =
  | "live"
  | "us"
  | "europe"
  | "me"
  | "asia"
  | "ru"
  | "china"
  | "latam"
  | "africa"
  | "cspan"
  | "house"
  | "fed"
  | "min"
  | "talk"
  | "indie"
  | "markets"
  | "foreign";

export type Channel = {
  query: string;
  label: string;
  desk: DeskId;
  lane: Lane;
  channelId?: string;
};

export type MosaicRow = Channel & {
  videoId: string | null;
  thumb: string | null;
  title: string;
  onAir: boolean;
  age: string;
  provenance?: "official" | "publisher" | "discovered";
};

export const MAIN_TABS: { id: DeskId; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "us", label: "US" },
  { id: "europe", label: "Europe" },
  { id: "me", label: "Middle East" },
  { id: "asia", label: "Asia" },
  { id: "ru", label: "Russia" },
  { id: "china", label: "China" },
  { id: "latam", label: "LatAm" },
  { id: "africa", label: "Africa" },
  { id: "cspan", label: "C-SPAN" },
  { id: "house", label: "House" },
  { id: "fed", label: "Fed" },
  { id: "min", label: "Min video" },
];

export const ALT_TABS: { id: DeskId; label: string }[] = [
  { id: "talk", label: "Talk" },
  { id: "indie", label: "Independent" },
  { id: "markets", label: "Markets" },
  { id: "foreign", label: "Foreign" },
  { id: "min", label: "Min video" },
];

export const CHANNELS: Channel[] = [
  { query: "Fox News live", label: "Fox", desk: "us", lane: "main", channelId: "UCXIJgqnII2ZOINSWNOGFThA" },
  { query: "CNN live", label: "CNN", desk: "us", lane: "main", channelId: "UCupvZG-5ko_eiXAupbDfxWw" },
  { query: "ABC News live", label: "ABC News", desk: "us", lane: "main", channelId: "UCBi2mrWuNuyYy4gbM6fU18Q" },
  { query: "Bloomberg Television live", label: "Bloomberg", desk: "us", lane: "main", channelId: "UCIALMKvObZNtJ6AmdCLP7Lw" },
  { query: "NBC News live", label: "NBC", desk: "us", lane: "main", channelId: "UCeY0bbntWzzVIaj2z3QigXg" },
  { query: "MSNBC live", label: "MSNBC", desk: "us", lane: "main", channelId: "UCaXkIU1QctMy5gCvkHMAW_Q" },
  { query: "CNBC live", label: "CNBC", desk: "us", lane: "main", channelId: "UCrp_UI8XtuYfpiqluWLD7Lw" },
  { query: "Donald Trump live", label: "DJT LIVE", desk: "live", lane: "main" },
  { query: "Sam Altman live", label: "SAM ALTMAN LIVE", desk: "live", lane: "main" },
  { query: "Elon Musk live", label: "ELON LIVE", desk: "live", lane: "main" },
  { query: "Jensen Huang live", label: "JENSEN LIVE", desk: "live", lane: "main" },
  { query: "Tim Cook live", label: "TIM COOK LIVE", desk: "live", lane: "main" },
  { query: "Satya Nadella live", label: "SATYA LIVE", desk: "live", lane: "main" },
  { query: "Sundar Pichai live", label: "SUNDAR LIVE", desk: "live", lane: "main" },
  { query: "Andy Jassy live", label: "ANDY JASSY LIVE", desk: "live", lane: "main" },
  { query: "Mark Zuckerberg live", label: "ZUCK LIVE", desk: "live", lane: "main" },
  { query: "White House live", label: "White House", desk: "live", lane: "main", channelId: "UCYxRlFDqcWM4y7FfpiAN3KQ" },
  { query: "Sky News live", label: "Sky News", desk: "europe", lane: "main", channelId: "UCoMdktPbSTixAyNGwb-UYkQ" },
  { query: "DW News live", label: "DW", desk: "europe", lane: "main", channelId: "UCknLrEdhRCp1aegoMqRaCZg" },
  { query: "France 24 English live", label: "France 24", desk: "europe", lane: "main", channelId: "UCQfwfsi5VrQ8yKZ-UWmAEFg" },
  { query: "Euronews live", label: "Euronews", desk: "europe", lane: "main", channelId: "UC1mX9v0jzW1BZW5fe8o9PAQ" },
  { query: "BBC News live", label: "BBC", desk: "europe", lane: "main", channelId: "UC16niRr50-CSB0aR7SfNPsw" },
  { query: "Al Jazeera English live", label: "Al Jazeera", desk: "me", lane: "main", channelId: "UCNye-wNBqNL5YBbRcy7kL4Q" },
  { query: "Africanews live", label: "Africanews", desk: "me", lane: "main", channelId: "UC_Kex3bB7nlcQaoF1QVdzTA" },
  { query: "WION live", label: "WION", desk: "asia", lane: "main", channelId: "UC_gUM8rL-Lrg6We7vI4B7fA" },
  { query: "CNA live", label: "CNA", desk: "asia", lane: "main", channelId: "UC83jt4dlz1Gjl58fzQrrKZg" },
  { query: "NHK World live", label: "NHK", desk: "asia", lane: "main", channelId: "UCSPEjw8F2nQDtmUKPFNF7_A" },
  { query: "RT Russian live", label: "RT RU", desk: "ru", lane: "main", channelId: "UCpwvZwUam-URkxB7g4USKpg" },
  { query: "RT news live", label: "RT", desk: "ru", lane: "main", channelId: "UCcpWZrbYg0hR3lb4ai6MClw" },
  { query: "Россия 24 live", label: "Россия 24", desk: "ru", lane: "main" },
  { query: "CGTN live", label: "CGTN", desk: "china", lane: "main", channelId: "UCgrNz-aDmcr2uuto8_DL2jg" },
  { query: "CGTN Russian live", label: "CGTN RU", desk: "china", lane: "main" },
  { query: "TeleSUR English live", label: "TeleSUR", desk: "latam", lane: "main" },
  { query: "GloboNews live", label: "GloboNews", desk: "latam", lane: "main" },
  { query: "Africanews live", label: "Africanews", desk: "africa", lane: "main", channelId: "UC_Kex3bB7nlcQaoF1QVdzTA" },
  { query: "Al Jazeera Arabic live", label: "الجزيرة", desk: "me", lane: "main" },
  { query: "C-SPAN live", label: "C-SPAN 1", desk: "cspan", lane: "main", channelId: "UCb-vZFNHlKB6JlIy76SxHlQ" },
  { query: "C-SPAN 2 live", label: "C-SPAN 2", desk: "cspan", lane: "main", channelId: "UCKuN3Keq9ufvkCCopLUf60A" },
  { query: "US House floor live", label: "House floor", desk: "house", lane: "main", channelId: "UCu7xGFKN1iMbi6jH51RoR3g" },
  { query: "Federal Reserve live", label: "Fed", desk: "fed", lane: "main", channelId: "UCAzhpt9DmG6PnHXjmJTvRGQ" },

  { query: "Tim Dillon Show", label: "Tim Dillon", desk: "talk", lane: "current" },
  { query: "Candace Owens", label: "Candace Owens", desk: "talk", lane: "current" },
  { query: "Joe Rogan Experience", label: "Joe Rogan", desk: "talk", lane: "current", channelId: "UCzQUP1qoWDoEa8EFkR2C2HQ" },
  { query: "Tucker Carlson", label: "Tucker Carlson", desk: "talk", lane: "current" },
  { query: "Patrick Bet-David Valuetainment", label: "PBD", desk: "talk", lane: "current", channelId: "UCvdwhh99HLbX4f7MWmHY_2g" },
  { query: "Shawn Ryan Show", label: "Shawn Ryan", desk: "talk", lane: "current" },
  { query: "Lex Fridman", label: "Lex Fridman", desk: "talk", lane: "current", channelId: "UCSHZKyawb77ixDdsGog4iWA" },
  { query: "Piers Morgan Uncensored", label: "Piers Morgan", desk: "talk", lane: "current" },
  { query: "Triggernometry", label: "Triggernometry", desk: "talk", lane: "current" },
  { query: "Russell Brand", label: "Russell Brand", desk: "talk", lane: "current" },

  { query: "Breaking Points Krystal Saagar", label: "Breaking Points", desk: "indie", lane: "current" },
  { query: "The Hill Rising", label: "The Hill", desk: "indie", lane: "current", channelId: "UCUTOfEoWFFOnK7nQ4g562ng" },
  { query: "Glenn Greenwald System Update", label: "Glenn Greenwald", desk: "indie", lane: "current" },
  { query: "Democracy Now", label: "Democracy Now", desk: "indie", lane: "current", channelId: "UCzuqhhbUghCSzPK5l3EKeIQ" },
  { query: "ReasonTV", label: "Reason", desk: "indie", lane: "current", channelId: "UCwxn8oP4C5k3AbpMH1EO2eg" },
  { query: "NewsNation live", label: "NewsNation", desk: "indie", lane: "current" },
  { query: "Redacted independent news", label: "Redacted", desk: "indie", lane: "current" },
  { query: "Judge Napolitano", label: "Napolitano", desk: "indie", lane: "current" },
  { query: "The Intercept", label: "The Intercept", desk: "indie", lane: "current" },
  { query: "Drop Site News", label: "Drop Site", desk: "indie", lane: "current" },

  { query: "Kitco News", label: "Kitco", desk: "markets", lane: "current" },
  { query: "Real Vision", label: "Real Vision", desk: "markets", lane: "current" },
  { query: "George Gammon", label: "George Gammon", desk: "markets", lane: "current" },
  { query: "Peter Schiff", label: "Peter Schiff", desk: "markets", lane: "current" },
  { query: "What Bitcoin Did", label: "What Bitcoin Did", desk: "markets", lane: "current" },
  { query: "Coin Bureau", label: "Coin Bureau", desk: "markets", lane: "current" },
  { query: "Max Keiser", label: "Max Keiser", desk: "markets", lane: "current" },
  { query: "Mario Nawfal", label: "Mario Nawfal", desk: "markets", lane: "current" },

  { query: "TRT World live", label: "TRT World", desk: "foreign", lane: "current", channelId: "UC7fWeaHhqDegz8d_ZTjAPjw" },
  { query: "GB News live", label: "GB News", desk: "foreign", lane: "current" },
  { query: "Al Jazeera English live", label: "Al Jazeera", desk: "foreign", lane: "current", channelId: "UCNye-wNBqNL5YBbRcy7kL4Q" },
  { query: "WION live", label: "WION", desk: "foreign", lane: "current", channelId: "UC_gUM8rL-Lrg6We7vI4B7fA" },
  { query: "CNA live", label: "CNA", desk: "foreign", lane: "current", channelId: "UC83jt4dlz1Gjl58fzQrrKZg" },
  { query: "DW News live", label: "DW", desk: "foreign", lane: "current", channelId: "UCknLrEdhRCp1aegoMqRaCZg" },
];

export function channelsOn(desk: DeskId, lane: Lane) {
  const pool = CHANNELS.filter((c) => c.lane === lane);
  if (desk === "live") return pool.filter((c) => c.desk === "us" || c.desk === "live");
  if (desk === "min") return pool;
  if (lane === "current" && desk === "talk") return pool.filter((c) => c.desk === "talk");
  return pool.filter((c) => c.desk === desk);
}

export function embedSrc(row: MosaicRow) {
  if (!row.videoId) return null;
  return `https://www.youtube.com/embed/${row.videoId}?rel=0&modestbranding=1`;
}

export function withinDay(age: string) {
  const t = age.toLowerCase();
  if (!t) return false;
  if (/watching|live now|just now|second|minute/.test(t)) return true;
  if (/streamed/.test(t) && /hour|minute|second/.test(t)) return true;
  const hours = t.match(/(\d+)\s*hour/);
  if (hours) return Number(hours[1]) <= 24;
  if (/\b1 day ago\b|\ba day ago\b/.test(t)) return true;
  return false;
}

const mosaicCache: { at: number; rows: MosaicRow[] } = { at: 0, rows: [] };

type Clip = { videoId: string; title: string; age: string; live?: boolean };

function textContent(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const object = value as Record<string, unknown>;
  if (typeof object.simpleText === "string") return object.simpleText;
  if (!Array.isArray(object.runs)) return "";
  return object.runs
    .map((run) => (run && typeof run === "object" && typeof (run as Record<string, unknown>).text === "string" ? (run as Record<string, unknown>).text : ""))
    .join("");
}

function collectLockups(node: unknown, out: Clip[], seen: Set<string>) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectLockups(item, out, seen);
    return;
  }
  const o = node as Record<string, unknown>;
  const renderer = o.videoRenderer as Record<string, unknown> | undefined;
  if (renderer && typeof renderer.videoId === "string" && renderer.videoId.length === 11) {
    const id = renderer.videoId;
    if (!seen.has(id)) {
      seen.add(id);
      const title = textContent(renderer.title);
      const age = [textContent(renderer.viewCountText), textContent(renderer.publishedTimeText)].filter(Boolean).join(" · ");
      const badges = JSON.stringify(renderer.badges ?? "");
      const live = /watching|live now/i.test(age) || /LIVE|BADGE_STYLE_TYPE_LIVE_NOW/i.test(badges);
      out.push({ videoId: id, title, age: live && !age ? "live now" : age, live });
    }
  }
  const lockup = o.lockupViewModel as Record<string, unknown> | undefined;
  if (lockup && typeof lockup.contentId === "string" && lockup.contentId.length === 11) {
    const id = lockup.contentId;
    if (!seen.has(id)) {
      seen.add(id);
      const meta = (lockup.metadata as Record<string, unknown> | undefined)?.lockupMetadataViewModel as
        | Record<string, unknown>
        | undefined;
      const title = ((meta?.title as Record<string, unknown> | undefined)?.content as string | undefined) ?? "";
      const age = clipAge(meta);
      out.push({ videoId: id, title, age, live: /watching|live now/i.test(age) });
    }
  }
  for (const v of Object.values(o)) collectLockups(v, out, seen);
}

function initialDataFromHtml(html: string) {
  const markers = ["var ytInitialData =", 'window["ytInitialData"] ='];
  for (const marker of markers) {
    const markerIndex = html.indexOf(marker);
    if (markerIndex < 0) continue;
    const start = html.indexOf("{", markerIndex + marker.length);
    if (start < 0) continue;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < html.length; index += 1) {
      const char = html[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') quoted = false;
        continue;
      }
      if (char === '"') quoted = true;
      else if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(start, index + 1)) as unknown;
          } catch {
            break;
          }
        }
      }
    }
  }
  return null;
}

async function discoveredLive(query: string): Promise<Clip | null> {
  try {
    const params = new URLSearchParams({ search_query: query, sp: "EgJAAQ%3D%3D" });
    const res = await fetch(`https://www.youtube.com/results?${params.toString()}`, {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const initialData = initialDataFromHtml(await res.text());
    if (!initialData) return null;
    const clips: Clip[] = [];
    collectLockups(initialData, clips, new Set());
    return clips.find((clip) => clip.live) ?? null;
  } catch {
    return null;
  }
}

function clipAge(meta: Record<string, unknown> | undefined) {
  const rows =
    ((meta?.metadata as Record<string, unknown> | undefined)?.contentMetadataViewModel as Record<string, unknown> | undefined)
      ?.metadataRows;
  const texts: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) {
      for (const x of n) walk(x);
      return;
    }
    const o = n as Record<string, unknown>;
    if (o.text && typeof o.text === "object") {
      const content = (o.text as Record<string, unknown>).content;
      if (typeof content === "string") texts.push(content);
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(rows);
  return texts.find((t) => /ago|watching|streamed|live/i.test(t)) ?? texts[1] ?? "";
}

async function recentFromChannel(channelId: string): Promise<Clip[]> {
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        context: { client: { clientName: "WEB", clientVersion: "2.20260916.01.00", hl: "en", gl: "US" } },
        browseId: channelId,
        params: "EgZ2aWRlb3PyBgQKAjoA",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const clips: Clip[] = [];
    collectLockups(json, clips, new Set());
    return clips.filter((c) => withinDay(c.age));
  } catch {
    return [];
  }
}

async function probeLive(channelId: string): Promise<{ videoId: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (html.includes("UNPLAYABLE") && !html.includes("liveStreamabilityRenderer")) return null;
    const videoId = html.match(/"liveStreamabilityRenderer":\{"videoId":"([\w-]{11})"/)?.[1];
    if (!videoId) return null;
    return { videoId };
  } catch {
    return null;
  }
}

export const getMosaic = createServerFn({ method: "GET" }).handler(async (): Promise<MosaicRow[]> => {
  if (Date.now() - mosaicCache.at < 60_000 && mosaicCache.rows.length) return mosaicCache.rows;
  const rows = await Promise.all(
    CHANNELS.map(async (c) => {
      if (!c.channelId) {
        const live = c.desk === "live" ? await discoveredLive(c.query) : null;
        return {
          ...c,
          videoId: live?.videoId ?? null,
          title: live?.title ?? c.label,
          thumb: live ? `https://i.ytimg.com/vi/${live.videoId}/hqdefault.jpg` : null,
          onAir: Boolean(live),
          age: live?.age ?? "",
          provenance: live ? ("discovered" as const) : undefined,
        };
      }
      const wantLive = c.lane === "main";
      const [live, clips] = await Promise.all([
        wantLive ? probeLive(c.channelId) : Promise.resolve(null),
        recentFromChannel(c.channelId),
      ]);
      const highlight = clips[0] ?? null;
      const videoId = live?.videoId ?? highlight?.videoId ?? null;
      return {
        ...c,
        videoId,
        title: live?.videoId ? `${c.label} live` : (highlight?.title ?? c.label),
        thumb: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
        onAir: Boolean(live?.videoId),
        age: live?.videoId ? "live" : (highlight?.age ?? ""),
        provenance: /white house|federal reserve|house floor|c-span/i.test(`${c.label} ${c.query}`) ? ("official" as const) : ("publisher" as const),
      };
    }),
  );
  mosaicCache.at = Date.now();
  mosaicCache.rows = rows;
  return rows;
});
