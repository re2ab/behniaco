import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingRows, PageHeader } from "@/components/app/primitives";
import { documentsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "اسناد | سامانه خرید صنعتی" },
      { name: "description", content: "مدیریت اسناد و فایل‌های پرونده‌ها." },
      { property: "og:title", content: "اسناد" },
      { property: "og:description", content: "لیست اسناد بارگذاری‌شده." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data, isLoading } = useQuery(documentsQuery);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="اسناد" count={rows.length} subtitle="فایل‌ها و مستندات پرونده‌ها" />
      <div className="surface overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingRows rows={6} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="سندی بارگذاری نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["نام", "نوع", "پرونده", "حجم (KB)", "تاریخ"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{d.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{d.doc_type ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{d.cases?.case_number ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{Math.round(Number(d.size_kb ?? 0))}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(d.created_at)}</td>
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
