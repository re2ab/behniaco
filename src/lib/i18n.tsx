import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "fa" | "en";

const dict = {
  fa: {
    app: "سامانه خرید صنعتی",
    appShort: "RFQ",
    dashboard: "داشبورد",
    pipeline: "پایپ‌لاین",
    cases: "پرونده‌ها",
    tasks: "وظایف",
    contacts: "مخاطبان",
    emails: "ایمیل‌ها",
    documents: "اسناد",
    proposals: "پیشنهادها",
    finance: "مالی",
    reports: "گزارش‌ها",
    settings: "تنظیمات",
    search: "جستجو در کل سیستم…",
    notifications: "اعلان‌ها",
    language: "زبان",
    theme: "پوسته",
    logout: "خروج",
    profile: "پروفایل",
    collapse: "جمع کردن منو",
    expand: "باز کردن منو",
    menu: "منو",
  },
  en: {
    app: "Industrial Procurement",
    appShort: "RFQ",
    dashboard: "Dashboard",
    pipeline: "Pipeline",
    cases: "Cases",
    tasks: "Tasks",
    contacts: "Contacts",
    emails: "Emails",
    documents: "Documents",
    proposals: "Proposals",
    finance: "Finance",
    reports: "Reports",
    settings: "Settings",
    search: "Search everything…",
    notifications: "Notifications",
    language: "Language",
    theme: "Theme",
    logout: "Sign out",
    profile: "Profile",
    collapse: "Collapse menu",
    expand: "Expand menu",
    menu: "Menu",
  },
} as const;

type Key = keyof (typeof dict)["fa"];

const Ctx = createContext<{
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}>({ lang: "fa", dir: "rtl", setLang: () => {}, t: (k) => dict.fa[k] });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fa");

  useEffect(() => {
    const stored = window.localStorage.getItem("rfq-lang") as Lang | null;
    if (stored === "en" || stored === "fa") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("rfq-lang", l);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      dir: (lang === "fa" ? "rtl" : "ltr") as "rtl" | "ltr",
      setLang,
      t: (k: Key) => dict[lang][k],
    }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("rfq-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("rfq-theme", next ? "dark" : "light");
      return next;
    });
  }, []);
  return { dark, toggle };
}
