import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/app/primitives";
import { activitiesQuery, casesQuery, invoicesQuery, tasksQuery } from "@/lib/queries";
import { ACTIVITY_LABEL, CASE_STATUS, formatMoney, timeAgo } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "داشبورد مدیریتی | سامانه خرید صنعتی" },
      {
        name: "description",
        content: "نمای کلی پرونده‌ها، عملکرد فروش، مطالبات و وظایف سررسیدشده.",
      },
      { property: "og:title", content: "داشبورد مدیریتی | سامانه خرید صنعتی" },
      { property: "og:description", content: "شاخص‌های کلیدی خرید صنعتی در یک نگاه." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function DashboardPage() {
  const cases = useQuery(casesQuery);
  const tasks = useQuery(tasksQuery);
  const invoices = useQuery(invoicesQuery);
  const activities = useQuery(activitiesQuery);

  const rows = cases.data ?? [];
  const open = rows.filter(
    (c) => !["won", "lost", "closed"].includes(c.status as string),
  ).length;
  const won = rows.filter((c) => c.status === "won").length;
  const lost = rows.filter((c) => c.status === "lost").length;
  const receivable = (invoices.data ?? []).reduce(
    (sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)),
    0,
  );
  const overdue = (invoices.data ?? [])
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)), 0);
  const dueTasks = (tasks.data ?? []).filter(
    (t) => t.status !== "done" && t.due_date && new Date(t.due_date) <= new Date(),
  ).length;

  const byStatus = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, count]) => ({
    name: CASE_STATUS[status as keyof typeof CASE_STATUS].label,
    count,
  }));

  const byOwner = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => {
      const key = c.responsible_name ?? "بدون مسئول";
      acc[key] = (acc[key] ?? 0) + Number(c.value);
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageHeader
        title="داشبورد"
        subtitle="نمای کلی عملکرد خرید، پایپ‌لاین و مطالبات"
        actions={
          <Button asChild>
            <Link to="/cases">
              <Plus className="size-4" /> پرونده‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="کل پرونده‌ها" value={String(rows.length)} tone="accent" />
        <StatCard label="پرونده‌های باز" value={String(open)} tone="info" />
        <StatCard label="برنده شده" value={String(won)} tone="success" />
        <StatCard label="بازنده شده" value={String(lost)} tone="danger" />
        <StatCard label="مطالبات باز" value={formatMoney(receivable, "")} tone="warning" />
        <StatCard label="مطالبات معوق" value={formatMoney(overdue, "")} tone="danger" />
        <StatCard
          label="ارزش پایپ‌لاین"
          value={formatMoney(
            rows
              .filter((c) => !["lost", "closed"].includes(c.status as string))
              .reduce((s, c) => s + Number(c.value), 0),
            "",
          )}
          tone="accent"
        />
        <StatCard label="وظایف سررسیدشده" value={String(dueTasks)} tone="warning" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="پرونده‌ها بر اساس وضعیت" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <RTooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="ارزش پرونده‌ها بر اساس مسئول">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byOwner} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {byOwner.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {byOwner.map((o, i) => (
              <li key={o.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {o.name}
                </span>
                <span className="tabular text-muted-foreground">{formatMoney(o.value, "")}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="آخرین فعالیت‌ها" description="جریان رویدادهای سیستم">
          {activities.isLoading ? (
            <LoadingRows />
          ) : (activities.data ?? []).length === 0 ? (
            <EmptyState title="فعالیتی ثبت نشده است" />
          ) : (
            <ol className="space-y-3">
              {(activities.data ?? []).slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{a.content}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ACTIVITY_LABEL[a.type] ?? a.type} · {a.actor_name} ·{" "}
                      {timeAgo(a.created_at)}
                      {a.cases?.case_number ? ` · ${a.cases.case_number}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>

        <SectionCard title="پرونده‌های اخیر" description="بر اساس آخرین فعالیت">
          {cases.isLoading ? (
            <LoadingRows />
          ) : (
            <ul className="divide-y">
              {rows.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link
                    to="/cases/$caseId"
                    params={{ caseId: c.id }}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="tabular truncate text-xs text-muted-foreground">
                        {c.case_number} · {c.organizations?.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tabular hidden text-xs text-muted-foreground sm:inline">
                        {formatMoney(Number(c.value), c.currency)}
                      </span>
                      <StatusBadge
                        label={CASE_STATUS[c.status].label}
                        tone={CASE_STATUS[c.status].tone}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
