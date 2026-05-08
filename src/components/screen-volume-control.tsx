"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";

type ScreenVolumeControlProps = {
  volume: number;
  onChange: (value: number) => void;
};

export function ScreenVolumeControl({ volume, onChange }: ScreenVolumeControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const volumeValue = Math.round(volume * 100);

  return (
    <div className="fixed left-3 top-3 z-20 sm:left-5 sm:top-5">
      <div className="group/volume relative flex items-start">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-white/25 hover:text-white md:pointer-events-none"
          aria-label="Abrir controle de volume"
          aria-expanded={isOpen}
        >
          <Volume2 className="h-4 w-4" />
        </button>

        <div
          className={`absolute left-0 top-full mt-2 rounded-xl border border-white/10 bg-black/70 px-3 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-200 md:left-full md:top-1/2 md:ml-2 md:mt-0 md:-translate-y-1/2 md:group-hover/volume:pointer-events-auto md:group-hover/volume:translate-x-0 md:group-hover/volume:scale-100 md:group-hover/volume:opacity-100 md:group-focus-within/volume:pointer-events-auto md:group-focus-within/volume:translate-x-0 md:group-focus-within/volume:scale-100 md:group-focus-within/volume:opacity-100 ${
            isOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0 md:translate-x-1 md:translate-y-0"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={volumeValue}
              onChange={(event) => onChange(Number(event.target.value) / 100)}
              className="h-1.5 w-28 cursor-pointer accent-white"
              aria-label="Controle de volume"
            />
            <span className="min-w-7 text-right text-[10px] font-medium text-zinc-400">
              {volumeValue}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
