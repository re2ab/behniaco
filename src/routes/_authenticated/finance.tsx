import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingRows, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/app/primitives";
import { deliveriesQuery, invoicesQuery } from "@/lib/queries";
import { INVOICE_STATUS, formatDate, formatMoney } from "@/lib/domain";
import type { InvoiceStatus } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "مالی | سامانه خرید صنعتی" },
      { name: "description", content: "فاکتورها، مطالبات و محموله‌ها." },
      { property: "og:title", content: "مالی" },
      { property: "og:description", content: "وضعیت مالی و فاکتورها." },
    ],
  }),
  component: FinancePage,
});

function FinancePage() {
  const { data: invoices, isLoading: iLoading } = useQuery(invoicesQuery);
  const { data: deliveries, isLoading: dLoading } = useQuery(deliveriesQuery);
  const rows = invoices ?? [];
  const total = rows.reduce((s, i) => s + Number(i.amount), 0);
  const paid = rows.reduce((s, i) => s + Number(i.paid_amount), 0);
  const open = total - paid;

  return (
    <>
      <PageHeader title="مالی" subtitle="فاکتورها، مطالبات و تحویل کالا" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="کل فاکتورها" value={formatMoney(total, "")} tone="accent" />
        <StatCard label="دریافت‌شده" value={formatMoney(paid, "")} tone="success" />
        <StatCard label="مطالبات باز" value={formatMoney(open, "")} tone="warning" />
        <StatCard label="محموله‌ها" value={String((deliveries ?? []).length)} tone="info" />
      </div>

      <SectionCard title="فاکتورها">
        {iLoading ? (
          <LoadingRows rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState title="فاکتوری ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["شماره", "مشتری", "مبلغ", "دریافت‌شده", "مانده", "وضعیت", "سررسید"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{i.invoice_number}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{i.cases?.organizations?.name ?? "—"}</td>
                    <td className="px-3 py-2.5">{formatMoney(Number(i.amount), i.currency)}</td>
                    <td className="px-3 py-2.5">{formatMoney(Number(i.paid_amount), i.currency)}</td>
                    <td className="px-3 py-2.5">{formatMoney(Number(i.amount) - Number(i.paid_amount), i.currency)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={INVOICE_STATUS[i.status as InvoiceStatus].label}
                        tone={INVOICE_STATUS[i.status as InvoiceStatus].tone}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(i.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
