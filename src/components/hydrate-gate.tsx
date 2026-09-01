import { useEffect, type ReactNode } from "react";
import { useClassroom } from "@/lib/classroom/store";
import { FlowerMark } from "@/components/brand/flower-mark";

export function HydrateGate({ children }: { children: ReactNode }) {
  const hydrated = useClassroom((s) => s.hydrated);
  const setHydrated = useClassroom((s) => s.setHydrated);

  useEffect(() => {
    const unsub = useClassroom.persist.onFinishHydration(() => setHydrated());
    if (useClassroom.persist.hasHydrated()) setHydrated();
    return unsub;
  }, [setHydrated]);

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream text-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-paper shadow-sm">
            <FlowerMark className="size-8" />
          </div>
          <p className="text-sm text-muted">Menyiapkan ruang belajar...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
