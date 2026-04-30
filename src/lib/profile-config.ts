import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaInstagram,
  FaSteam,
  FaTiktok,
  FaTwitch,
  FaYoutube,
} from "react-icons/fa";
import { Mail } from "lucide-react";

export type SocialLink = {
  label: string;
  href: string;
  icon: IconType;
};

export const profileConfig = {
  name: "elk",
  bio: "Less talk, more skills",
  location: "Sao Paulo, BR",
  verified: true,
  avatarUrl: "/levi.jpg",
  gifCardUrl: "/R.gif",
  track: {
    title: "ESCAPE",
    artist: "AENEAS & JESTIC",
    src: "/audio/escape.mp3",
  },
} as const;

export const socialLinks: SocialLink[] = [
  { label: "YouTube", href: "https://www.youtube.com/@elielfilhodev", icon: FaYoutube },
  { label: "Instagram", href: "https://www.instagram.com/elielfilho.dev/", icon: FaInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@flaemys", icon: FaTiktok },
  { label: "Email", href: "mailto:elielgalaxy8@gmail.com", icon: Mail as IconType },
  { label: "Twitch", href: "https://www.twitch.tv/hxssonyy", icon: FaTwitch },
  { label: "Steam", href: "https://steamcommunity.com/profiles/76561199440450048", icon: FaSteam },
  { label: "Discord", href: "https://discord.gg/tQ2yGk7R5", icon: FaDiscord },
];
