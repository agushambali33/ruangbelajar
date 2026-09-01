import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/features/guide/guide-page";

export const Route = createFileRoute("/kelas/panduan")({
  component: GuidePage,
});
