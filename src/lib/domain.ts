import type { Database } from "@/integrations/supabase/types";

export type CaseStatus = Database["public"]["Enums"]["case_status"];
export type Priority = Database["public"]["Enums"]["priority"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "accent";

export const CASE_STATUS_ORDER: CaseStatus[] = [
  "received",
  "awaiting_info",
  "awaiting_supplier_quote",
  "tech_proposal_prep",
  "tech_proposal_sent",
  "fin_proposal_prep",
  "fin_proposal_sent",
  "won",
  "purchasing",
  "receivables",
  "on_hold",
  "lost",
  "closed",
];

export const CASE_STATUS: Record<CaseStatus, { label: string; tone: Tone }> = {
  received: { label: "درخواست دریافتی", tone: "info" },
  awaiting_info: { label: "منتظر اطلاعات تکمیلی", tone: "warning" },
  awaiting_supplier_quote: { label: "منتظر دریافت پیشنهاد", tone: "warning" },
  tech_proposal_prep: { label: "منتظر تهیه پیشنهاد فنی", tone: "neutral" },
  tech_proposal_sent: { label: "پیشنهاد فنی ارسال‌شده", tone: "info" },
  fin_proposal_prep: { label: "منتظر تهیه پیشنهاد مالی", tone: "neutral" },
  fin_proposal_sent: { label: "پیشنهاد مالی ارسال‌شده", tone: "accent" },
  won: { label: "برنده شده", tone: "success" },
  purchasing: { label: "در حال خرید و حمل", tone: "info" },
  receivables: { label: "دریافت مطالبات", tone: "warning" },
  on_hold: { label: "متوقف", tone: "neutral" },
  lost: { label: "بازنده شده", tone: "danger" },
  closed: { label: "بسته شده", tone: "neutral" },
};

export const PRIORITY: Record<Priority, { label: string; tone: Tone }> = {
  low: { label: "کم", tone: "neutral" },
  medium: { label: "متوسط", tone: "info" },
  high: { label: "زیاد", tone: "warning" },
  urgent: { label: "فوری", tone: "danger" },
};

export const TASK_STATUS: Record<TaskStatus, { label: string; tone: Tone }> = {
  todo: { label: "انجام نشده", tone: "neutral" },
  in_progress: { label: "در حال انجام", tone: "info" },
  done: { label: "انجام شده", tone: "success" },
  cancelled: { label: "لغو شده", tone: "danger" },
};

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: "پیش‌نویس", tone: "neutral" },
  sent: { label: "ارسال شده", tone: "info" },
  paid: { label: "پرداخت شده", tone: "success" },
  partially_paid: { label: "پرداخت جزئی", tone: "warning" },
  overdue: { label: "سررسید گذشته", tone: "danger" },
};

export const ACTIVITY_LABEL: Record<string, string> = {
  case_created: "ایجاد پرونده",
  status_change: "تغییر وضعیت",
  comment: "یادداشت",
  call: "تماس",
  email: "ایمیل",
  proposal: "پیشنهاد",
  document: "سند",
  task: "وظیفه",
  payment: "پرداخت",
  delivery: "حمل و تحویل",
  invoice: "فاکتور",
};

export function formatMoney(value: number | null | undefined, currency = "EUR") {
  const n = Number(value ?? 0);
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "—";
  }
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    );
  } catch {
    return "—";
  }
}

export function timeAgo(value: string | null | undefined) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "همین حالا";
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} روز پیش`;
  return formatDate(value);
}

export function initials(name: string | null | undefined) {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
