import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  Heart,
  LockKeyhole,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/classroom/seed";
import { FlowerMark, GardenArt } from "@/components/brand/flower-mark";

function Feature({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[15px] border border-[#f0e6e2] bg-white p-[18px]">
      <div className="text-rose">{icon}</div>
      <b className="mt-2.5 block text-[13px]">{title}</b>
      <span className="mt-1 block text-[12px] leading-relaxed text-muted">{text}</span>
    </div>
  );
}

export function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_80%_20%,#fbe7df_0,transparent_27%),linear-gradient(135deg,#fffaf7,#fff6f1)]">
      <div className="petal left-[6%] top-[19%] text-4xl">✿</div>
      <div className="petal right-[15%] top-[9%] text-2xl">✽</div>
      <div className="petal bottom-[22%] left-[17%] text-3xl">❀</div>
      <div className="petal bottom-[8%] right-[5%] text-5xl">✾</div>

      <nav className="relative z-10 mx-auto flex max-w-[1180px] items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-[13px] bg-white shadow-[0_7px_25px_#b58c7c1a]">
            <FlowerMark />
          </div>
          <div>
            <b className="block text-[15px]">{APP_NAME}</b>
            <span className="block text-[11px] tracking-wide text-muted">{APP_TAGLINE}</span>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onLogin}>
          <LockKeyhole size={16} />
          Masuk
        </button>
      </nav>

      <main className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-8 px-6 pb-16 pt-10 lg:grid-cols-2 lg:pt-16">
        <div className="max-w-[570px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-[#9b7774]">
            <Sparkles size={14} />
            Tempat kecil untuk belajar lebih berarti
          </div>
          <h1 className="font-display mt-5 text-[48px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[64px]">
            Belajar tumbuh
            <br />
            <i className="text-[#c98284]">seperti bunga.</i>
          </h1>
          <p className="mt-4 max-w-[500px] text-[15px] leading-8 text-[#786c69]">
            Ruang sederhana untuk absensi, materi, paket bimbel, dan kabar belajar.
            Dibuat hangat untuk guru dan murid.
          </p>
          <button type="button" className="btn btn-primary mt-6 px-5 py-3.5 text-sm" onClick={onLogin}>
            Masuk ke Ruang Belajar
            <ChevronRight size={18} />
          </button>
          <div className="mt-4 flex items-center gap-2 text-[12px] text-[#9b8985]">
            <Heart size={14} />
            Dibuat untuk kelas kecil, dengan perhatian yang besar.
          </div>
        </div>
        <GardenArt />
      </main>

      <div className="relative z-10 mx-auto mb-12 grid max-w-[1050px] grid-cols-2 gap-3 px-5 lg:grid-cols-4">
        <Feature icon={<CalendarCheck2 size={18} />} title="Absensi" text="Catat kehadiran tanpa tabel yang melebar di ponsel." />
        <Feature icon={<BookOpen size={18} />} title="Materi" text="Belajar dari materi yang rapi dan mudah dibaca." />
        <Feature icon={<Heart size={18} />} title="Evaluasi" text="Pesan positif dari guru, personal untuk tiap murid." />
        <Feature icon={<Megaphone size={18} />} title="Paket" text="Ajukan paket, guru menyetujui, status nempel di profil." />
      </div>

      <footer className="pb-10 text-center text-[12px] text-[#ad9c98]">
        Dibuat dengan cinta oleh Adelia Ardabela
      </footer>
    </div>
  );
}
