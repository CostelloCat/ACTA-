import { Link } from "@tanstack/react-router";

export function Mast() {
  return (
    <Link to="/" className="font-display shrink-0 no-underline">
      <span className="foil block text-[17px] font-semibold tracking-[0.22em]">ACTA</span>
      <span className="text-gold mt-0.5 block text-[8px] tracking-[0.28em] uppercase">
        For the people by the people
      </span>
    </Link>
  );
}
