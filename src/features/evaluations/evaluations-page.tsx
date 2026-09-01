import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { useClassroom } from "@/lib/classroom/store";
import { formatDateId } from "@/lib/utils";

export function EvaluationsPage() {
  const user = useClassroom((s) => s.user)!;
  const rows = useClassroom((s) => s.evaluations);
  const students = useClassroom((s) => s.students);
  const addEvaluation = useClassroom((s) => s.addEvaluation);
  const visible =
    user.role === "teacher" ? rows : rows.filter((r) => r.Student === user.Name);

  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!student || !note.trim()) {
      toast.error("Pilih siswa dan isi catatan.");
      return;
    }
    setLoading(true);
    await addEvaluation({ student, note });
    setLoading(false);
    setOpen(false);
    setStudent("");
    setNote("");
    toast.success("Catatan terkirim.");
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Evaluasi"
        title="Catatan Belajar"
        text="Pesan dan catatan khusus untuk murid."
        action={
          user.role === "teacher" ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              <Plus size={16} />
              Beri Catatan
            </button>
          ) : null
        }
      />

      {!visible.length ? (
        <EmptyState icon={<Heart size={22} />} text="Belum ada catatan evaluasi." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((row) => (
            <article key={row.Id} className="flex gap-3 rounded-[18px] border border-line bg-white p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fbefeb] text-rose">
                <Heart size={18} />
              </div>
              <div className="min-w-0">
                <span className="eyebrow">{formatDateId(row.Date)}</span>
                <h2 className="font-display text-xl">{row.Student}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{row.Note}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} onClose={loading ? undefined : () => setOpen(false)} wide>
        <h2 className="font-display text-[28px] font-medium">Beri Evaluasi</h2>
        <label className="field mt-4">
          <span>Pilih siswa</span>
          <select value={student} onChange={(e) => setStudent(e.target.value)}>
            <option value="">-- Pilih --</option>
            {students
              .filter((s) => s.Role !== "teacher")
              .map((s) => (
                <option key={s.Id} value={s.Name}>
                  {s.Name}
                </option>
              ))}
          </select>
        </label>
        <label className="field mt-3">
          <span>Catatan guru</span>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Pesan positif untuk murid..."
          />
        </label>
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={save} disabled={loading}>
          {loading ? "Menyimpan..." : "Kirim Catatan"}
        </button>
      </Modal>
    </div>
  );
}
