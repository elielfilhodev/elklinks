"use client";

import { AnimatedBackground } from "@/components/animated-background";
import { ProfileCard } from "@/components/profile-card";
import { ScreenVolumeControl } from "@/components/screen-volume-control";
import { useState } from "react";

export default function Home() {
  const [volume, setVolume] = useState(0.7);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 sm:px-6">
      <AnimatedBackground />
      <ScreenVolumeControl volume={volume} onChange={setVolume} />
      <main className="relative z-10 flex w-full justify-center">
        <ProfileCard volume={volume} />
      </main>
    </div>
  );
}
