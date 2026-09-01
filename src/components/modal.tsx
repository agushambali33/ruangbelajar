import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  wide,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div
        className={cn("modal", wide && "modal-wide")}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {onClose ? (
          <button
            type="button"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-blush text-muted"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
