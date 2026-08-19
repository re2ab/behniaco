import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingRows, PageHeader } from "@/components/app/primitives";
import { contactsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "مخاطبین | سامانه خرید صنعتی" },
      { name: "description", content: "دفترچه مخاطبین و سازمان‌های مرتبط." },
      { property: "og:title", content: "مخاطبین" },
      { property: "og:description", content: "لیست مشتریان و سازمان‌ها." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { data, isLoading } = useQuery(contactsQuery);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="مخاطبین" count={rows.length} subtitle="مشتریان و سازمان‌های تجاری" />
      <div className="surface overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingRows rows={6} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="مخاطبی ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  {["نام", "سازمان", "صنعت", "شهر", "ایمیل", "تلفن"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-start font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{c.full_name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.organizations?.name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.organizations?.industry ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.organizations?.city ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.email ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.phone ?? "—"}</td>
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
