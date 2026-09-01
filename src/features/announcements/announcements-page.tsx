import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { useClassroom } from "@/lib/classroom/store";
import { formatDateId } from "@/lib/utils";

export function AnnouncementsPage() {
  const user = useClassroom((s) => s.user)!;
  const rows = useClassroom((s) => s.announcements);
  const addAnnouncement = useClassroom((s) => s.addAnnouncement);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!title.trim() || !content.trim()) {
      toast.error("Isi judul dan kabar.");
      return;
    }
    setLoading(true);
    await addAnnouncement({ title, content });
    setLoading(false);
    setOpen(false);
    setTitle("");
    setContent("");
    toast.success("Kabar terkirim.");
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Kabar"
        title="Pengumuman"
        text="Pesan penting dari guru untuk kelas."
        action={
          user.role === "teacher" ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              <Plus size={16} />
              Kabar Baru
            </button>
          ) : null
        }
      />

      {!rows.length ? (
        <EmptyState icon={<Megaphone size={22} />} text="Belum ada kabar." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <article key={row.Id} className="flex gap-3 rounded-[18px] border border-line bg-white p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fbefeb] text-rose">
                <Megaphone size={18} />
              </div>
              <div className="min-w-0">
                <span className="eyebrow">{formatDateId(row.Date)}</span>
                <h2 className="font-display text-xl">{row.Title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{row.Content}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} onClose={loading ? undefined : () => setOpen(false)} wide>
        <h2 className="font-display text-[28px] font-medium">Buat pengumuman</h2>
        <label className="field mt-4">
          <span>Judul</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field mt-3">
          <span>Isi kabar</span>
          <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </label>
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={save} disabled={loading}>
          {loading ? "Menyimpan..." : "Kirim kabar"}
        </button>
      </Modal>
    </div>
  );
}
