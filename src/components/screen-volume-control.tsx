"use client";

import { Volume2 } from "lucide-react";

type ScreenVolumeControlProps = {
  volume: number;
  onChange: (value: number) => void;
};

export function ScreenVolumeControl({ volume, onChange }: ScreenVolumeControlProps) {
  return (
    <div className="fixed left-3 top-3 z-20 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md sm:left-5 sm:top-5">
      <div className="flex items-center gap-2">
        <Volume2 className="h-3.5 w-3.5 text-zinc-200" />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          className="h-1.5 w-24 cursor-pointer accent-white sm:w-28"
          aria-label="Controle de volume"
        />
      </div>
    </div>
  );
}
