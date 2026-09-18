import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function SearchBar() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
    <form
      className="flex min-w-0 flex-1 items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        void nav({ to: "/search", search: { q: query } });
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Desks, prints, Grok…"
        className="text-fg min-h-8 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted"
      />
      <button type="submit" className="pill pill-solid">
        Go
      </button>
    </form>
  );
}
