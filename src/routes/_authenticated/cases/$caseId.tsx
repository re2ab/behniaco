import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  KeyValue,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/app/primitives";
import { caseDetailQuery } from "@/lib/queries";
import {
  ACTIVITY_LABEL,
  CASE_STATUS,
  INVOICE_STATUS,
  PRIORITY,
  TASK_STATUS,
  formatDate,
  formatDateTime,
  formatMoney,
  timeAgo,
} from "@/lib/domain";
import type { CaseStatus, InvoiceStatus, Priority, TaskStatus } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  head: () => ({
    meta: [
      { title: "جزئیات پرونده | سامانه خرید صنعتی" },
      { name: "description", content: "تاریخچه، اسناد، پیشنهادها، فاکتورها و وظایف پرونده خرید." },
      { property: "og:title", content: "جزئیات پرونده خرید" },
      { property: "og:description", content: "تمام اطلاعات یک پرونده خرید در یک صفحه." },
    ],
  }),
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { caseId } = Route.useParams();
  const { data, isLoading } = useQuery(caseDetailQuery(caseId));

  if (isLoading) return <LoadingRows rows={8} />;
  const c = data?.case;
  if (!c) return <EmptyState title="پرونده یافت نشد" description="ممکن است حذف شده باشد." />;

  return (
    <>
      <PageHeader
        title={c.title}
        subtitle={`${c.case_number} · ${c.organizations?.name ?? "—"}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/cases">
              <ArrowRight className="size-4" /> بازگشت
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="اطلاعات پرونده" className="lg:col-span-1">
          <div className="space-y-1">
            <KeyValue
              label="وضعیت"
              value={
                <StatusBadge
                  label={CASE_STATUS[c.status as CaseStatus].label}
                  tone={CASE_STATUS[c.status as CaseStatus].tone}
                />
              }
            />
            <KeyValue
              label="اولویت"
              value={
                <StatusBadge
                  label={PRIORITY[c.priority as Priority].label}
                  tone={PRIORITY[c.priority as Priority].tone}
                />
              }
            />
            <KeyValue label="ارزش" value={formatMoney(Number(c.value), c.currency)} />
            <KeyValue label="مسئول" value={c.responsible_name ?? "—"} />
            <KeyValue label="مخاطب" value={c.contacts?.full_name ?? "—"} />
            <KeyValue label="ایمیل مخاطب" value={c.contacts?.email ?? "—"} />
            <KeyValue label="مهلت" value={formatDate(c.due_date)} />
            <KeyValue label="ایجاد" value={formatDate(c.created_at)} />
            <KeyValue label="آخرین فعالیت" value={timeAgo(c.last_activity_at)} />
          </div>
          {c.description && (
            <p className="mt-3 border-t pt-3 text-sm leading-6 text-muted-foreground">
              {c.description}
            </p>
          )}
        </SectionCard>

        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList className="flex-wrap">
              <TabsTrigger value="timeline">تاریخچه</TabsTrigger>
              <TabsTrigger value="tasks">وظایف</TabsTrigger>
              <TabsTrigger value="emails">ایمیل‌ها</TabsTrigger>
              <TabsTrigger value="documents">اسناد</TabsTrigger>
              <TabsTrigger value="proposals">پیشنهادها</TabsTrigger>
              <TabsTrigger value="finance">مالی</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <SectionCard title="جریان رویدادها">
                {data.activities.length === 0 ? (
                  <EmptyState title="رویدادی ثبت نشده است" />
                ) : (
                  <ol className="relative space-y-4 border-s ps-4">
                    {data.activities.map((a) => (
                      <li key={a.id} className="relative">
                        <span className="absolute -start-[21px] top-1.5 size-2.5 rounded-full border-2 border-background bg-primary" />
                        <p className="text-sm">{a.content}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ACTIVITY_LABEL[a.type] ?? a.type} · {a.actor_name} ·{" "}
                          {formatDateTime(a.created_at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="tasks">
              <SectionCard title="وظایف پرونده">
                {data.tasks.length === 0 ? (
                  <EmptyState title="وظیفه‌ای ثبت نشده است" />
                ) : (
                  <ul className="divide-y">
                    {data.tasks.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{t.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.assignee_name} · مهلت {formatDate(t.due_date)}
                          </p>
                        </div>
                        <StatusBadge
                          label={TASK_STATUS[t.status as TaskStatus].label}
                          tone={TASK_STATUS[t.status as TaskStatus].tone}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="emails">
              <SectionCard title="مکاتبات">
                {data.emails.length === 0 ? (
                  <EmptyState title="ایمیلی ثبت نشده است" />
                ) : (
                  <ul className="divide-y">
                    {data.emails.map((e) => (
                      <li key={e.id} className="py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium">{e.subject}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatDate(e.sent_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {e.from_address} ← {e.to_address}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="documents">
              <SectionCard title="اسناد">
                {data.documents.length === 0 ? (
                  <EmptyState title="سندی بارگذاری نشده است" />
                ) : (
                  <ul className="divide-y">
                    {data.documents.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{d.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {d.category} · {d.file_type} · {formatDate(d.created_at)}
                          </p>
                        </div>
                        <span className="tabular shrink-0 text-xs text-muted-foreground">
                          {Math.round(Number(d.size_kb ?? 0))} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="proposals">
              <SectionCard title="پیشنهادهای فنی و مالی">
                {data.proposals.length === 0 ? (
                  <EmptyState title="پیشنهادی ثبت نشده است" />
                ) : (
                  <ul className="divide-y">
                    {data.proposals.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{p.title}</p>
                          <p className="tabular text-xs text-muted-foreground">
                            {p.proposal_number} · نسخه {p.version} · {formatDate(p.created_at)}
                          </p>
                        </div>
                        <span className="tabular shrink-0 text-sm">
                          {formatMoney(Number(p.total_amount), p.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </TabsContent>

            <TabsContent value="finance">
              <SectionCard title="فاکتورها">
                {data.invoices.length === 0 ? (
                  <EmptyState title="فاکتوری ثبت نشده است" />
                ) : (
                  <ul className="divide-y">
                    {data.invoices.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="tabular truncate text-sm">{i.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            صدور {formatDate(i.issue_date)} · سررسید {formatDate(i.due_date)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="tabular text-sm">
                            {formatMoney(Number(i.amount), i.currency)}
                          </span>
                          <StatusBadge
                            label={INVOICE_STATUS[i.status as InvoiceStatus].label}
                            tone={INVOICE_STATUS[i.status as InvoiceStatus].tone}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
              <SectionCard title="حمل و تحویل" className="mt-4">
                {data.deliveries.length === 0 ? (
                  <EmptyState title="محموله‌ای ثبت نشده است" />
                ) : (
                  <ul className="divide-y">
                    {data.deliveries.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{d.carrier}</p>
                          <p className="tabular text-xs text-muted-foreground">
                            {d.tracking_number} · {formatDate(d.delivery_date)}
                          </p>
                        </div>
                        <StatusBadge label={d.status} tone="info" />
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
