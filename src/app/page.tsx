"use client";

import { AnimatedBackground } from "@/components/animated-background";
import { ProfileCard, type ProfileCardHandle } from "@/components/profile-card";
import { ScreenVolumeControl } from "@/components/screen-volume-control";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

export default function Home() {
  const profileCardRef = useRef<ProfileCardHandle>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const handleEnter = () => {
    profileCardRef.current?.playMusic();
    setHasEntered(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 sm:px-6">
      <AnimatedBackground />
      <motion.div
        initial={false}
        animate={
          hasEntered
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.98, filter: "blur(10px)" }
        }
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 flex w-full justify-center ${
          hasEntered ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!hasEntered}
      >
        <ScreenVolumeControl volume={volume} onChange={setVolume} />
        <main className="flex w-full justify-center">
          <ProfileCard ref={profileCardRef} volume={volume} />
        </main>
      </motion.div>
      <AnimatePresence mode="wait">
        {!hasEntered && (
          <motion.main
            key="enter"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex items-center justify-center px-4 text-center"
          >
            <motion.button
              type="button"
              onClick={handleEnter}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group rounded-3xl border border-white/15 bg-white/8 px-8 py-6 shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors hover:border-white/35 hover:bg-white/12"
              aria-label="Clique para entrar no site"
            >
              <span className="block text-[10px] font-medium uppercase tracking-[0.45em] text-zinc-500">
                elklinks
              </span>
              <span className="mt-3 block text-lg font-semibold tracking-tight text-white">
                Clique para entrar
              </span>
              <span className="mt-2 block text-xs text-zinc-400 transition-colors group-hover:text-zinc-200">
                Abrir hub principal
              </span>
            </motion.button>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
