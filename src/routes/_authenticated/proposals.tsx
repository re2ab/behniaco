import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingRows, PageHeader, StatusBadge } from "@/components/app/primitives";
import { proposalsQuery } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/proposals")({
  head: () => ({
    meta: [
      { title: "پیشنهادها | سامانه خرید صنعتی" },
      { name: "description", content: "پیشنهادهای فنی و مالی ارسال‌شده." },
      { property: "og:title", content: "پیشنهادها" },
      { property: "og:description", content: "لیست پیشنهادهای فنی و مالی." },
    ],
  }),
  component: ProposalsPage,
});

function ProposalsPage() {
  const { data, isLoading } = useQuery(proposalsQuery);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="پیشنهادها" count={rows.length} subtitle="پیشنهادهای فنی و مالی" />
      <div className="surface overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingRows rows={6} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="پیشنهادی ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["شماره", "نوع", "مشتری", "مبلغ", "وضعیت", "تاریخ"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{p.proposal_number}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {p.kind === "financial" ? "مالی" : "فنی"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.cases?.organizations?.name ?? "—"}</td>
                    <td className="px-3 py-2.5">{formatMoney(Number(p.total), p.currency)}</td>
                    <td className="px-3 py-2.5"><StatusBadge label={p.status} tone="info" /></td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(p.created_at)}</td>
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
