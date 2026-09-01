import type { ApiResult, ClassroomData, Material, MaterialComment } from "./types";

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function normalizeClassroom(raw: Partial<ClassroomData> | ApiResult): ClassroomData {
  return {
    students: (raw.students || []).map((s) => ({
      Id: String(s.Id || s.Name || ""),
      Name: String(s.Name || ""),
      PIN: String(s.PIN || ""),
      Role: String(s.Role || "student").toLowerCase().includes("teach")
        ? "teacher"
        : "student",
      Grade: String(s.Grade || ""),
      Hobby: String(s.Hobby || ""),
      Photo: String(s.Photo || ""),
      Paket: String(s.Paket || ""),
      StatusBayar: (s.StatusBayar as ClassroomData["students"][number]["StatusBayar"]) || "",
    })),
    attendance: (raw.attendance || []).map((a, i) => ({
      Id: String(a.Id || `att_${i}`),
      Name: String(a.Name || ""),
      Date: String(a.Date || "").slice(0, 10),
      Status: (a.Status as "Hadir") || "Hadir",
      Note: String(a.Note || ""),
      Photo: String(a.Photo || ""),
    })),
    materials: (raw.materials || []).map((m, i) => ({
      Id: String(m.Id || `m_${i}`),
      Title: String(m.Title || ""),
      Content: String(m.Content || ""),
      Date: String(m.Date || "").slice(0, 10),
      Photo: String(m.Photo || ""),
      Viewers: parseJsonField<string[]>(m.Viewers, []),
      Comments: parseJsonField<MaterialComment[]>(m.Comments, []),
    })) as Material[],
    evaluations: (raw.evaluations || []).map((e, i) => ({
      Id: String(e.Id || `ev_${i}`),
      Student: String(e.Student || ""),
      Note: String(e.Note || ""),
      Date: String(e.Date || "").slice(0, 10),
    })),
    payments: (raw.payments || []).map((p, i) => ({
      Id: String(p.Id || `pay_${i}`),
      Student: String(p.Student || ""),
      Paket: String(p.Paket || ""),
      Amount: Number(p.Amount) || 0,
      Status: p.Status || "Belum Lunas",
      Date: String(p.Date || "").slice(0, 10),
      Note: String(p.Note || ""),
    })),
    announcements: (raw.announcements || []).map((n, i) => ({
      Id: String(n.Id || `n_${i}`),
      Title: String(n.Title || ""),
      Content: String(n.Content || ""),
      Date: String(n.Date || "").slice(0, 10),
    })),
  };
}

export async function postAction(
  apiUrl: string,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<ApiResult> {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    });
    const text = await response.text();
    try {
      return JSON.parse(text) as ApiResult;
    } catch {
      return { ok: false, error: "Gagal membaca data dari server." };
    }
  } catch {
    return { ok: false, error: "Koneksi ke Google Apps Script terputus." };
  }
}
