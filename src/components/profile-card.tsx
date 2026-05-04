"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MusicPlayer, type MusicPlayerHandle } from "@/components/music-player";
import {
  profileConfig,
  setupSpecs,
  socialLinks,
  type SetupSpec,
  type SocialLink,
} from "@/lib/profile-config";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2, MapPin, PlayCircle } from "lucide-react";
import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type ProfileTab = "links" | "setup" | "youtube";

type LatestYouTubeVideo = {
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
};

type YouTubeState =
  | { status: "idle" | "loading" }
  | { status: "success"; video: LatestYouTubeVideo }
  | { status: "error"; message: string };

function SocialButton({ item }: { item: SocialLink }) {
  const Icon = item.icon;

  return (
    <motion.a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-white text-black transition-colors hover:border-white hover:bg-zinc-100"
      aria-label={item.label}
    >
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
    </motion.a>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
        active ? "text-black" : "text-zinc-300 hover:text-white"
      }`}
    >
      {active && (
        <motion.span
          layoutId="profile-active-tab"
          className="absolute inset-0 rounded-xl bg-white"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function SetupSpecItem({ item }: { item: SetupSpec }) {
  const Icon = item.icon;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          {item.label}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-zinc-100">{item.value}</p>
      </div>
    </div>
  );
}

function formatPublishedAt(value: string) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function YouTubeLatestCard({ state }: { state: YouTubeState }) {
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Buscando último vídeo...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left">
        <p className="text-xs font-semibold text-white">Último vídeo indisponível</p>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{state.message}</p>
        <a
          href={profileConfig.youtube.channelUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-200 hover:text-white"
        >
          Abrir canal
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  if (state.status !== "success") return null;

  const { video } = state;
  const publishedAt = formatPublishedAt(video.publishedAt);

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-left transition-colors hover:border-white/25"
    >
      <div
        className="relative aspect-video bg-cover bg-center"
        style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="h-10 w-10 text-white/90 drop-shadow-[0_0_16px_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">
          {video.title}
        </p>
        <p className="mt-1 text-[10px] text-zinc-500">
          {video.channelTitle}
          {publishedAt ? ` • ${publishedAt}` : ""}
        </p>
      </div>
    </motion.a>
  );
}

type ProfileCardProps = {
  volume: number;
};

export type ProfileCardHandle = {
  playMusic: () => void;
};

export const ProfileCard = forwardRef<ProfileCardHandle, ProfileCardProps>(function ProfileCard(
  { volume },
  ref,
) {
  const musicPlayerRef = useRef<MusicPlayerHandle>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("links");
  const [youtubeState, setYoutubeState] = useState<YouTubeState>({ status: "idle" });

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);

    if (tab === "youtube" && youtubeState.status === "idle") {
      setYoutubeState({ status: "loading" });
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      playMusic: () => musicPlayerRef.current?.play(),
    }),
    [],
  );

  useEffect(() => {
    if (activeTab !== "youtube" || youtubeState.status !== "loading") return;

    const controller = new AbortController();

    fetch("/api/youtube/latest", { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as {
          video?: LatestYouTubeVideo;
          error?: string;
        };

        if (!response.ok || !data.video) {
          throw new Error(data.error ?? "Não foi possível carregar o último vídeo");
        }

        setYoutubeState({ status: "success", video: data.video });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setYoutubeState({
          status: "error",
          message: error instanceof Error ? error.message : "Falha ao carregar o YouTube",
        });
      });

    return () => controller.abort();
  }, [activeTab, youtubeState.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative w-full max-w-sm"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div whileHover={{ scale: 1.04 }}>
          <Avatar className="h-30 w-30 border border-white/20 shadow-[0_0_24px_rgba(255,255,255,0.1)]">
            <AvatarImage src={profileConfig.avatarUrl} alt={profileConfig.name} />
            <AvatarFallback className="bg-zinc-900 text-sm text-zinc-200">
              {profileConfig.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="mt-2 flex items-center gap-1.5">
          <h1 className="text-lg font-semibold tracking-tight text-white [text-shadow:0_0_10px_rgba(255,255,255,0.65),0_0_24px_rgba(255,255,255,0.28)]">
            {profileConfig.name}
          </h1>
          {profileConfig.verified && (
            <Image
              src="/marca-de-verificacao.png"
              alt="Selo de verificacao"
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
            />
          )}
        </div>

        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-300">
          <MapPin className="h-3 w-3" />
          São Paulo
          <Image
            src="/brasil.png"
            alt="Bandeira do Brasil"
            width={14}
            height={14}
            className="h-3.5 w-3.5 rounded-sm object-cover"
          />
        </p>

        <Card className="mt-3 w-full rounded-2xl border-white/10 bg-white/4 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-left">
            <Avatar className="h-11 w-11 border border-white/10">
              <AvatarImage src={profileConfig.avatarUrl} alt={profileConfig.name} />
              <AvatarFallback className="bg-zinc-900 text-xs text-zinc-200">
                {profileConfig.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profileConfig.name}</p>
              <p className="truncate text-[11px] text-zinc-300">{profileConfig.bio}</p>
            </div>
          </div>
        </Card>

        <Card className="mt-3 w-full rounded-2xl border-white/10 bg-white/4 p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-2 flex rounded-2xl border border-white/10 bg-black/35 p-1">
            <TabButton active={activeTab === "links"} onClick={() => handleTabChange("links")}>
              Links
            </TabButton>
            <TabButton active={activeTab === "setup"} onClick={() => handleTabChange("setup")}>
              Setup Spec
            </TabButton>
            <TabButton active={activeTab === "youtube"} onClick={() => handleTabChange("youtube")}>
              YouTube
            </TabButton>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "links" && (
              <motion.div
                key="links"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex flex-wrap justify-center gap-1.5 py-1"
              >
                {socialLinks.map((item) => (
                  <SocialButton key={item.label} item={item} />
                ))}
              </motion.div>
            )}

            {activeTab === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="grid gap-2"
              >
                {setupSpecs.map((item) => (
                  <SetupSpecItem key={item.label} item={item} />
                ))}
              </motion.div>
            )}

            {activeTab === "youtube" && (
              <motion.div
                key="youtube"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <YouTubeLatestCard state={youtubeState} />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <AnimatePresence initial={false}>
          {activeTab === "links" && (
            <motion.div
              key="highlight-gif"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-3 w-full"
            >
              <Card className="w-full overflow-hidden rounded-2xl border-white/10 bg-white/4 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl">
                  <Image
                    src={profileConfig.gifCardUrl}
                    alt="GIF de destaque"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2 w-full">
          <MusicPlayer ref={musicPlayerRef} volume={volume} />
        </div>
      </div>
    </motion.div>
  );
});
