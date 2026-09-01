import type { ReactNode } from "react";

export function EmptyState({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="panel grid min-h-28 place-items-center gap-2 text-sm text-muted">
      <span className="text-rose">{icon}</span>
      {text}
    </div>
  );
}
