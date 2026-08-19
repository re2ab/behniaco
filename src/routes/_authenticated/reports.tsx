import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { EmptyState, LoadingRows, PageHeader, SectionCard } from "@/components/app/primitives";
import { casesQuery, invoicesQuery } from "@/lib/queries";
import { CASE_STATUS, formatMoney } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "گزارشات | سامانه خرید صنعتی" },
      { name: "description", content: "گزارش‌های عملکردی خرید و فروش." },
      { property: "og:title", content: "گزارشات" },
      { property: "og:description", content: "نمودارها و شاخص‌های کلیدی." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: cases, isLoading: cLoading } = useQuery(casesQuery);
  const { data: invoices, isLoading: iLoading } = useQuery(invoicesQuery);
  const rows = cases ?? [];

  const statusData = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, count]) => ({ name: CASE_STATUS[status as keyof typeof CASE_STATUS].label, count }));

  const totalWon = rows.filter((c) => c.status === "won").reduce((s, c) => s + Number(c.value), 0);
  const totalInvoiced = (invoices ?? []).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <>
      <PageHeader title="گزارشات" subtitle="نگاه تحلیلی به پرونده‌ها و درآمد" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard title="کل پرونده‌ها" className="py-4">
          <p className="text-2xl font-bold">{rows.length}</p>
        </SectionCard>
        <SectionCard title="ارزش برنده‌شده" className="py-4">
          <p className="text-2xl font-bold">{formatMoney(totalWon, "")}</p>
        </SectionCard>
        <SectionCard title="کل فاکتورها" className="py-4">
          <p className="text-2xl font-bold">{formatMoney(totalInvoiced, "")}</p>
        </SectionCard>
        <SectionCard title="میانگین ارزش پرونده" className="py-4">
          <p className="text-2xl font-bold">
            {formatMoney(rows.length ? rows.reduce((s, c) => s + Number(c.value), 0) / rows.length : 0, "")}
          </p>
        </SectionCard>
      </div>

      <SectionCard title="پرونده‌ها بر اساس وضعیت" className="mt-4">
        {cLoading || iLoading ? (
          <LoadingRows rows={6} />
        ) : statusData.length === 0 ? (
          <EmptyState title="داده‌ای برای گزارش‌گیری وجود ندارد" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <RTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>
    </>
  );
}
