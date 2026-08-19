import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingRows, PageHeader } from "@/components/app/primitives";
import { emailsQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/emails")({
  head: () => ({
    meta: [
      { title: "ایمیل‌ها | سامانه خرید صنعتی" },
      { name: "description", content: "مکاتبات ایمیلی مرتبط با پرونده‌ها." },
      { property: "og:title", content: "ایمیل‌ها" },
      { property: "og:description", content: "لیست مکاتبات ایمیلی." },
    ],
  }),
  component: EmailsPage,
});

function EmailsPage() {
  const { data, isLoading } = useQuery(emailsQuery);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="ایمیل‌ها" count={rows.length} subtitle="مکاتبات ثبت‌شده در سیستم" />
      <div className="surface overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingRows rows={6} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="ایمیلی ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["موضوع", "از", "به", "پرونده", "زمان"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{e.subject}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{e.sender}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{e.recipient}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{e.cases?.case_number ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDateTime(e.sent_at)}</td>
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
