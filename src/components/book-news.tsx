import { useEffect, useState } from "react";
import { getNameNews, leadAge, type NewsItem } from "@/lib/desk";

export function BookNews({ query }: { query: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    let alive = true;
    void getNameNews({ data: { q: query } }).then((rows) => {
      if (alive) setItems(rows);
    });
    return () => {
      alive = false;
    };
  }, [query]);

  if (!items.length) return null;

  return (
    <div className="mt-8">
      <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Latest on this book</p>
      <ul className="mt-3 space-y-3">
        {items.map((it) => (
          <li key={it.title} className="border-line border-b pb-3 last:border-0">
            <a href={it.link} target="_blank" rel="noopener noreferrer" className="block text-sm no-underline">
              {it.title}
            </a>
            <p className="text-muted mt-1 text-[11px] tracking-wide uppercase">
              {it.source}
              {leadAge(it.published) ? ` · ${leadAge(it.published)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
