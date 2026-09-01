import { useState } from "react";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { HydrateGate } from "@/components/hydrate-gate";
import { LandingPage } from "@/components/landing/landing-page";
import { LoginDialog } from "@/components/landing/login-dialog";
import { useClassroom } from "@/lib/classroom/store";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <HydrateGate>
      <HomeInner />
    </HydrateGate>
  );
}

function HomeInner() {
  const user = useClassroom((s) => s.user);
  const login = useClassroom((s) => s.login);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/kelas" />;

  async function onLogin(name: string, pin: string) {
    setLoading(true);
    setNotice("");
    const result = await login(name, pin);
    setLoading(false);
    if (!result.ok) {
      setNotice(result.error || "Nama atau PIN salah.");
      return;
    }
    setOpen(false);
    navigate({ to: "/kelas" });
  }

  return (
    <>
      <LandingPage onLogin={() => setOpen(true)} />
      <LoginDialog
        open={open}
        onClose={() => setOpen(false)}
        onLogin={onLogin}
        notice={notice}
        loading={loading}
      />
    </>
  );
}
