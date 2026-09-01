import type { PaymentStatus } from "./types";

export type BimbelPackage = {
  id: string;
  name: string;
  detail: string;
  meetings: string;
  price: number;
  label: string;
};

export const PAKET_BIMBEL: BimbelPackage[] = [
  {
    id: "calistung-30",
    name: "Calistung 30 Menit",
    detail: "Membaca, menulis, berhitung",
    meetings: "8 pertemuan",
    price: 250000,
    label: "Calistung 30 Menit (8x Pertemuan) - Rp 250.000",
  },
  {
    id: "calistung-60",
    name: "Calistung 60 Menit",
    detail: "Sesi lebih panjang, lebih dalam",
    meetings: "8 pertemuan",
    price: 400000,
    label: "Calistung 60 Menit (8x Pertemuan) - Rp 400.000",
  },
  {
    id: "jarimatika-60",
    name: "Jarimatika 60 Menit",
    detail: "Berhitung cepat dengan jari",
    meetings: "8 pertemuan",
    price: 400000,
    label: "Jarimatika 60 Menit (8x Pertemuan) - Rp 400.000",
  },
];

export const STATUS_PAKET: PaymentStatus[] = [
  "Menunggu Persetujuan",
  "Belum Lunas",
  "Lunas",
  "Ditolak",
];

export function getPackageByLabel(label: string) {
  return PAKET_BIMBEL.find((p) => p.label === label || p.name === label);
}

export function getPackagePrice(label?: string) {
  if (!label) return 0;
  return getPackageByLabel(label)?.price ?? (Number(String(label).replace(/[^\d]/g, "")) || 0);
}

export function getPackageShortName(label?: string) {
  if (!label) return "";
  return getPackageByLabel(label)?.name ?? label.replace(/\s*\(.*$/, "").trim();
}

export function formatRupiah(value: string | number | undefined | null) {
  const number = Number(String(value ?? "").replace(/[^\d]/g, ""));
  if (!number) return "Rp 0";
  return "Rp " + number.toLocaleString("id-ID");
}

export function paymentStatusTone(status?: string) {
  if (status === "Lunas") return "ok";
  if (status === "Menunggu Persetujuan") return "wait";
  if (status === "Ditolak") return "no";
  return "due";
}
