"use client";

import { motion } from "framer-motion";

type Star = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
};

type Snowflake = {
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

function seeded(min: number, max: number, seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  const fraction = x - Math.floor(x);
  return min + fraction * (max - min);
}

const stars: Star[] = Array.from({ length: 42 }, (_, index) => ({
  left: `${seeded(0, 100, index + 1).toFixed(2)}%`,
  top: `${seeded(0, 100, index + 17).toFixed(2)}%`,
  size: seeded(1, 3, index + 31),
  duration: seeded(2, 5, index + 47),
  delay: seeded(0, 2, index + 63),
}));

const snowflakes: Snowflake[] = Array.from({ length: 34 }, (_, index) => ({
  left: `${seeded(2, 98, index + 101).toFixed(2)}%`,
  size: seeded(1.5, 4.5, index + 137),
  duration: seeded(7, 15, index + 173),
  delay: seeded(0, 10, index + 211),
  drift: seeded(-26, 26, index + 257),
  opacity: seeded(0.35, 0.85, index + 293),
}));

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {snowflakes.map((flake, index) => (
        <motion.span
          key={`snow-${index}`}
          className="absolute rounded-full bg-white"
          style={{
            left: flake.left,
            top: "-6%",
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            filter: "blur(0.2px)",
          }}
          animate={{
            y: ["0vh", "112vh"],
            x: [0, flake.drift, 0],
            opacity: [0, flake.opacity, flake.opacity, 0],
          }}
          transition={{
            duration: flake.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: flake.delay,
          }}
        />
      ))}

      {stars.map((star, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white/70"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.25, 0.9, 0.25], scale: [1, 1.3, 1] }}
          transition={{
            duration: star.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}

      <div className="absolute -left-20 top-0 h-64 w-40 rotate-6 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_70%)] blur-2xl" />
      <div className="absolute -left-10 top-24 h-56 w-28 -rotate-12 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.16),transparent_75%)] blur-xl" />
      <div className="absolute -right-16 bottom-12 h-44 w-24 rotate-12 bg-[radial-gradient(circle,rgba(120,140,255,0.15),transparent_75%)] blur-2xl" />
    </div>
  );
}
