import { useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { UserAvatar } from "@/components/user-avatar";
import { PaymentBadge } from "@/components/status-badge";
import { useClassroom } from "@/lib/classroom/store";
import { enrichStudents } from "@/lib/classroom/students";
import { PAKET_BIMBEL, STATUS_PAKET, getPackageShortName } from "@/lib/classroom/packages";
import type { EnrichedStudent, PaymentStatus } from "@/lib/classroom/types";

export function StudentsPage() {
  const user = useClassroom((s) => s.user);
  const students = useClassroom((s) => s.students);
  const payments = useClassroom((s) => s.payments);
  const setStudentPackage = useClassroom((s) => s.setStudentPackage);
  const addStudent = useClassroom((s) => s.addStudent);
  const rows = enrichStudents(students, payments);

  const [selected, setSelected] = useState<EnrichedStudent | null>(null);
  const [paket, setPaket] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("Belum Lunas");
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [grade, setGrade] = useState("");

  if (!user || user.role !== "teacher") return <Navigate to="/kelas" />;

  async function save() {
    if (!selected) return;
    if (!paket) {
      toast.error("Pilih paket terlebih dahulu.");
      return;
    }
    setLoading(true);
    const result = await setStudentPackage({
      student: selected.Name,
      paket,
      status,
    });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Paket menempel di profil murid.");
    setSelected(null);
  }

  async function create() {
    setLoading(true);
    const result = await addStudent({ name, pin, grade });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Murid baru ditambahkan.");
    setOpenAdd(false);
    setName("");
    setPin("");
    setGrade("");
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Manajemen"
        title="Daftar Murid"
        text="Ketuk nama murid untuk mengatur paket bimbel. Status ini yang tampil di profil."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setOpenAdd(true)}>
            <Plus size={16} /> Tambah murid
          </button>
        }
      />

      {!rows.length ? (
        <EmptyState icon={<Users size={22} />} text="Belum ada murid." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((student) => (
            <button
              type="button"
              key={student.Id}
              className="rounded-[18px] border border-line bg-white p-4 text-left"
              onClick={() => {
                setSelected(student);
                setPaket(student.Paket || "");
                setStatus((student.StatusBayar as PaymentStatus) || "Belum Lunas");
              }}
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={student} />
                <div className="min-w-0">
                  <h2 className="font-display truncate text-xl">{student.Name}</h2>
                  <p className="text-[12px] text-muted">{student.Grade || "Murid SD"}</p>
                  <p className="text-[12px] text-muted">PIN {student.PIN}</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-line bg-cream p-3">
                <span className="eyebrow">Paket bimbel</span>
                <b className="mt-1 block text-sm">
                  {student.PackageName || "Belum dipilih"}
                </b>
                <div className="mt-2">
                  <PaymentBadge status={student.StatusBayar || undefined} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={loading ? undefined : () => setSelected(null)} wide>
        {selected ? (
          <>
            <h2 className="font-display text-[26px] font-medium">Update {selected.Name}</h2>
            <p className="mb-4 text-sm text-muted">
              Perubahan ditulis ke paket terbaru, lalu disalin ke data murid agar profil tidak kosong.
            </p>
            <label className="field">
              <span>Paket bimbel</span>
              <select value={paket} onChange={(e) => setPaket(e.target.value)}>
                <option value="">-- Pilih paket --</option>
                {PAKET_BIMBEL.map((p) => (
                  <option key={p.id} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field mt-3">
              <span>Status pembayaran</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              >
                {STATUS_PAKET.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            {paket ? (
              <p className="mt-3 text-sm text-muted">Aktif: {getPackageShortName(paket)}</p>
            ) : null}
            <button type="button" className="btn btn-primary mt-5 w-full" onClick={save} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </>
        ) : null}
      </Modal>

      <Modal open={openAdd} onClose={loading ? undefined : () => setOpenAdd(false)}>
        <h2 className="font-display text-[26px] font-medium">Tambah murid</h2>
        <label className="field mt-4">
          <span>Nama</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field mt-3">
          <span>PIN</span>
          <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={8} />
        </label>
        <label className="field mt-3">
          <span>Kelas</span>
          <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Misal: 3 SD" />
        </label>
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={create} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan murid"}
        </button>
      </Modal>
    </div>
  );
}
