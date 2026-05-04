"use client";

import { Button } from "@/components/ui/button";
import { profileConfig } from "@/lib/profile-config";
import { motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

type MusicPlayerProps = {
  volume: number;
};

export type MusicPlayerHandle = {
  play: () => void;
};

export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(function MusicPlayer(
  { volume },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayAttemptedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = volume <= 0;

    void audio.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    );
  }, [volume]);

  useImperativeHandle(ref, () => ({ play: playAudio }), [playAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || autoPlayAttemptedRef.current) return;

    const tryAutoPlay = () => {
      if (autoPlayAttemptedRef.current) return;
      autoPlayAttemptedRef.current = true;
      audio.muted = false;

      void audio.play().then(
        () => setIsPlaying(true),
        () => {
          // Browser autoplay policy fallback: start muted if needed.
          audio.muted = true;
          void audio.play().then(
            () => setIsPlaying(true),
            () => setIsPlaying(false),
          );
        },
      );
    };

    audio.preload = "auto";
    audio.load();
    tryAutoPlay();

    const handleCanPlay = () => tryAutoPlay();
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (audio.muted && volume > 0 && isPlaying) {
      audio.muted = false;
      void audio.play().catch(() => {
        audio.muted = true;
      });
    }
  }, [isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      void audio.play();
      return;
    }

    audio.pause();
  }, [isPlaying]);

  const formatTime = (secondsRaw: number) => {
    const seconds = Math.floor(secondsRaw);
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const elapsed = useMemo(() => formatTime(currentTime), [currentTime]);
  const total = useMemo(() => formatTime(duration), [duration]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration || 0);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur-md">
      <audio
        ref={audioRef}
        src={profileConfig.track.src}
        preload="auto"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
            <Volume2 className="h-3.5 w-3.5 text-zinc-200" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-zinc-100">{profileConfig.track.artist}</p>
            <p className="truncate text-[10px] text-zinc-400">{profileConfig.track.title}</p>
          </div>
        </div>
      </div>

      <div className="mb-2 h-px rounded-full bg-white/10" />

      <div className="flex items-center gap-2">
        <span className="w-7 text-[10px] text-zinc-400">{elapsed}</span>
        <div className="h-1 flex-1 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-white/80"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          />
        </div>
        <span className="w-7 text-right text-[10px] text-zinc-400">{total}</span>
      </div>

      <div className="mt-1.5 flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => seekBy(-10)}
          className="h-6 w-6 text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="h-6 w-6 text-zinc-200 hover:bg-white/10 hover:text-white"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => seekBy(10)}
          className="h-6 w-6 text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
});
