export type Role = "teacher" | "student";

export type PaymentStatus =
  | "Menunggu Persetujuan"
  | "Belum Lunas"
  | "Lunas"
  | "Ditolak";

export type AttendanceStatus = "Hadir" | "Sakit" | "Izin" | "Alpa";

export type Student = {
  Id: string;
  Name: string;
  PIN: string;
  Role: Role;
  Grade: string;
  Hobby: string;
  Photo: string;
  Paket: string;
  StatusBayar: PaymentStatus | "";
};

export type SessionUser = Student & { role: Role };

export type AttendanceRow = {
  Id: string;
  Name: string;
  Date: string;
  Status: AttendanceStatus;
  Note: string;
  Photo: string;
};

export type MaterialComment = {
  name: string;
  text: string;
  time: string;
};

export type Material = {
  Id: string;
  Title: string;
  Content: string;
  Date: string;
  Photo: string;
  Viewers: string[];
  Comments: MaterialComment[];
};

export type Evaluation = {
  Id: string;
  Student: string;
  Note: string;
  Date: string;
};

export type Payment = {
  Id: string;
  Student: string;
  Paket: string;
  Amount: number;
  Status: PaymentStatus;
  Date: string;
  Note: string;
};

export type Announcement = {
  Id: string;
  Title: string;
  Content: string;
  Date: string;
};

export type ClassroomData = {
  students: Student[];
  attendance: AttendanceRow[];
  materials: Material[];
  evaluations: Evaluation[];
  payments: Payment[];
  announcements: Announcement[];
};

export type EnrichedStudent = Student & {
  PackageAmount: number;
  PackageName: string;
  canSubmitPackage: boolean;
  submitBlockReason: string;
};

export type ApiResult<T = Record<string, unknown>> = {
  ok: boolean;
  error?: string;
  user?: SessionUser | Student;
} & Partial<T> &
  Partial<ClassroomData>;
