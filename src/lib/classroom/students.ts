import { getPackagePrice, getPackageShortName } from "./packages";
import type {
  EnrichedStudent,
  Payment,
  PaymentStatus,
  Student,
} from "./types";

export function getLatestPaymentForStudent(
  payments: Payment[] | undefined,
  studentName: string,
) {
  const key = String(studentName || "").trim().toLowerCase();

  const rows = (payments || []).filter(
    (p) =>
      String(p.Student || "").trim().toLowerCase() === key,
  );

  if (!rows.length) return null;

  return rows
    .map((item, index) => ({
      item,
      index,
      dateValue: item.Date || "",
    }))
    .sort((a, b) => {
      const da = new Date(a.dateValue).getTime();
      const db = new Date(b.dateValue).getTime();

      if (
        !Number.isNaN(da) &&
        !Number.isNaN(db) &&
        da !== db
      ) {
        return db - da;
      }

      return b.index - a.index;
    })[0]?.item ?? null;
}

export function canStudentSubmitPackage(
  student: Pick<Student, "Name" | "Paket" | "StatusBayar">,
  payments: Payment[],
) {
  const latest = getLatestPaymentForStudent(
    payments,
    student.Name,
  );

  const status = (
    latest?.Status ||
    student.StatusBayar ||
    ""
  ) as PaymentStatus | "";

  if (status === "Menunggu Persetujuan") {
    return {
      ok: false,
      reason:
        "Pengajuan paket masih menunggu persetujuan guru. Tunggu dulu ya, jangan kirim yang baru.",
    };
  }

  if (status === "Belum Lunas") {
    return {
      ok: false,
      reason:
        "Paket kamu masih belum lunas. Lunasi dulu atau minta guru mengatur ulang sebelum mengajukan paket baru.",
    };
  }

  return {
    ok: true,
    reason: "",
  };
}

export function enrichStudents(
  students: Student[],
  payments: Payment[],
): EnrichedStudent[] {
  return students
    .filter(
      (s) =>
        String(s.Role || "").toLowerCase() !== "teacher",
    )
    .map((student) => {
      const latest = getLatestPaymentForStudent(
        payments,
        student.Name,
      );

      const paket =
        latest?.Paket ||
        student.Paket ||
        "";

      const status = (
        latest?.Status ||
        student.StatusBayar ||
        ""
      ) as PaymentStatus | "";

      const gate = canStudentSubmitPackage(
        {
          ...student,
          Paket: paket,
          StatusBayar: status,
        },
        payments,
      );

      // Harga resmi selalu diambil dari packages.ts.
      // Amount dari Google Sheet hanya dipakai jika
      // paket tidak dikenali di daftar packages.
      const officialPrice = getPackagePrice(paket);

      const sheetAmount = Number(latest?.Amount) || 0;

      const packageAmount =
        officialPrice > 0
          ? officialPrice
          : sheetAmount;

      return {
        ...student,
        Paket: paket,
        StatusBayar: status,
        PackageAmount: packageAmount,
        PackageName: getPackageShortName(paket),
        canSubmitPackage: gate.ok,
        submitBlockReason: gate.reason,
      };
    });
}

export function findStudent(
  students: Student[],
  name: string,
) {
  const key = String(name || "")
    .trim()
    .toLowerCase();

  return students.find(
    (s) =>
      String(s.Name || "")
        .trim()
        .toLowerCase() === key,
  );
}