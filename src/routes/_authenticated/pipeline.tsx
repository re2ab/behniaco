import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, StatusBadge, LoadingRows } from "@/components/app/primitives";
import { casesQuery, type CaseRow } from "@/lib/queries";
import { CASE_STATUS, CASE_STATUS_ORDER, PRIORITY, formatMoney, timeAgo } from "@/lib/domain";
import type { CaseStatus } from "@/lib/domain";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "پایپ‌لاین پرونده‌ها | سامانه خرید صنعتی" },
      { name: "description", content: "نمای کانبان پرونده‌ها در ۱۳ مرحله فرآیند خرید صنعتی." },
      { property: "og:title", content: "پایپ‌لاین پرونده‌ها" },
      { property: "og:description", content: "مدیریت مراحل خرید با کشیدن و رها کردن کارت‌ها." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const { data, isLoading } = useQuery(casesQuery);
  const qc = useQueryClient();
  const [pending, setPending] = useState<{ id: string; to: CaseStatus; number: string } | null>(
    null,
  );
  const [dragId, setDragId] = useState<string | null>(null);

  const move = useMutation({
    mutationFn: async ({ id, to }: { id: string; to: CaseStatus }) => {
      const { error } = await supabase
        .from("cases")
        .update({ status: to, last_activity_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await supabase.from("activities").insert({
        case_id: id,
        type: "status_change",
        actor_name: "کاربر جاری",
        content: `وضعیت پرونده به «${CASE_STATUS[to].label}» تغییر کرد.`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("وضعیت پرونده به‌روزرسانی شد");
    },
    onError: () => toast.error("تغییر وضعیت انجام نشد"),
  });

  const rows = (data ?? []) as unknown as CaseRow[];

  return (
    <>
      <PageHeader
        title="پایپ‌لاین"
        count={rows.length}
        subtitle="کارت‌ها را برای تغییر مرحله بکشید؛ هر تغییر در تاریخچه پرونده ثبت می‌شود."
      />

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : (
        <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-4 scroll-slim sm:-mx-6 sm:px-6">
          {CASE_STATUS_ORDER.map((status) => {
            const items = rows.filter((c) => c.status === status);
            const total = items.reduce((s, c) => s + Number(c.value), 0);
            return (
              <div
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const row = rows.find((r) => r.id === dragId);
                  if (row && row.status !== status) {
                    setPending({ id: row.id, to: status, number: row.case_number });
                  }
                  setDragId(null);
                }}
                className="flex w-[280px] shrink-0 flex-col rounded-xl bg-muted/50 p-2"
              >
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{CASE_STATUS[status].label}</p>
                    <p className="tabular text-[11px] text-muted-foreground">
                      {items.length} پرونده · {formatMoney(total, "")}
                    </p>
                  </div>
                  <StatusBadge label={String(items.length)} tone={CASE_STATUS[status].tone} />
                </div>

                <div className="flex flex-col gap-2">
                  {items.map((c) => (
                    <article
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      className="surface group cursor-grab p-3 transition-shadow hover:elev-2 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/cases/$caseId"
                          params={{ caseId: c.id }}
                          className="tabular text-xs font-medium text-primary hover:underline"
                        >
                          {c.case_number}
                        </Link>
                        <GripVertical className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-medium">{c.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {c.organizations?.name} · {c.contacts?.full_name}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge
                          label={PRIORITY[c.priority].label}
                          tone={PRIORITY[c.priority].tone}
                        />
                        <span className="tabular text-xs font-medium">
                          {formatMoney(Number(c.value), c.currency)}
                        </span>
                      </div>
                      <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
                        {c.responsible_name} · {timeAgo(c.last_activity_at)}
                      </p>
                    </article>
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed px-3 py-6 text-center text-[11px] text-muted-foreground">
                      خالی
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تغییر وضعیت پرونده</AlertDialogTitle>
            <AlertDialogDescription>
              وضعیت پرونده {pending?.number} به «{pending ? CASE_STATUS[pending.to].label : ""}»
              تغییر کند؟ این تغییر در تاریخچه ثبت می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) move.mutate({ id: pending.id, to: pending.to });
                setPending(null);
              }}
            >
              تایید تغییر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
