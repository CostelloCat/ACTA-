import { createServerFn } from "@tanstack/react-start";
import type { NewsItem } from "./desk";

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export const getFilings = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsItem[]> => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(
        "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&count=30&output=atom",
        {
          signal: ctrl.signal,
          headers: { "user-agent": "ACTA desk (educational)" },
        },
      );
      clearTimeout(t);
      if (!res.ok) throw new Error(String(res.status));
      const xml = await res.text();
      const items: NewsItem[] = [];
      const re = /<entry>([\s\S]*?)<\/entry>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(xml))) {
        const block = m[1] ?? "";
        const title = decode(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
        const link =
          block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ??
          decode(block.match(/<id>([\s\S]*?)<\/id>/i)?.[1] ?? "");
        const published = decode(block.match(/<updated>([\s\S]*?)<\/updated>/i)?.[1] ?? "");
        if (title) items.push({ title, link, source: "EDGAR", published, kind: "MAG7" });
        if (items.length >= 20) break;
      }
      return items;
    } catch {
      return [
        {
          title: "EDGAR wire is delayed — open the official current filings page",
          link: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent",
          source: "EDGAR",
          published: "",
          kind: "MAG7",
        },
      ];
    }
  },
);
