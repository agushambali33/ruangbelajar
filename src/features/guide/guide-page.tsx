import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { useClassroom } from "@/lib/classroom/store";

export function GuidePage() {
  const apiUrl = useClassroom((s) => s.apiUrl);
  const setApiUrl = useClassroom((s) => s.setApiUrl);
  const reload = useClassroom((s) => s.reload);
  const [url, setUrl] = useState(apiUrl);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setApiUrl(url);
    if (url.trim()) {
      await reload();
      toast.success("URL Google Apps Script disimpan. Data akan diambil dari Sheet.");
    } else {
      toast.success("Kembali ke mode lokal.");
    }
    setSaving(false);
  }

  return (
    <div className="page-enter max-w-3xl">
      <PageHeader
        eyebrow="Backend"
        title="Panduan Sheet & struktur"
        text="Profil kosong dan foto Drive tidak muncul biasanya karena Sheet lama tidak punya kolom Paket/Photo. Pakai skrip baru."
      />

      <section className="panel mb-4">
        <h2 className="text-base font-bold">Hubungkan Google Apps Script</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Kosongkan jika ingin tetap memakai data di perangkat ini. Tempel URL Web App setelah deploy.
        </p>
        <label className="field mt-4">
          <span>URL Web App</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
          />
        </label>
        <button type="button" className="btn btn-primary mt-4" onClick={save} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan URL"}
        </button>
        <a className="mt-3 inline-block text-sm font-bold text-rose-deep" href="/google-apps-script/Code.gs" download>
          Unduh Code.gs
        </a>
      </section>

      <section className="panel mb-4">
        <h2 className="text-base font-bold">Sheet yang wajib ada</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-[#5a4e47]">
          <li>
            <b>Students:</b> Id, Name, PIN, Role, Grade, Hobby, Photo, Paket, StatusBayar
          </li>
          <li>
            <b>Payments:</b> Id, Student, Paket, Amount, Status, Date, Note
          </li>
          <li>
            <b>Attendance:</b> Id, Name, Date, Status, Note, Photo
          </li>
          <li>
            <b>Materials:</b> Id, Title, Content, Date, Photo, Viewers, Comments
          </li>
          <li>
            <b>Evaluations:</b> Id, Student, Note, Date
          </li>
          <li>
            <b>Announcements:</b> Id, Title, Content, Date
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          Skrip baru membuat tab dan header otomatis jika belum ada. Isi Script Properties:
          SPREADSHEET_ID, DRIVE_FOLDER_ID, TEACHER_PIN.
        </p>
      </section>

      <section className="panel mb-4">
        <h2 className="text-base font-bold">Kenapa foto profil tidak muncul?</h2>
        <p className="mt-2 text-sm leading-7 text-[#5a4e47]">
          Link Google Drive biasa (`/file/d/…/view`) tidak bisa dipakai di tag gambar. Skrip baru
          mengunggah foto, membagikannya ke “anyone with the link”, lalu menyimpan URL tampilan
          `lh3.googleusercontent.com`. Web juga mengubah link Drive lama menjadi thumbnail.
        </p>
      </section>

      <section className="panel">
        <h2 className="text-base font-bold">Struktur kode (pengganti main.jsx panjang)</h2>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-cream p-4 text-[12px] leading-6 text-[#5a4e47]">
{`src/lib/classroom/     data, paket, foto, store
src/features/          tiap halaman (profil, absen, paket…)
src/components/        shell, avatar, modal
src/routes/kelas/      URL halaman
public/google-apps-script/Code.gs`}
        </pre>
        <p className="mt-3 text-sm leading-7 text-muted">
          Yang perlu diubah kalau menambah paket: `src/lib/classroom/packages.ts` saja.
          Logika “nempel ke profil” ada di store — setiap pengajuan/persetujuan menulis ke
          Payments dan ke kolom Paket + StatusBayar di Students.
        </p>
      </section>
    </div>
  );
}
