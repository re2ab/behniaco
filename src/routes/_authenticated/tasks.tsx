import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingRows, PageHeader, StatusBadge } from "@/components/app/primitives";
import { tasksQuery } from "@/lib/queries";
import { TASK_STATUS, formatDate } from "@/lib/domain";
import type { TaskStatus } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "وظایف | سامانه خرید صنعتی" },
      { name: "description", content: "مدیریت وظایف و کارهای مرتبط با پرونده‌ها." },
      { property: "og:title", content: "وظایف سامانه خرید" },
      { property: "og:description", content: "لیست وظایف و پیگیری کارها." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { data, isLoading } = useQuery(tasksQuery);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="وظایف" count={rows.length} subtitle="وظایف مرتبط با پرونده‌های خرید" />
      <div className="surface overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingRows rows={6} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="وظیفه‌ای ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["عنوان", "پرونده", "مسئول", "مهلت", "وضعیت"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{t.title}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{t.cases?.case_number ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{t.assignee_name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(t.due_date)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={TASK_STATUS[t.status as TaskStatus].label}
                        tone={TASK_STATUS[t.status as TaskStatus].tone}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
