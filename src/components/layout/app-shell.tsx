import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CalendarCheck2,
  CreditCard,
  Flower2,
  Home,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  User,
  Users,
  X,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/classroom/seed";
import { useClassroom } from "@/lib/classroom/store";
import { FlowerMark } from "@/components/brand/flower-mark";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  short: string;
  icon: typeof Home;
};

const teacherNav: NavItem[] = [
  { to: "/kelas", label: "Beranda", short: "Beranda", icon: Flower2 },
  { to: "/kelas/profil", label: "Profil", short: "Profil", icon: User },
  { to: "/kelas/absensi", label: "Absensi", short: "Absen", icon: CalendarCheck2 },
  { to: "/kelas/murid", label: "Manajemen Murid", short: "Murid", icon: Users },
  { to: "/kelas/materi", label: "Materi", short: "Materi", icon: BookOpen },
  { to: "/kelas/evaluasi", label: "Evaluasi", short: "Evaluasi", icon: Award },
  { to: "/kelas/paket", label: "Paket", short: "Paket", icon: CreditCard },
  { to: "/kelas/kabar", label: "Kabar", short: "Kabar", icon: Megaphone },
  { to: "/kelas/panduan", label: "Panduan Sheet", short: "Panduan", icon: LifeBuoy },
];

const studentNav: NavItem[] = [
  { to: "/kelas", label: "Beranda", short: "Beranda", icon: Flower2 },
  { to: "/kelas/profil", label: "Profil Kamu", short: "Profil", icon: User },
  { to: "/kelas/absensi", label: "Absensi", short: "Absen", icon: CalendarCheck2 },
  { to: "/kelas/materi", label: "Materi", short: "Materi", icon: BookOpen },
  { to: "/kelas/evaluasi", label: "Pesan Guru", short: "Pesan", icon: Award },
  { to: "/kelas/paket", label: "Paket", short: "Paket", icon: CreditCard },
  { to: "/kelas/kabar", label: "Kabar", short: "Kabar", icon: Megaphone },
];

const teacherMobile: NavItem[] = [
  { to: "/kelas", label: "Beranda", short: "Beranda", icon: Home },
  { to: "/kelas/absensi", label: "Absen", short: "Absen", icon: CalendarCheck2 },
  { to: "/kelas/materi", label: "Materi", short: "Materi", icon: BookOpen },
  { to: "/kelas/paket", label: "Paket", short: "Paket", icon: CreditCard },
  { to: "/kelas/murid", label: "Murid", short: "Murid", icon: Users },
];

const studentMobile: NavItem[] = [
  { to: "/kelas", label: "Beranda", short: "Beranda", icon: Home },
  { to: "/kelas/absensi", label: "Absen", short: "Absen", icon: CalendarCheck2 },
  { to: "/kelas/materi", label: "Materi", short: "Materi", icon: BookOpen },
  { to: "/kelas/evaluasi", label: "Pesan", short: "Pesan", icon: Award },
  { to: "/kelas/profil", label: "Profil", short: "Profil", icon: User },
];

function isActive(pathname: string, to: string) {
  if (to === "/kelas") return pathname === "/kelas" || pathname === "/kelas/";
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const user = useClassroom((s) => s.user)!;
  const logout = useClassroom((s) => s.logout);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const isTeacher = user.role === "teacher";
  const desktop = isTeacher ? teacherNav : studentNav;
  const mobile = isTeacher ? teacherMobile : studentMobile;
  const firstName = user.Name.split(" ")[0];

  function signOut() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-dvh bg-cream text-ink lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col border-r border-line bg-[#fffdfb] px-4 py-6 lg:flex">
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <div className="grid size-10 place-items-center rounded-[13px] bg-white shadow-[0_7px_25px_#b58c7c1a]">
            <FlowerMark />
          </div>
          <div>
            <b className="block text-[15px] leading-tight">{APP_NAME}</b>
            <span className="block text-[11px] tracking-wide text-muted">{APP_TAGLINE}</span>
          </div>
        </div>
        <p className="px-3 pb-2 text-[10px] font-extrabold tracking-[0.14em] text-[#aa8b86]">
          MENU UTAMA
        </p>
        <nav className="grid gap-1 overflow-y-auto">
          {desktop.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] text-[#8b7c79]",
                  active && "bg-[#f9ece8] font-bold text-rose-deep",
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="flex items-center gap-2.5 border-t border-line px-1.5 py-4">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <b className="block truncate text-[13px]">{user.Name}</b>
              <span className="text-[11px] text-muted">{isTeacher ? "Guru" : "Murid"}</span>
            </div>
          </div>
          <button type="button" className="btn btn-warn w-full" onClick={signOut}>
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-1 flex-col lg:ml-[250px]">
        <header className="flex items-center justify-between px-4 pb-2 pt-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-white shadow-sm">
              <FlowerMark className="size-5" />
            </div>
            <div>
              <b className="block text-sm">{APP_NAME}</b>
              <span className="text-[12px] text-muted">Halo, {firstName}</span>
            </div>
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} color="#8b7e7a" />
          </button>
        </header>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fffaf7fa] p-6 lg:hidden">
            <div className="mb-7 flex items-center justify-between">
              <b className="font-display text-[22px]">Menu Utama</b>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full bg-blush"
                onClick={() => setMenuOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={20} color="#8b7e7a" />
              </button>
            </div>
            <div className="grid gap-3">
              {desktop.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-14 items-center gap-4 rounded-2xl border border-line px-4 py-4 text-[15px] text-ink",
                      active ? "bg-[#f8e9e5] font-bold" : "bg-white",
                    )}
                  >
                    <Icon size={22} color={active ? "#a76366" : "#b4a5a0"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <button type="button" className="btn btn-warn mt-8 w-full" onClick={signOut}>
              <LogOut size={18} />
              Keluar Akun
            </button>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-28 pt-2 sm:px-6 lg:px-10 lg:pb-10 lg:pt-9">
          {children}
        </div>

        <footer className="hidden pb-6 text-center text-[12px] text-muted lg:block">
          Dibuat dengan cinta oleh Adelia Ardabela
        </footer>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#fffdfbf5] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1 py-1.5">
          {mobile.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] text-muted",
                  active && "text-rose-deep",
                )}
              >
                <Icon size={19} />
                <span className={cn(active && "font-extrabold")}>{item.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
