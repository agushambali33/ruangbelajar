import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/features/students/students-page";

export const Route = createFileRoute("/kelas/murid")({
  component: StudentsPage,
});
