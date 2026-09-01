import { createFileRoute } from "@tanstack/react-router";
import { EvaluationsPage } from "@/features/evaluations/evaluations-page";

export const Route = createFileRoute("/kelas/evaluasi")({
  component: EvaluationsPage,
});
