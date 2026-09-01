import { useState } from "react";
import { CalendarCheck2, Check, Send, Smile, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AttendanceBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { useClassroom } from "@/lib/classroom/store";
import { fileToCompressedDataUrl, toDisplayPhoto } from "@/lib/classroom/photos";
import { cn, formatDateId } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/classroom/types";

const CHOICES: Array<{
  value: AttendanceStatus;
  label: string;
  desc: string;
  dot: string;
}> = [
  { value: "Hadir", label: "Hadir", desc: "Saya mengikuti belajar.", dot: "bg-ok" },
  { value: "Sakit", label: "Sakit", desc: "Saya sedang sakit.", dot: "bg-wait" },
  { value: "Izin", label: "Izin", desc: "Saya berhalangan hadir.", dot: "bg-[#7c9bd0]" },
  { value: "Alpa", label: "Alpa", desc: "Saya tidak hadir.", dot: "bg-danger" },
];

export function AttendancePage() {
  const user = useClassroom((s) => s.user)!;
  const rows = useClassroom((s) => s.attendance);
  const students = useClassroom((s) => s.students);
  const submitAttendance = useClassroom((s) => s.submitAttendance);
  const mine =
    user.role === "teacher" ? rows : rows.filter((x) => x.Name === user.Name);

  const [status, setStatus] = useState<AttendanceStatus>("Hadir");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [photoName, setPhotoName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const result = await submitAttendance({ status, note, photo });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error || "Gagal menyimpan absensi.");
      return;
    }
    toast.success("Absensi tersimpan. Semangat belajarnya ya.");
    setNote("");
    setPhoto("");
    setPhotoName("");
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Kehadiran"
        title="Absensi"
        text={
          user.role === "teacher"
            ? "Pantau kehadiran semua murid dalam kartu yang rapi di ponsel."
            : "Catat kehadiranmu hari ini."
        }
      />

      {user.role === "student" ? (
        <section className="panel mb-4 max-w-3xl">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-blush text-rose">
              <Smile size={21} />
            </div>
            <div>
              <h2 className="font-display text-[22px] font-medium">Bagaimana kabarmu hari ini?</h2>
              <p className="text-sm text-muted">Pilih keadaanmu sebelum mulai belajar.</p>
            </div>
          </div>

          <div className="choice-grid">
            {CHOICES.map((item) => (
              <button
                type="button"
                key={item.value}
                className={status === item.value ? "choice active" : "choice"}
                onClick={() => setStatus(item.value)}
              >
                <span className={cn("mb-2 block size-2 rounded-full", item.dot)} />
                <b className="block text-sm">{item.label}</b>
                <small className="mt-1 block text-[11px] leading-snug text-muted">{item.desc}</small>
                {status === item.value ? (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-rose text-white">
                    <Check size={11} />
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <label className="field mt-4">
            <span>Catatan tambahan</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tulis pesan untuk bu guru..."
              rows={3}
            />
          </label>

          <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#ddcac5] px-3 py-3 text-sm text-[#9a8580]">
            <Upload size={18} />
            {photoName || "Unggah foto (opsional)"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPhotoName(file.name);
                setPhoto(await fileToCompressedDataUrl(file, 720));
              }}
            />
          </label>

          <button type="button" className="btn btn-primary mt-4" onClick={submit} disabled={loading}>
            {loading ? "Menyimpan..." : <><Send size={16} /> Simpan absensi</>}
          </button>
        </section>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="mb-3">
          <h2 className="text-base font-bold">Riwayat</h2>
          <span className="text-[12px] text-muted">
            Catatan kehadiran terbaru, tampil sebagai kartu agar tidak melebar di ponsel.
          </span>
        </div>

        {!mine.length ? (
          <EmptyState icon={<CalendarCheck2 size={22} />} text="Belum ada absensi." />
        ) : (
          <div className="grid gap-2.5">
            {mine.slice(0, 40).map((row) => {
              const student = students.find((s) => s.Name === row.Name);
              const proof = toDisplayPhoto(row.Photo);
              return (
                <article
                  key={row.Id}
                  className="rounded-2xl border border-line bg-cream/60 p-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <UserAvatar user={{ Name: row.Name, Photo: student?.Photo }} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <b className="truncate">{row.Name}</b>
                        <AttendanceBadge status={row.Status} />
                      </div>
                      <p className="text-[12px] text-muted">{formatDateId(row.Date)}</p>
                      <p className="mt-1 text-sm leading-relaxed break-words text-[#6f625f]">
                        {row.Note || "Tanpa catatan"}
                      </p>
                    </div>
                    {proof ? (
                      <img
                        src={proof}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
