import { paymentStatusTone } from "@/lib/classroom/packages";
import { cn } from "@/lib/utils";

const attendanceClass: Record<string, string> = {
  Hadir: "badge-present",
  present: "badge-present",
  Sakit: "badge-sick",
  Izin: "badge-permission",
  Alpa: "badge-absent",
};

export function PaymentBadge({ status }: { status?: string }) {
  if (!status) return <em className="badge badge-no">Belum dipilih</em>;
  const tone = paymentStatusTone(status);
  return <em className={cn("badge", `badge-${tone}`)}>{status}</em>;
}

export function AttendanceBadge({ status }: { status?: string }) {
  return (
    <em className={cn("badge", attendanceClass[status || ""] || "badge-permission")}>
      {status || "—"}
    </em>
  );
}
