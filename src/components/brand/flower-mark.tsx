import { cn } from "@/lib/utils";

export function FlowerMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-6", className)}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="3.2" fill="#c47b7e" />
      <ellipse cx="16" cy="7.5" rx="4.2" ry="5.4" fill="#e4a4a3" />
      <ellipse cx="16" cy="24.5" rx="4.2" ry="5.4" fill="#d98f92" />
      <ellipse cx="7.5" cy="16" rx="5.4" ry="4.2" fill="#e8b0a8" />
      <ellipse cx="24.5" cy="16" rx="5.4" ry="4.2" fill="#de9694" />
    </svg>
  );
}

export function GardenArt() {
  return (
    <div className="relative mx-auto hidden h-[420px] w-full max-w-[460px] lg:block">
      <div className="garden-sun" />
      <div className="stem" style={{ height: 270, right: 210, transform: "rotate(7deg)" }} />
      <div className="stem" style={{ height: 310, right: 140, transform: "rotate(-8deg)" }} />
      <div className="stem" style={{ height: 220, right: 78, transform: "rotate(11deg)" }} />
      <div className="bloom" style={{ right: 168, top: 72, width: 86, height: 86 }} />
      <div className="bloom" style={{ right: 96, top: 36, width: 108, height: 108 }} />
      <div className="bloom" style={{ right: 42, top: 128, width: 78, height: 78 }} />
      <div className="leaf-shape" style={{ right: 230, bottom: 150, transform: "rotate(18deg)" }} />
      <div className="leaf-shape" style={{ right: 118, bottom: 198, transform: "rotate(-25deg)" }} />
      <div className="leaf-shape" style={{ right: 36, bottom: 118, transform: "rotate(35deg)" }} />
    </div>
  );
}
