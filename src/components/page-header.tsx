import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="font-display mt-1 text-[30px] font-medium leading-tight tracking-tight text-ink sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
