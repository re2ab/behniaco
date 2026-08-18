import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const casesQuery = queryOptions({
  queryKey: ["cases"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("cases")
      .select("*, organizations(name), contacts(full_name)")
      .order("last_activity_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export type CaseRow = Database["public"]["Tables"]["cases"]["Row"] & {
  organizations: { name: string } | null;
  contacts: { full_name: string } | null;
};

export const caseDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["case", id],
    queryFn: async () => {
      const [c, activities, tasks, docs, proposals, invoices, deliveries, emails] =
        await Promise.all([
          supabase
            .from("cases")
            .select("*, organizations(*), contacts(*)")
            .eq("id", id)
            .maybeSingle(),
          supabase
            .from("activities")
            .select("*")
            .eq("case_id", id)
            .order("created_at", { ascending: false }),
          supabase.from("tasks").select("*").eq("case_id", id).order("due_date"),
          supabase
            .from("documents")
            .select("*")
            .eq("case_id", id)
            .order("created_at", { ascending: false }),
          supabase.from("proposals").select("*").eq("case_id", id).order("created_at"),
          supabase.from("invoices").select("*").eq("case_id", id).order("issue_date"),
          supabase.from("deliveries").select("*").eq("case_id", id),
          supabase
            .from("emails")
            .select("*")
            .eq("case_id", id)
            .order("sent_at", { ascending: false }),
        ]);
      if (c.error) throw c.error;
      return {
        case: c.data,
        activities: activities.data ?? [],
        tasks: tasks.data ?? [],
        documents: docs.data ?? [],
        proposals: proposals.data ?? [],
        invoices: invoices.data ?? [],
        deliveries: deliveries.data ?? [],
        emails: emails.data ?? [],
      };
    },
  });

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, cases(case_number, title)")
      .order("due_date", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const contactsQuery = queryOptions({
  queryKey: ["contacts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*, organizations(name, industry, city)")
      .order("full_name");
    if (error) throw error;
    return data;
  },
});

export const organizationsQuery = queryOptions({
  queryKey: ["organizations"],
  queryFn: async () => {
    const { data, error } = await supabase.from("organizations").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const emailsQuery = queryOptions({
  queryKey: ["emails"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("emails")
      .select("*, cases(case_number)")
      .order("sent_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const documentsQuery = queryOptions({
  queryKey: ["documents"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*, cases(case_number, title)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const proposalsQuery = queryOptions({
  queryKey: ["proposals"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("*, cases(case_number, title, organizations(name))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const invoicesQuery = queryOptions({
  queryKey: ["invoices"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, cases(case_number, organizations(name))")
      .order("issue_date", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const deliveriesQuery = queryOptions({
  queryKey: ["deliveries"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*, cases(case_number, organizations(name))")
      .order("delivery_date");
    if (error) throw error;
    return data;
  },
});

export const activitiesQuery = queryOptions({
  queryKey: ["activities"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*, cases(case_number)")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  },
});
