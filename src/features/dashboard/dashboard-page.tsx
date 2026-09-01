import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  CalendarCheck2,
  Check,
  CreditCard,
  Flower2,
  Heart,
  Leaf,
  Megaphone,
  Smile,
  Star,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PaymentBadge } from "@/components/status-badge";
import { useClassroom } from "@/lib/classroom/store";
import { enrichStudents } from "@/lib/classroom/students";
import { getPackageShortName } from "@/lib/classroom/packages";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const user = useClassroom((s) => s.user)!;
  const data = useClassroom((s) => s);
  const isTeacher = user.role === "teacher";
  const attendance = data.attendance;
  const mine = isTeacher
    ? attendance
    : attendance.filter((x) => x.Name === user.Name);
  const present = mine.filter((x) => x.Status === "Hadir").length;
  const materials = data.materials;
  const evaluations = data.evaluations;
  const myEvaluations = evaluations.filter((e) => e.Student === user.Name);
  const myRead = materials.filter((m) => m.Viewers.includes(user.Name)).length;
  const announcements = data.announcements;
  const pending = data.payments.filter((p) => p.Status === "Menunggu Persetujuan");
  const me = enrichStudents(data.students, data.payments).find(
    (s) => s.Name.toLowerCase() === user.Name.toLowerCase(),
  );

  const progress = [
    { icon: Smile, title: "Datang", text: "Siap belajar", done: present > 0 },
    { icon: BookMarked, title: "Membaca", text: "Buka materi", done: myRead > 0 },
    { icon: Star, title: "Bertumbuh", text: "Dapat catatan", done: myEvaluations.length > 0 },
    { icon: Leaf, title: "Konsisten", text: "Terus mencoba", done: present >= 3 || myRead >= 3 },
  ];

  const stats: Array<[typeof Users, number, string, string]> = isTeacher
    ? [
        [Users, data.students.filter((s) => s.Role !== "teacher").length, "Murid", "/kelas/murid"],
        [CalendarCheck2, present, "Hadir", "/kelas/absensi"],
        [BookOpen, materials.length, "Materi", "/kelas/materi"],
        [Award, evaluations.length, "Evaluasi", "/kelas/evaluasi"],
      ]
    : [
        [CalendarCheck2, present, "Hadir", "/kelas/absensi"],
        [BookOpen, materials.length, "Materi", "/kelas/materi"],
        [Award, myEvaluations.length, "Pesan", "/kelas/evaluasi"],
        [Megaphone, announcements.length, "Kabar", "/kelas/kabar"],
      ];

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Ruang Belajar"
        title={`Halo, ${user.Name.split(" ")[0]}`}
        text={
          isTeacher
            ? "Mode guru aktif. Lihat perkembangan kelas dan pengajuan paket yang menunggu."
            : "Senang melihatmu kembali. Yuk belajar sedikit demi sedikit."
        }
      />

      <section className="relative overflow-hidden rounded-[20px] border border-[#eedbd4] bg-[linear-gradient(110deg,#f4dfd8,#f8eae2)] px-6 py-6">
        <div className="relative z-10 max-w-xl">
          <span className="eyebrow">Catatan hari ini</span>
          <h2 className="font-display mt-2 text-[22px] font-medium leading-snug sm:text-[26px]">
            “Setiap halaman baru adalah kesempatan untuk tumbuh.”
          </h2>
          <p className="mt-2 text-sm text-[#7d6b67]">
            Tidak perlu terburu-buru. Yang penting terus melangkah.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-4 -top-2 text-rose/70">
          <div className="grid size-24 place-items-center rounded-full bg-white/40">
            <Flower2 size={44} />
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map(([Icon, value, label, to]) => (
          <Link
            key={label}
            to={to as "/kelas"}
            className="flex items-center gap-3 rounded-[16px] border border-line bg-white p-4 text-left"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-[#fbefeb] text-rose">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] text-muted">{label}</span>
              <b className="block text-[22px] leading-none">{value}</b>
            </div>
            <ArrowRight size={15} className="hidden text-muted sm:block" />
          </Link>
        ))}
      </div>

      {!isTeacher && me ? (
        <Link
          to="/kelas/paket"
          className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-line bg-white p-4"
        >
          <div className="min-w-0">
            <span className="eyebrow">Paket kamu</span>
            <h3 className="font-display mt-1 truncate text-xl">
              {me.PackageName || "Belum memilih paket"}
            </h3>
          </div>
          <PaymentBadge status={me.StatusBayar || undefined} />
        </Link>
      ) : null}

      {!isTeacher ? (
        <section className="panel mt-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <span className="eyebrow">Perjalanan belajar</span>
              <h2 className="font-display mt-1 text-2xl font-medium">Pelan-pelan, kamu tumbuh</h2>
            </div>
            <div className="grid size-11 place-items-center rounded-full bg-[#eef3ea] text-leaf">
              <Leaf size={20} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {progress.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={cn(
                    "rounded-2xl border border-line p-3",
                    item.done && "border-[#cfe3cb] bg-[#f6fbf4]",
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 grid size-9 place-items-center rounded-full bg-blush text-rose",
                      item.done && "bg-[#dcefd8] text-ok",
                    )}
                  >
                    {item.done ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <b className="block text-sm">{item.title}</b>
                  <span className="text-[12px] text-muted">{item.text}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {isTeacher && pending.length > 0 ? (
        <section className="panel mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Menunggu persetujuan</h2>
              <p className="text-[12px] text-muted">
                {pending.length} pengajuan paket dari murid.
              </p>
            </div>
            <Link to="/kelas/paket" className="btn btn-soft">
              Tinjau
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-2">
            {pending.slice(0, 3).map((p) => (
              <div key={p.Id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-3 py-3">
                <div className="min-w-0">
                  <b className="block truncate">{p.Student}</b>
                  <span className="block truncate text-[12px] text-muted">
                    {getPackageShortName(p.Paket)}
                  </span>
                </div>
                <PaymentBadge status={p.Status} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {isTeacher ? (
        <section className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="panel">
            <h2 className="text-base font-bold">Perjalanan kelas</h2>
            <p className="mb-4 text-[12px] text-muted">Gambaran sederhana aktivitas belajar.</p>
            <div className="grid gap-3">
              {(
                [
                  { icon: Users, label: "Murid terdaftar", value: data.students.filter((s) => s.Role !== "teacher").length },
                  { icon: CalendarCheck2, label: "Kehadiran tercatat", value: attendance.length },
                  { icon: BookOpen, label: "Materi tersedia", value: materials.length },
                  { icon: Heart, label: "Catatan perkembangan", value: evaluations.length },
                ] as const
              ).map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-[#fbefeb] text-rose">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <span className="block text-[12px] text-muted">{item.label}</span>
                    <b>{item.value}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel relative overflow-hidden">
            <div className="mb-2 text-leaf">
              <CreditCard size={20} />
            </div>
            <span className="eyebrow">Untuk guru</span>
            <h2 className="font-display mt-2 text-[26px] font-medium leading-snug">
              Setiap kemajuan kecil tetap berarti.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Setujui paket murid, beri catatan personal, dan pastikan status bayar nempel di profil.
            </p>
            <Link to="/kelas/evaluasi" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-rose-deep">
              Beri catatan <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
