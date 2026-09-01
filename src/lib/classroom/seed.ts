import type { ClassroomData } from "./types";
import { PAKET_BIMBEL } from "./packages";

const CAL30 = PAKET_BIMBEL[0]!;
const CAL60 = PAKET_BIMBEL[1]!;
const JARI = PAKET_BIMBEL[2]!;

export const TEACHER_ALIASES = ["adelia", "guru", "bu adelia"];

export const SEED: ClassroomData = {
  students: [
    {
      Id: "teacher",
      Name: "Adelia",
      PIN: "1234",
      Role: "teacher",
      Grade: "",
      Hobby: "Mengajar dengan hati",
      Photo: "",
      Paket: "",
      StatusBayar: "",
    },
    {
      Id: "s_alya",
      Name: "Alya",
      PIN: "1111",
      Role: "student",
      Grade: "4 SD",
      Hobby: "Membaca buku",
      Photo: "",
      Paket: CAL30.label,
      StatusBayar: "Lunas",
    },
    {
      Id: "s_bima",
      Name: "Bima",
      PIN: "2222",
      Role: "student",
      Grade: "3 SD",
      Hobby: "Menggambar",
      Photo: "",
      Paket: "",
      StatusBayar: "",
    },
    {
      Id: "s_salsa",
      Name: "Salsa",
      PIN: "3333",
      Role: "student",
      Grade: "2 SD",
      Hobby: "Bernyanyi",
      Photo: "",
      Paket: CAL60.label,
      StatusBayar: "Menunggu Persetujuan",
    },
    {
      Id: "s_raka",
      Name: "Raka",
      PIN: "4444",
      Role: "student",
      Grade: "5 SD",
      Hobby: "Sepak bola",
      Photo: "",
      Paket: JARI.label,
      StatusBayar: "Belum Lunas",
    },
  ],
  attendance: [
    {
      Id: "a1",
      Name: "Alya",
      Date: "2026-08-28",
      Status: "Hadir",
      Note: "Siap belajar calistung.",
      Photo: "",
    },
    {
      Id: "a2",
      Name: "Raka",
      Date: "2026-08-28",
      Status: "Hadir",
      Note: "",
      Photo: "",
    },
    {
      Id: "a3",
      Name: "Salsa",
      Date: "2026-08-29",
      Status: "Izin",
      Note: "Ada acara keluarga.",
      Photo: "",
    },
  ],
  materials: [
    {
      Id: "m1",
      Title: "Huruf A sampai E",
      Content:
        "Hari ini kita menelusuri huruf A, B, C, D, dan E. Coba tulis masing-masing huruf tiga kali, lalu bunyikan suaranya pelan-pelan. Tidak perlu cepat — yang penting rapi.",
      Date: "2026-08-30",
      Photo: "",
      Viewers: ["Alya"],
      Comments: [
        { name: "Alya", text: "Sudah dicoba di rumah, Bu.", time: "2026-08-30" },
      ],
    },
  ],
  evaluations: [
    {
      Id: "e1",
      Student: "Alya",
      Note: "Alya sudah lebih berani membaca nyaring. Pertahankan kebiasaan membacanya 10 menit setiap sore.",
      Date: "2026-08-30",
    },
  ],
  payments: [
    {
      Id: "pay_alya",
      Student: "Alya",
      Paket: CAL30.label,
      Amount: CAL30.price,
      Status: "Lunas",
      Date: "2026-08-20",
      Note: "Paket aktif",
    },
    {
      Id: "pay_salsa",
      Student: "Salsa",
      Paket: CAL60.label,
      Amount: CAL60.price,
      Status: "Menunggu Persetujuan",
      Date: "2026-09-01",
      Note: "Pengajuan murid",
    },
    {
      Id: "pay_raka",
      Student: "Raka",
      Paket: JARI.label,
      Amount: JARI.price,
      Status: "Belum Lunas",
      Date: "2026-08-22",
      Note: "Disetujui guru",
    },
  ],
  announcements: [
    {
      Id: "n1",
      Title: "Selamat datang",
      Content: "Jangan lupa isi absensi sebelum belajar, ya. Kita tumbuh pelan-pelan bersama.",
      Date: "2026-08-31",
    },
  ],
};

export const APP_NAME = "Ruang Belajar";
export const APP_TAGLINE = "Belajar dengan hati";
