import { useState } from "react";
import { Edit3 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Modal } from "@/components/modal";
import { PaymentBadge } from "@/components/status-badge";
import { useClassroom } from "@/lib/classroom/store";
import { enrichStudents } from "@/lib/classroom/students";
import { formatRupiah, getPackageShortName } from "@/lib/classroom/packages";
import { fileToCompressedDataUrl } from "@/lib/classroom/photos";

export function ProfilePage() {
  const user = useClassroom((s) => s.user)!;
  const students = useClassroom((s) => s.students);
  const payments = useClassroom((s) => s.payments);
  const updateProfile = useClassroom((s) => s.updateProfile);
  const enriched = enrichStudents(students, payments);
  const me = enriched.find((s) => s.Name.toLowerCase() === user.Name.toLowerCase());
  const paket = me?.Paket || user.Paket || "";
  const status = me?.StatusBayar || user.StatusBayar || "";
  const amount = me?.PackageAmount || 0;

  const [open, setOpen] = useState(false);
  const [hobby, setHobby] = useState(user.Hobby || "");
  const [photo, setPhoto] = useState(user.Photo || "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const result = await updateProfile({ hobby, photo });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error || "Gagal menyimpan profil.");
      return;
    }
    toast.success("Profil tersimpan.");
    setOpen(false);
  }

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Personal"
        title="Profil Kamu"
        text="Ruang kecil untuk mengenal dirimu — termasuk paket bimbel yang sedang aktif."
      />

      <div className="mx-auto max-w-md">
        <section className="panel relative overflow-hidden text-center">
          <div className="mx-auto mt-2">
            <UserAvatar user={{ ...user, Photo: photo || user.Photo }} size="lg" />
          </div>
          <h2 className="font-display mt-4 text-[28px] font-medium">{user.Name}</h2>
          <span className="mt-1 inline-flex rounded-full bg-blush px-3 py-1 text-[12px] font-bold text-rose-deep">
            {user.role === "teacher" ? "Guru" : `Siswa ${user.Grade || ""}`.trim()}
          </span>

          {user.role === "student" ? (
            <div className="mt-6 grid gap-3 text-left">
              <div className="rounded-2xl bg-cream px-4 py-3">
                <span className="eyebrow">Hobi</span>
                <b className="mt-1 block">{user.Hobby || "Belum diisi"}</b>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3">
                <span className="eyebrow">Paket bimbel</span>
                <b className="mt-1 block text-[17px]">
                  {getPackageShortName(paket) || "Belum memilih paket"}
                </b>
                {paket ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{paket}</p>
                ) : (
                  <p className="mt-1 text-[12px] text-muted">
                    Pilih paket di menu Paket, lalu tunggu persetujuan guru.
                  </p>
                )}
                {amount ? (
                  <p className="mt-2 text-sm font-bold text-rose-deep">{formatRupiah(amount)}</p>
                ) : null}
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3">
                <span className="eyebrow">Status bayar</span>
                <div className="mt-2">
                  <PaymentBadge status={status || undefined} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">{user.Hobby || "Guru kelas Ruang Belajar."}</p>
          )}

          <button type="button" className="btn btn-primary mt-6 w-full" onClick={() => setOpen(true)}>
            <Edit3 size={16} />
            Edit Profil
          </button>
        </section>
      </div>

      <Modal open={open} onClose={loading ? undefined : () => setOpen(false)} wide>
        <h2 className="font-display text-[28px] font-medium">Edit Profil</h2>
        <p className="mb-4 text-sm text-muted">Foto akan diperkecil agar tetap tampil di web.</p>
        <label className="field mb-3">
          <span>Foto profil</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPhoto(await fileToCompressedDataUrl(file));
            }}
          />
        </label>
        {photo ? (
          <img
            src={photo}
            alt=""
            className="mb-3 h-24 w-24 rounded-full object-cover"
          />
        ) : null}
        <label className="field">
          <span>Hobi / cita-cita</span>
          <input
            value={hobby}
            onChange={(e) => setHobby(e.target.value)}
            placeholder="Misal: Membaca"
          />
        </label>
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={save} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </Modal>
    </div>
  );
}
