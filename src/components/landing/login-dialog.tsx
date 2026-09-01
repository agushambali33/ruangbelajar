import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/components/modal";
import { FlowerMark } from "@/components/brand/flower-mark";

export function LoginDialog({
  open,
  onClose,
  onLogin,
  notice,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (name: string, pin: string) => void;
  notice: string;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <div className="mb-2 grid size-11 place-items-center rounded-2xl bg-blush">
        <FlowerMark />
      </div>
      <h2 className="font-display mt-1 text-[28px] font-medium">Selamat datang</h2>
      <p className="mb-4 text-sm text-muted">Masuk ke ruang belajar kamu.</p>
      {notice ? (
        <div className="mb-3 rounded-xl bg-[#fae7e5] px-3 py-2 text-sm text-[#945e5e]">{notice}</div>
      ) : null}
      <label className="field mb-3">
        <span>Nama</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Misal: Alya atau Adelia"
          disabled={loading}
          autoComplete="username"
        />
      </label>
      <label className="field">
        <span>PIN</span>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          type="password"
          inputMode="numeric"
          maxLength={8}
          disabled={loading}
          autoComplete="current-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") onLogin(name, pin);
          }}
        />
      </label>
      <button
        type="button"
        className="btn btn-primary mt-5 w-full"
        onClick={() => onLogin(name, pin)}
        disabled={loading}
      >
        {loading ? "Memeriksa..." : <>Masuk <ChevronRight size={17} /></>}
      </button>
      <div className="mt-4 rounded-2xl bg-blush/70 px-3 py-3 text-[12px] leading-relaxed text-muted">
        <b className="text-ink">Coba dulu:</b> Guru <b>Adelia</b> PIN <b>1234</b>
        <br />
        Murid <b>Alya</b> PIN <b>1111</b> · Salsa <b>3333</b> · Raka <b>4444</b>
      </div>
      {!loading ? (
        <button type="button" className="mt-2 w-full py-3 text-sm text-[#9c7b77]" onClick={onClose}>
          Kembali
        </button>
      ) : null}
    </Modal>
  );
}
