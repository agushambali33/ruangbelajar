import { Outlet, createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { HydrateGate } from "@/components/hydrate-gate";
import { useClassroom } from "@/lib/classroom/store";

export const Route = createFileRoute("/kelas")({
  component: KelasLayout,
});

function KelasLayout() {
  return (
    <HydrateGate>
      <KelasInner />
    </HydrateGate>
  );
}

function KelasInner() {
  const user = useClassroom((s) => s.user);
  if (!user) return <Navigate to="/" />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
