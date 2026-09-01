import { useState } from "react";
import { BookOpen, MessageCircle, Plus, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { useClassroom } from "@/lib/classroom/store";
import { fileToCompressedDataUrl, toDisplayPhoto } from "@/lib/classroom/photos";
import { formatDateId } from "@/lib/utils";
import type { Material } from "@/lib/classroom/types";

export function MaterialsPage() {
  const user = useClassroom((s) => s.user)!;
  const rows = useClassroom((s) => s.materials);
  const addMaterial = useClassroom((s) => s.addMaterial);
  const markRead = useClassroom((s) => s.markRead);
  const addComment = useClassroom((s) => s.addComment);

  const [openAdd, setOpenAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Material | null>(null);
  const [comment, setComment] = useState("");

  async function openMat(row: Material) {
    setSelected(row);
    if (user.role === "student" && !row.Viewers.includes(user.Name)) {
      await markRead(row.Id);
    }
  }

  async function save() {
    if (!title.trim() || !content.trim()) {
      toast.error("Isi judul dan penjelasan materi.");
      return;
    }
    setLoading(true);
    await addMaterial({ title, content, photo });
    setLoading(false);
    setOpenAdd(false);
    setTitle("");
    setContent("");
    setPhoto("");
    toast.success("Materi dipublikasikan.");
  }

  async function sendComment() {
    if (!selected || !comment.trim()) return;
    await addComment(selected.Id, comment);
    setSelected({
      ...selected,
      Comments: [...selected.Comments, { name: user.Name, text: comment, time: "Baru saja" }],
    });
    setComment("");
  }

  const live = selected
    ? rows.find((r) => r.Id === selected.Id) || selected
    : null;

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Pembelajaran"
        title="Materi Harian"
        text="Materi dibuat rapi agar mudah dibaca."
        action={
          user.role === "teacher" ? (
            <button type="button" className="btn btn-primary" onClick={() => setOpenAdd(true)}>
              <Plus size={16} />
              Buat Materi
            </button>
          ) : null
        }
      />

      {!rows.length ? (
        <EmptyState icon={<BookOpen size={22} />} text="Belum ada materi." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => {
            const unread = user.role === "student" && !row.Viewers.includes(user.Name);
            return (
              <button
                type="button"
                key={row.Id}
                className="relative rounded-[18px] border border-line bg-white p-4 text-left"
                onClick={() => openMat(row)}
              >
                {unread ? (
                  <span className="absolute right-3 top-3 rounded-full bg-rose px-2 py-0.5 text-[10px] font-extrabold text-white">
                    Baru
                  </span>
                ) : null}
                <div className="mb-2 grid size-10 place-items-center rounded-xl bg-[#fbefeb] text-rose">
                  <BookOpen size={18} />
                </div>
                <span className="eyebrow">{formatDateId(row.Date)}</span>
                <h2 className="font-display mt-1 text-xl">{row.Title}</h2>
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{row.Content}</p>
                <div className="mt-3 flex gap-4 text-[12px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} /> {row.Viewers.length} dibaca
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={12} /> {row.Comments.length} komen
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={!!live} onClose={() => setSelected(null)} wide>
        {live ? (
          <>
            {toDisplayPhoto(live.Photo) ? (
              <img
                src={toDisplayPhoto(live.Photo) || ""}
                alt=""
                referrerPolicy="no-referrer"
                className="mb-4 max-h-52 w-full rounded-2xl object-cover"
              />
            ) : null}
            <span className="badge badge-wait">{formatDateId(live.Date)}</span>
            <h2 className="font-display mt-2 text-[28px] font-medium">{live.Title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5a4e47]">{live.Content}</p>
            <hr className="my-5 border-line" />
            <h3 className="mb-3 text-sm font-bold">Ruang diskusi</h3>
            <div className="grid max-h-48 gap-3 overflow-auto">
              {live.Comments.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blush text-xs font-bold text-rose-deep">
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {c.name} <span className="font-medium text-muted">{c.time}</span>
                    </div>
                    <div className="text-sm text-[#5a4e47]">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-xl border border-line px-3 py-2.5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis pesan..."
                onKeyDown={(e) => e.key === "Enter" && sendComment()}
              />
              <button type="button" className="btn btn-primary" onClick={sendComment}>
                <Send size={14} />
              </button>
            </div>
          </>
        ) : null}
      </Modal>

      <Modal open={openAdd} onClose={loading ? undefined : () => setOpenAdd(false)} wide>
        <h2 className="font-display text-[28px] font-medium">Buat Materi</h2>
        <label className="field mt-4">
          <span>Judul materi</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field mt-3">
          <span>Penjelasan</span>
          <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        </label>
        <label className="field mt-3">
          <span>Foto pendukung</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto(await fileToCompressedDataUrl(file));
            }}
          />
        </label>
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={save} disabled={loading}>
          {loading ? "Menyimpan..." : "Posting Materi"}
        </button>
      </Modal>
    </div>
  );
}
