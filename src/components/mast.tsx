import { Link } from "@tanstack/react-router";

export function Mast() {
  return (
    <Link to="/" className="font-display shrink-0 text-center no-underline" aria-label="ACTA home">
      <span className="foil block text-2xl font-semibold tracking-[0.32em]">ACTA</span>
      <span className="text-gold mt-1 block text-[8px] tracking-[0.32em] uppercase">
        For the people by the people
      </span>
    </Link>
  );
}
