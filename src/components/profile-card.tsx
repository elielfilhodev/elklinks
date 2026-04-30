"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MusicPlayer } from "@/components/music-player";
import { profileConfig, socialLinks, type SocialLink } from "@/lib/profile-config";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";

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

type ProfileCardProps = {
  volume: number;
};

export function ProfileCard({ volume }: ProfileCardProps) {
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
          <h1 className="text-lg font-semibold tracking-tight text-white">{profileConfig.name}</h1>
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
          Sao Paulo
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

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {socialLinks.map((item) => (
            <SocialButton key={item.label} item={item} />
          ))}
        </div>

        <Card className="mt-3 w-full overflow-hidden rounded-2xl border-white/10 bg-white/4 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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

        <div className="mt-2 w-full">
          <MusicPlayer volume={volume} />
        </div>
      </div>
    </motion.div>
  );
}
