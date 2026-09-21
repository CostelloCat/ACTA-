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
        placeholder="Search markets and catalysts…"
        aria-label="Search ACTA"
        className="border-line bg-surface/60 text-fg min-h-9 min-w-0 flex-1 rounded-full border px-4 text-center text-sm outline-none placeholder:text-muted"
      />
      <button type="submit" className="pill pill-solid">
        Go
      </button>
    </form>
  );
}
