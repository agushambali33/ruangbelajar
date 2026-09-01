import { useState } from "react";
import { Check, ChevronRight, CreditCard, Edit3, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PaymentBadge } from "@/components/status-badge";
import { useClassroom } from "@/lib/classroom/store";
import { enrichStudents } from "@/lib/classroom/students";
import {
  PAKET_BIMBEL,
  STATUS_PAKET,
  formatRupiah,
  getPackagePrice,
  getPackageShortName,
} from "@/lib/classroom/packages";
import { formatDateId } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/classroom/types";

export function PaymentsPage() {
  const user = useClassroom((s) => s.user)!;
  const students = useClassroom((s) => s.students);
  const payments = useClassroom((s) => s.payments);
  const requestPackage = useClassroom((s) => s.requestPackage);
  const reviewPayment = useClassroom((s) => s.reviewPayment);
  const setStudentPackage = useClassroom((s) => s.setStudentPackage);

  const isTeacher = user.role === "teacher";
  const enriched = enrichStudents(students, payments);
  const me = enriched.find((s) => s.Name.toLowerCase() === user.Name.toLowerCase());
  const pending = payments.filter((p) => p.Status === "Menunggu Persetujuan");
  const history = isTeacher
    ? payments
    : payments.filter((p) => p.Student.toLowerCase() === user.Name.toLowerCase());

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student: "", paket: "", status: "Belum Lunas" as PaymentStatus });
  const [loading, setLoading] = useState(false);

  async function choose(label: string) {
    if (!me?.canSubmitPackage) {
      toast.error(me?.submitBlockReason || "Tidak bisa mengajukan paket sekarang.");
      return;
    }
    setLoading(true);
    const result = await requestPackage(label);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Paket diajukan ke guru. Tunggu persetujuan, ya.");
  }

  async function review(id: string, status: PaymentStatus) {
    setLoading(true);
    const result = await reviewPayment(id, status);
    setLoading(false);
    if (!result.ok) toast.error(result.error);
    else toast.success(status === "Ditolak" ? "Pengajuan ditolak." : "Paket disetujui dan menempel di profil murid.");
  }

  async function saveTeacher() {
    setLoading(true);
    const result = await setStudentPackage({
      student: form.student,
      paket: form.paket,
      status: form.status,
    });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Paket murid disimpan ke profil.");
    setOpen(false);
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Administrasi"
        title="Paket Bimbel"
        text={
          isTeacher
            ? "Setujui pengajuan, atur status, dan pastikan jenis paket nempel di profil murid."
            : "Pilih satu paket. Pengajuan menumpuk tidak diperbolehkan."
        }
        action={
          isTeacher ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setForm({ student: "", paket: "", status: "Belum Lunas" });
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Atur Paket Murid
            </button>
          ) : null
        }
      />

      {!isTeacher && me ? (
        <>
          <section className="panel">
            <span className="eyebrow">Paket kamu</span>
            <h2 className="font-display mt-1 text-[26px] font-medium">
              {me.PackageName || "Belum memilih paket"}
            </h2>
            {me.Paket ? <p className="mt-1 text-sm text-muted">{me.Paket}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PaymentBadge status={me.StatusBayar || undefined} />
              {me.PackageAmount ? (
                <b className="text-lg text-ink">{formatRupiah(me.PackageAmount)}</b>
              ) : null}
            </div>
            {!me.canSubmitPackage ? (
              <div className="mt-4 rounded-2xl bg-[#fae7e5] px-4 py-3 text-sm leading-relaxed text-[#945e5e]">
                {me.submitBlockReason}
              </div>
            ) : me.StatusBayar === "Lunas" ? (
              <div className="mt-4 rounded-2xl bg-[#edf6e9] px-4 py-3 text-sm text-[#5f8258]">
                Paket aktif sudah lunas. Kamu boleh mengajukan paket baru jika ingin perpanjang.
              </div>
            ) : null}
          </section>

          <div className="mb-3 mt-6">
            <span className="eyebrow">Pilih paket</span>
            <h2 className="font-display mt-1 text-2xl">Paket yang tersedia</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {PAKET_BIMBEL.map((paket) => {
              const active = me.Paket === paket.label;
              return (
                <article
                  key={paket.id}
                  className="rounded-[18px] border border-line bg-white p-4"
                  style={active ? { border: "2px solid #c58b8d" } : undefined}
                >
                  <span className="eyebrow">{paket.meetings}</span>
                  <h2 className="font-display mt-1 text-xl">{paket.name}</h2>
                  <p className="mt-1 text-sm text-muted">{paket.detail}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <b className="text-rose-deep">{formatRupiah(paket.price)}</b>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={loading || !me.canSubmitPackage}
                      onClick={() => choose(paket.label)}
                    >
                      {active ? "Ajukan lagi" : "Pilih paket"}
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}

      {isTeacher ? (
        <>
          {pending.length ? (
            <section className="panel mb-4">
              <h2 className="text-base font-bold">Antrian persetujuan</h2>
              <p className="mb-3 text-[12px] text-muted">
                Murid hanya boleh punya satu pengajuan menunggu. Setujui atau tolak di sini.
              </p>
              <div className="grid gap-3">
                {pending.map((p) => (
                  <div key={p.Id} className="rounded-2xl border border-line bg-cream p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <b className="block text-lg">{p.Student}</b>
                        <p className="text-sm text-muted">{getPackageShortName(p.Paket)}</p>
                        <p className="mt-1 text-[12px] text-muted">{formatDateId(p.Date)}</p>
                      </div>
                      <b className="text-rose-deep">{formatRupiah(p.Amount)}</b>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-ok"
                        disabled={loading}
                        onClick={() => review(p.Id, "Belum Lunas")}
                      >
                        <Check size={15} /> Setujui
                      </button>
                      <button
                        type="button"
                        className="btn btn-soft"
                        disabled={loading}
                        onClick={() => review(p.Id, "Lunas")}
                      >
                        Setujui & lunas
                      </button>
                      <button
                        type="button"
                        className="btn btn-warn"
                        disabled={loading}
                        onClick={() => review(p.Id, "Ditolak")}
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel">
            <h2 className="text-base font-bold">Status paket murid</h2>
            <p className="mb-3 text-[12px] text-muted">
              Diambil dari transaksi terbaru, lalu ditulis ulang ke data murid agar profil selalu nempel.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {enriched.map((student) => (
                <article key={student.Id} className="rounded-[18px] border border-line bg-white p-4">
                  <span className="eyebrow">{student.Grade || "Murid"}</span>
                  <h2 className="font-display text-xl">{student.Name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {student.PackageName || "Belum memilih paket"}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <PaymentBadge status={student.StatusBayar || undefined} />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setForm({
                          student: student.Name,
                          paket: student.Paket || "",
                          status:
                            student.StatusBayar === "Menunggu Persetujuan"
                              ? "Belum Lunas"
                              : (student.StatusBayar as PaymentStatus) || "Belum Lunas",
                        });
                        setOpen(true);
                      }}
                    >
                      <Edit3 size={14} /> Atur
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!enriched.length ? <EmptyState icon={<Users size={22} />} text="Belum ada murid." /> : null}
          </section>
        </>
      ) : null}

      <section className="panel mt-4">
        <h2 className="text-base font-bold">Riwayat paket</h2>
        <p className="mb-3 text-[12px] text-muted">
          {isTeacher ? "Semua pengajuan dan pembayaran." : "Pengajuan dan pembayaran paket kamu."}
        </p>
        {!history.length ? (
          <EmptyState icon={<CreditCard size={22} />} text="Belum ada riwayat paket." />
        ) : (
          <div className="grid gap-2">
            {[...history].reverse().map((row) => (
              <div key={row.Id} className="rounded-2xl border border-line bg-cream/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    {isTeacher ? <b className="block">{row.Student}</b> : null}
                    <p className="truncate text-sm">{getPackageShortName(row.Paket) || "Paket lama"}</p>
                    <p className="text-[12px] text-muted">{formatDateId(row.Date)}</p>
                  </div>
                  <div className="text-right">
                    <PaymentBadge status={row.Status} />
                    <p className="mt-1 text-sm font-bold">{formatRupiah(row.Amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={open && isTeacher} onClose={loading ? undefined : () => setOpen(false)} wide>
        <h2 className="font-display text-[28px] font-medium">Atur paket murid</h2>
        <p className="mb-4 text-sm text-muted">
          Data terbaru menjadi paket aktif di Profil, Daftar Murid, dan menu Paket.
        </p>
        <label className="field">
          <span>Siswa</span>
          <select
            value={form.student}
            onChange={(e) => {
              const s = enriched.find((x) => x.Name === e.target.value);
              setForm({
                student: e.target.value,
                paket: s?.Paket || "",
                status:
                  s?.StatusBayar === "Menunggu Persetujuan"
                    ? "Belum Lunas"
                    : (s?.StatusBayar as PaymentStatus) || "Belum Lunas",
              });
            }}
          >
            <option value="">-- Pilih siswa --</option>
            {enriched.map((s) => (
              <option key={s.Id} value={s.Name}>
                {s.Name}
              </option>
            ))}
          </select>
        </label>
        <label className="field mt-3">
          <span>Paket bimbel</span>
          <select
            value={form.paket}
            onChange={(e) => setForm({ ...form, paket: e.target.value })}
          >
            <option value="">-- Pilih paket --</option>
            {PAKET_BIMBEL.map((p) => (
              <option key={p.id} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        {form.paket ? (
          <div className="mt-3 rounded-2xl border border-line bg-cream px-4 py-3">
            <span className="eyebrow">Nominal</span>
            <b className="block text-lg">{formatRupiah(getPackagePrice(form.paket))}</b>
          </div>
        ) : null}
        <label className="field mt-3">
          <span>Status pembayaran</span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
          >
            {STATUS_PAKET.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={saveTeacher} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan & sinkronkan"}
        </button>
      </Modal>
    </div>
  );
}
