import Image from "next/image";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/background.gif"
        alt=""
        fill
        unoptimized
        sizes="100vw"
        aria-hidden="true"
        className="object-cover opacity-[0.14] saturate-110"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.55)_78%)]" />
      <div className="absolute -left-20 top-0 h-64 w-40 rotate-6 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_70%)] blur-2xl" />
      <div className="absolute -left-10 top-24 h-56 w-28 -rotate-12 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.16),transparent_75%)] blur-xl" />
      <div className="absolute -right-16 bottom-12 h-44 w-24 rotate-12 bg-[radial-gradient(circle,rgba(120,140,255,0.15),transparent_75%)] blur-2xl" />
    </div>
  );
}
