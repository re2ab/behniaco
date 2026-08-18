import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, LoadingRows, PageHeader, StatusBadge } from "@/components/app/primitives";
import { casesQuery, type CaseRow } from "@/lib/queries";
import { CASE_STATUS, CASE_STATUS_ORDER, PRIORITY, formatDate, formatMoney } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/cases/")({
  head: () => ({
    meta: [
      { title: "پرونده‌ها | سامانه خرید صنعتی" },
      { name: "description", content: "فهرست کامل پرونده‌های خرید با جستجو و فیلتر وضعیت." },
      { property: "og:title", content: "پرونده‌های خرید" },
      { property: "og:description", content: "جستجو و مدیریت پرونده‌های استعلام و خرید." },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  const { data, isLoading } = useQuery(casesQuery);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const rows = useMemo(() => {
    const all = (data ?? []) as unknown as CaseRow[];
    return all.filter((c) => {
      const text = `${c.case_number} ${c.title} ${c.organizations?.name ?? ""} ${
        c.responsible_name ?? ""
      }`.toLowerCase();
      return (
        text.includes(q.toLowerCase()) &&
        (status === "all" || c.status === status) &&
        (priority === "all" || c.priority === priority)
      );
    });
  }, [data, q, status, priority]);

  return (
    <>
      <PageHeader title="پرونده‌ها" count={rows.length} subtitle="مدیریت درخواست‌های خرید صنعتی" />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 end-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو در شماره، عنوان، مشتری…"
            className="pe-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {CASE_STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>{CASE_STATUS[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه اولویت‌ها</SelectItem>
            {Object.entries(PRIORITY).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="surface overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingRows rows={8} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="پرونده‌ای یافت نشد" description="فیلترها را تغییر دهید." />
        ) : (
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["شماره", "عنوان", "مشتری", "وضعیت", "اولویت", "ارزش", "مسئول", "مهلت"].map(
                    (h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2.5 text-start font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/40">
                    <td className="tabular whitespace-nowrap px-3 py-2.5">
                      <Link
                        to="/cases/$caseId"
                        params={{ caseId: c.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {c.case_number}
                      </Link>
                    </td>
                    <td className="max-w-72 px-3 py-2.5">
                      <span className="line-clamp-1">{c.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {c.organizations?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={CASE_STATUS[c.status].label}
                        tone={CASE_STATUS[c.status].tone}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={PRIORITY[c.priority].label}
                        tone={PRIORITY[c.priority].tone}
                      />
                    </td>
                    <td className="tabular whitespace-nowrap px-3 py-2.5">
                      {formatMoney(Number(c.value), c.currency)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {c.responsible_name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {formatDate(c.due_date)}
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
