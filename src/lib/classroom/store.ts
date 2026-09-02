import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayIso, uid } from "@/lib/utils";
import { postAction, normalizeClassroom } from "./api";
import { getPackageByLabel, getPackagePrice } from "./packages";
import { SEED, TEACHER_ALIASES } from "./seed";
import { canStudentSubmitPackage, findStudent } from "./students";
import type {
  Announcement,
  AttendanceRow,
  AttendanceStatus,
  ClassroomData,
  Evaluation,
  Material,
  Payment,
  PaymentStatus,
  SessionUser,
  Student,
} from "./types";

/* URL Google Apps Script permanen */
const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbwpbvb2_3TYho1URCZarqRzGsto0JcyZmwpbUezE1BsHzB__pIEJ7LnAIzCI-6UDgiN/exec";

const emptyData = (): ClassroomData => ({
  students: [],
  attendance: [],
  materials: [],
  evaluations: [],
  payments: [],
  announcements: [],
});

type ClassroomState = ClassroomData & {
  user: SessionUser | null;
  apiUrl: string;
  hydrated: boolean;
  setHydrated: () => void;
  setApiUrl: (url: string) => void;
  login: (
    name: string,
    pin: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  reload: () => Promise<void>;
  updateProfile: (input: {
    hobby: string;
    photo: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  submitAttendance: (input: {
    status: AttendanceStatus;
    note: string;
    photo: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  addMaterial: (input: {
    title: string;
    content: string;
    photo: string;
  }) => Promise<{ ok: boolean }>;
  markRead: (materialId: string) => Promise<void>;
  addComment: (materialId: string, text: string) => Promise<void>;
  addEvaluation: (input: {
    student: string;
    note: string;
  }) => Promise<{ ok: boolean }>;
  addAnnouncement: (input: {
    title: string;
    content: string;
  }) => Promise<{ ok: boolean }>;
  requestPackage: (
    label: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  reviewPayment: (
    paymentId: string,
    status: PaymentStatus,
  ) => Promise<{ ok: boolean; error?: string }>;
  setStudentPackage: (input: {
    student: string;
    paket: string;
    status: PaymentStatus;
  }) => Promise<{ ok: boolean; error?: string }>;
  addStudent: (input: {
    name: string;
    pin: string;
    grade: string;
  }) => Promise<{ ok: boolean; error?: string }>;
};

function asSession(user: Student): SessionUser {
  const name = String(user.Name || "").toLowerCase();
  const roleRaw = String(user.Role || "").toLowerCase();

  const isTeacher =
    TEACHER_ALIASES.includes(name) ||
    roleRaw.includes("teach") ||
    roleRaw.includes("admin");

  return {
    ...user,
    Role: isTeacher ? "teacher" : "student",
    role: isTeacher ? "teacher" : "student",
  };
}

function applyData(data: ClassroomData) {
  return {
    students: data.students,
    attendance: data.attendance,
    materials: data.materials,
    evaluations: data.evaluations,
    payments: data.payments,
    announcements: data.announcements,
  };
}

function syncStudentPackage(
  students: Student[],
  name: string,
  paket: string,
  status: PaymentStatus | "",
) {
  return students.map((s) =>
    s.Name.toLowerCase() === name.toLowerCase()
      ? { ...s, Paket: paket, StatusBayar: status }
      : s,
  );
}

export const useClassroom = create<ClassroomState>()(
  persist(
    (set, get) => ({
      ...SEED,

      user: null,

      /* Google Apps Script selalu aktif dari awal */
      apiUrl: DEFAULT_API_URL,

      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      /* URL tidak lagi bergantung pada input/browser */
      setApiUrl: () => set({ apiUrl: DEFAULT_API_URL }),

      login: async (name, pin) => {
        const { apiUrl, students } = get();

        if (apiUrl) {
          const result = await postAction(apiUrl, "login", {
            name,
            pin,
          });

          if (!result.ok || !result.user) {
            return {
              ok: false,
              error: result.error || "Nama atau PIN salah.",
            };
          }

          const session = asSession(result.user as Student);

          set({ user: session });

          await get().reload();

          const fresh = get().students.find(
            (s) =>
              s.Name.toLowerCase() ===
              session.Name.toLowerCase(),
          );

          if (fresh) {
            set({
              user: asSession({
                ...session,
                ...fresh,
              }),
            });
          }

          return { ok: true };
        }

        const all = students.length
          ? students
          : SEED.students;

        const found = all.find((x) => {
          const pinOk =
            String(x.PIN) === String(pin);

          if (!pinOk) return false;

          if (!name.trim()) return true;

          return (
            x.Name.toLowerCase() ===
            name.trim().toLowerCase()
          );
        });

        if (!found) {
          return {
            ok: false,
            error: "Nama atau PIN salah.",
          };
        }

        set({
          user: asSession(found),
        });

        return { ok: true };
      },

      logout: () => set({ user: null }),

      reload: async () => {
        const { apiUrl, user } = get();

        if (!apiUrl) return;

        const result = await postAction(
          apiUrl,
          "data",
        );

        if (!result.ok) return;

        const data = normalizeClassroom(result);

        set(applyData(data));

        if (user) {
          const fresh = data.students.find(
            (s) =>
              s.Name.toLowerCase() ===
              user.Name.toLowerCase(),
          );

          if (fresh) {
            set({
              user: asSession({
                ...user,
                ...fresh,
              }),
            });
          }
        }
      },

      updateProfile: async ({
        hobby,
        photo,
      }) => {
        const {
          user,
          apiUrl,
          students,
        } = get();

        if (!user) {
          return {
            ok: false,
            error: "Belum masuk.",
          };
        }

        if (apiUrl) {
          const result = await postAction(
            apiUrl,
            "updateProfile",
            {
              name: user.Name,
              hobby,
              photo,
            },
          );

          if (!result.ok) {
            return {
              ok: false,
              error: result.error,
            };
          }

          const next = {
            ...user,
            Hobby: hobby,
            Photo:
              (result.photo as string) ||
              photo,
          };

          set({
            user: next,
            students: students.map((s) =>
              s.Name === user.Name
                ? {
                    ...s,
                    Hobby: hobby,
                    Photo: next.Photo,
                  }
                : s,
            ),
          });

          await get().reload();

          return { ok: true };
        }

        const next = {
          ...user,
          Hobby: hobby,
          Photo: photo,
        };

        set({
          user: next,
          students: students.map((s) =>
            s.Name === user.Name
              ? {
                  ...s,
                  Hobby: hobby,
                  Photo: photo,
                }
              : s,
          ),
        });

        return { ok: true };
      },

      submitAttendance: async ({
        status,
        note,
        photo,
      }) => {
        const {
          user,
          apiUrl,
          attendance,
        } = get();

        if (!user) {
          return {
            ok: false,
            error: "Belum masuk.",
          };
        }

        const row: AttendanceRow = {
          Id: uid("att"),
          Name: user.Name,
          Date: todayIso(),
          Status: status,
          Note: note,
          Photo: photo,
        };

        if (apiUrl) {
          const result = await postAction(
            apiUrl,
            "attendance",
            {
              name: user.Name,
              status,
              note,
              photo,
              date: row.Date,
            },
          );

          if (!result.ok) {
            return {
              ok: false,
              error: result.error,
            };
          }

          await get().reload();

          return { ok: true };
        }

        set({
          attendance: [
            row,
            ...attendance,
          ],
        });

        return { ok: true };
      },

      addMaterial: async ({
        title,
        content,
        photo,
      }) => {
        const {
          apiUrl,
          materials,
        } = get();

        const row: Material = {
          Id: uid("m"),
          Title: title,
          Content: content,
          Date: todayIso(),
          Photo: photo,
          Viewers: [],
          Comments: [],
        };

        if (apiUrl) {
          const result = await postAction(
            apiUrl,
            "material",
            row,
          );

          if (!result.ok) {
            return { ok: false };
          }

          await get().reload();

          return { ok: true };
        }

        set({
          materials: [
            row,
            ...materials,
          ],
        });

        return { ok: true };
      },

      markRead: async (
        materialId,
      ) => {
        const {
          user,
          apiUrl,
          materials,
        } = get();

        if (!user) return;

        if (apiUrl) {
          await postAction(
            apiUrl,
            "markRead",
            {
              id: materialId,
              name: user.Name,
            },
          );

          await get().reload();

          return;
        }

        set({
          materials: materials.map((m) =>
            m.Id === materialId &&
            !m.Viewers.includes(
              user.Name,
            )
              ? {
                  ...m,
                  Viewers: [
                    ...m.Viewers,
                    user.Name,
                  ],
                }
              : m,
          ),
        });
      },

      addComment: async (
        materialId,
        text,
      ) => {
        const {
          user,
          apiUrl,
          materials,
        } = get();

        if (
          !user ||
          !text.trim()
        ) {
          return;
        }

        const comment = {
          name: user.Name,
          text: text.trim(),
          time: "Baru saja",
        };

        if (apiUrl) {
          await postAction(
            apiUrl,
            "comment",
            {
              id: materialId,
              name: user.Name,
              text: comment.text,
            },
          );

          await get().reload();

          return;
        }

        set({
          materials: materials.map((m) =>
            m.Id === materialId
              ? {
                  ...m,
                  Comments: [
                    ...m.Comments,
                    comment,
                  ],
                }
              : m,
          ),
        });
      },

      addEvaluation: async ({
        student,
        note,
      }) => {
        const {
          apiUrl,
          evaluations,
        } = get();

        const row: Evaluation = {
          Id: uid("ev"),
          Student: student,
          Note: note,
          Date: todayIso(),
        };

        if (apiUrl) {
          const result = await postAction(
            apiUrl,
            "evaluation",
            row,
          );

          if (!result.ok) {
            return { ok: false };
          }

          await get().reload();

          return { ok: true };
        }

        set({
          evaluations: [
            row,
            ...evaluations,
          ],
        });

        return { ok: true };
      },

      addAnnouncement: async ({
        title,
        content,
      }) => {
        const {
          apiUrl,
          announcements,
        } = get();

        const row: Announcement = {
          Id: uid("n"),
          Title: title,
          Content: content,
          Date: todayIso(),
        };

        if (apiUrl) {
          const result = await postAction(
            apiUrl,
            "announcement",
            row,
          );

          if (!result.ok) {
            return { ok: false };
          }

          await get().reload();

          return { ok: true };
        }

        set({
          announcements: [
            row,
            ...announcements,
          ],
        });

        return { ok: true };
      },

      requestPackage: async (
        label,
      ) => {
        const {
          user,
          apiUrl,
          payments,
          students,
        } = get();

        if (!user) {
          return {
            ok: false,
            error: "Belum masuk.",
          };
        }

        const selected =
          getPackageByLabel(label);

        if (!selected) {
          return {
            ok: false,
            error:
              "Paket tidak ditemukan.",
          };
        }

        const gate =
          canStudentSubmitPackage(
            user,
            payments,
          );

        if (!gate.ok) {
          return {
            ok: false,
            error: gate.reason,
          };
        }

        if (apiUrl) {
          const result = await postAction(
            apiUrl,
            "payment",
            {
              Student: user.Name,
              Paket: selected.label,
              Amount: selected.price,
              Status:
                "Menunggu Persetujuan",
              Date: todayIso(),
              Note: "Pengajuan murid",
            },
          );

          if (!result.ok) {
            return {
              ok: false,
              error: result.error,
            };
          }

          await get().reload();

          return { ok: true };
        }

        const row: Payment = {
          Id: uid("pay"),
          Student: user.Name,
          Paket: selected.label,
          Amount: selected.price,
          Status:
            "Menunggu Persetujuan",
          Date: todayIso(),
          Note: "Pengajuan murid",
        };

        set({
          payments: [
            ...payments,
            row,
          ],

          students:
            syncStudentPackage(
              students,
              user.Name,
              selected.label,
              "Menunggu Persetujuan",
            ),

          user: {
            ...user,
            Paket: selected.label,
            StatusBayar:
              "Menunggu Persetujuan",
          },
        });

        return { ok: true };
      },

      reviewPayment: async (
        paymentId,
        status,
      ) => {
        const {
          apiUrl,
          payments,
          students,
        } = get();

        const current =
          payments.find(
            (p) =>
              p.Id === paymentId,
          );

        if (!current) {
          return {
            ok: false,
            error:
              "Pengajuan tidak ditemukan.",
          };
        }

        if (apiUrl) {
          const result =
            await postAction(
              apiUrl,
              "updatePayment",
              {
                Id: paymentId,
                Status: status,
              },
            );

          if (!result.ok) {
            return {
              ok: false,
              error: result.error,
            };
          }

          await get().reload();

          return { ok: true };
        }

        set({
          payments: payments.map(
            (p) =>
              p.Id === paymentId
                ? {
                    ...p,
                    Status: status,
                  }
                : p,
          ),

          students:
            syncStudentPackage(
              students,
              current.Student,
              current.Paket,
              status,
            ),
        });

        return { ok: true };
      },

      setStudentPackage: async ({
        student,
        paket,
        status,
      }) => {
        const {
          apiUrl,
          payments,
          students,
        } = get();

        const pack =
          getPackageByLabel(
            paket,
          );

        const amount =
          pack?.price ||
          getPackagePrice(paket);

        if (!student) {
          return {
            ok: false,
            error: "Pilih siswa.",
          };
        }

        if (!paket) {
          return {
            ok: false,
            error: "Pilih paket.",
          };
        }

        if (apiUrl) {
          const result =
            await postAction(
              apiUrl,
              "payment",
              {
                Student: student,
                Paket: paket,
                Amount: amount,
                Status: status,
                Date: todayIso(),
                Note: "Diatur guru",
              },
            );

          if (!result.ok) {
            return {
              ok: false,
              error: result.error,
            };
          }

          await get().reload();

          return { ok: true };
        }

        const row: Payment = {
          Id: uid("pay"),
          Student: student,
          Paket: paket,
          Amount: amount,
          Status: status,
          Date: todayIso(),
          Note: "Diatur guru",
        };

        set({
          payments: [
            ...payments,
            row,
          ],

          students:
            syncStudentPackage(
              students,
              student,
              paket,
              status,
            ),
        });

        return { ok: true };
      },

      addStudent: async ({
        name,
        pin,
        grade,
      }) => {
        const {
          apiUrl,
          students,
        } = get();

        if (
          !name.trim() ||
          !pin.trim()
        ) {
          return {
            ok: false,
            error:
              "Nama dan PIN wajib diisi.",
          };
        }

        if (
          findStudent(
            students,
            name,
          )
        ) {
          return {
            ok: false,
            error:
              "Nama murid sudah ada.",
          };
        }

        const row: Student = {
          Id: uid("s"),
          Name: name.trim(),
          PIN: pin.trim(),
          Role: "student",
          Grade: grade.trim(),
          Hobby: "",
          Photo: "",
          Paket: "",
          StatusBayar: "",
        };

        if (apiUrl) {
          const result =
            await postAction(
              apiUrl,
              "addStudent",
              row,
            );

          if (!result.ok) {
            return {
              ok: false,
              error: result.error,
            };
          }

          await get().reload();

          return { ok: true };
        }

        set({
          students: [
            ...students,
            row,
          ],
        });

        return { ok: true };
      },
    }),

    {
      name: "ruang-belajar-v2",

      partialize: (state) => ({
        user: state.user,
        students: state.students,
        attendance: state.attendance,
        materials: state.materials,
        evaluations: state.evaluations,
        payments: state.payments,
        announcements: state.announcements,
      }),

      /*
       * Paksa API URL tetap menggunakan
       * Google Apps Script bawaan.
       *
       * Jadi localStorage/browser tidak bisa
       * mengganti URL backend.
       */
      merge: (
        persistedState,
        currentState,
      ) => ({
        ...currentState,
        ...persistedState,
        apiUrl: DEFAULT_API_URL,
      }),

      onRehydrateStorage:
        () => (state) => {
          state?.setHydrated();
        },
    },
  ),
);

export function useIsTeacher() {
  return useClassroom(
    (s) => s.user?.role === "teacher",
  );
}

export { emptyData };