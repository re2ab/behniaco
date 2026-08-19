import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/app/primitives";
import { useI18n, useTheme } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "تنظیمات | سامانه خرید صنعتی" },
      { name: "description", content: "تنظیمات زبان، تم و حساب کاربری." },
      { property: "og:title", content: "تنظیمات" },
      { property: "og:description", content: "تنظیمات کاربری و ظاهر." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { dark, toggle } = useTheme();
  const { user, displayName } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <>
      <PageHeader title="تنظیمات" subtitle="تنظیمات حساب و ظاهر برنامه" />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="حساب کاربری">
          <p className="text-sm text-muted-foreground">نام نمایشی</p>
          <p className="font-medium">{displayName}</p>
          <p className="mt-3 text-sm text-muted-foreground">ایمیل</p>
          <p className="font-medium">{user?.email ?? "—"}</p>
          <Button variant="outline" className="mt-4" onClick={signOut}>خروج از حساب</Button>
        </SectionCard>

        <SectionCard title="ظاهر و زبان">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">زبان</span>
              <Button variant="outline" size="sm" onClick={() => setLang(lang === "fa" ? "en" : "fa")}>
                {lang === "fa" ? "English" : "فارسی"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">تم</span>
              <Button variant="outline" size="sm" onClick={toggle}>
                {dark ? "روشن" : "تیره"}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
