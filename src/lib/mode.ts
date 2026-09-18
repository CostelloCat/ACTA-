import { create } from "zustand";

export type DeskMode = "learn" | "trade";

type ModeState = {
  mode: DeskMode;
  setMode: (mode: DeskMode) => void;
};

export const useMode = create<ModeState>((set) => ({
  mode: "trade",
  setMode: (mode) => set({ mode }),
}));
