import type { DeskId } from "@/lib/channels";
import type { WireKey } from "@/lib/desk";

export type Outlet = {
  desk: DeskId;
  label: string;
  href: string;
};

export const DESK_WIRE: Partial<Record<DeskId, WireKey>> = {
  us: "United States",
  live: "United States",
  cspan: "United States",
  house: "United States",
  fed: "United States",
  europe: "Europe",
  me: "Middle East",
  asia: "Asia",
  ru: "Russia",
  china: "China",
  latam: "LatAm",
  africa: "Africa",
};

export const OUTLETS: Outlet[] = [
  { desk: "us", label: "AP", href: "https://apnews.com" },
  { desk: "us", label: "Reuters", href: "https://www.reuters.com" },
  { desk: "us", label: "WSJ", href: "https://www.wsj.com" },
  { desk: "europe", label: "BBC", href: "https://www.bbc.co.uk/news" },
  { desk: "europe", label: "Le Monde", href: "https://www.lemonde.fr" },
  { desk: "europe", label: "Der Spiegel", href: "https://www.spiegel.de" },
  { desk: "europe", label: "El País", href: "https://elpais.com" },
  { desk: "europe", label: "ANSA", href: "https://www.ansa.it" },
  { desk: "me", label: "الجزيرة", href: "https://www.aljazeera.net" },
  { desk: "me", label: "العربية", href: "https://www.alarabiya.net" },
  { desk: "me", label: "Al Mayadeen", href: "https://www.almayadeen.net" },
  { desk: "me", label: "Press TV", href: "https://www.presstv.ir" },
  { desk: "asia", label: "NHK", href: "https://www3.nhk.or.jp/news/" },
  { desk: "asia", label: "CNA", href: "https://www.channelnewsasia.com" },
  { desk: "asia", label: "The Hindu", href: "https://www.thehindu.com" },
  { desk: "asia", label: "WION", href: "https://www.wionews.com" },
  { desk: "ru", label: "ТАСС", href: "https://tass.ru" },
  { desk: "ru", label: "РИА Новости", href: "https://ria.ru" },
  { desk: "ru", label: "Интерфакс", href: "https://www.interfax.ru" },
  { desk: "ru", label: "Коммерсантъ", href: "https://www.kommersant.ru" },
  { desk: "ru", label: "Ведомости", href: "https://www.vedomosti.ru" },
  { desk: "ru", label: "Известия", href: "https://iz.ru" },
  { desk: "china", label: "新华社", href: "https://www.news.cn" },
  { desk: "china", label: "人民日报", href: "https://www.people.com.cn" },
  { desk: "china", label: "央视网", href: "https://www.cctv.com" },
  { desk: "china", label: "环球时报", href: "https://www.huanqiu.com" },
  { desk: "china", label: "CGTN", href: "https://www.cgtn.com" },
  { desk: "latam", label: "TeleSUR", href: "https://www.telesurtv.net" },
  { desk: "latam", label: "Globo", href: "https://g1.globo.com" },
  { desk: "latam", label: "Folha", href: "https://www.folha.uol.com.br" },
  { desk: "latam", label: "Clarín", href: "https://www.clarin.com" },
  { desk: "latam", label: "Reforma", href: "https://www.reforma.com" },
  { desk: "africa", label: "Africanews", href: "https://www.africanews.com" },
  { desk: "africa", label: "Daily Maverick", href: "https://www.dailymaverick.co.za" },
  { desk: "africa", label: "Premium Times", href: "https://www.premiumtimesng.com" },
  { desk: "africa", label: "The Nation", href: "https://thenationonlineng.net" },
  { desk: "africa", label: "Al Jazeera Africa", href: "https://www.aljazeera.com/africa/" },
];

export function outletsOn(desk: DeskId) {
  return OUTLETS.filter((o) => o.desk === desk);
}
