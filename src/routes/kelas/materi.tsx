import { createFileRoute } from "@tanstack/react-router";
import { MaterialsPage } from "@/features/materials/materials-page";

export const Route = createFileRoute("/kelas/materi")({
  component: MaterialsPage,
});
