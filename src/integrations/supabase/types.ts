export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          actor_name: string | null
          actor_user_id: string | null
          case_id: string | null
          content: string | null
          created_at: string
          id: string
          meta: Json
          type: string
        }
        Insert: {
          actor_name?: string | null
          actor_user_id?: string | null
          case_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          meta?: Json
          type: string
        }
        Update: {
          actor_name?: string | null
          actor_user_id?: string | null
          case_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          meta?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string
          contact_id: string | null
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          exchange_rate: number | null
          id: string
          last_activity_at: string
          organization_id: string | null
          priority: Database["public"]["Enums"]["priority"]
          responsible_name: string | null
          responsible_user_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          case_number: string
          contact_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          exchange_rate?: number | null
          id?: string
          last_activity_at?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          responsible_name?: string | null
          responsible_user_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          case_number?: string
          contact_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          exchange_rate?: number | null
          id?: string
          last_activity_at?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          responsible_name?: string | null
          responsible_user_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          job_title: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          job_title?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          case_id: string | null
          created_at: string
          delivery_date: string | null
          id: string
          incoterm: string | null
          quantity: string | null
          status: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          delivery_date?: string | null
          id?: string
          incoterm?: string | null
          quantity?: string | null
          status?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          delivery_date?: string | null
          id?: string
          incoterm?: string | null
          quantity?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          created_at: string
          created_by: string | null
          doc_type: string | null
          file_url: string | null
          id: string
          name: string
          size_kb: number
          version: number
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          doc_type?: string | null
          file_url?: string | null
          id?: string
          name: string
          size_kb?: number
          version?: number
        }
        Update: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          doc_type?: string | null
          file_url?: string | null
          id?: string
          name?: string
          size_kb?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body: string | null
          case_id: string | null
          created_at: string
          folder: string
          has_attachments: boolean
          id: string
          is_read: boolean
          recipient: string
          sender: string
          sent_at: string
          subject: string
        }
        Insert: {
          body?: string | null
          case_id?: string | null
          created_at?: string
          folder?: string
          has_attachments?: boolean
          id?: string
          is_read?: boolean
          recipient: string
          sender: string
          sent_at?: string
          subject: string
        }
        Update: {
          body?: string | null
          case_id?: string | null
          created_at?: string
          folder?: string
          has_attachments?: boolean
          id?: string
          is_read?: boolean
          recipient?: string
          sender?: string
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          case_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          paid_amount: number
          status: Database["public"]["Enums"]["invoice_status"]
        }
        Insert: {
          amount?: number
          case_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          paid_amount?: number
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Update: {
          amount?: number
          case_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          paid_amount?: number
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          industry: string | null
          name: string
          phone: string | null
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          case_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          kind: Database["public"]["Enums"]["proposal_kind"]
          proposal_number: string
          status: string
          total: number
          version: number
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          kind: Database["public"]["Enums"]["proposal_kind"]
          proposal_number: string
          status?: string
          total?: number
          version?: number
        }
        Update: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          kind?: Database["public"]["Enums"]["proposal_kind"]
          proposal_number?: string
          status?: string
          total?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_name: string | null
          assignee_user_id: string | null
          case_id: string | null
          checklist: Json
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_name?: string | null
          assignee_user_id?: string | null
          case_id?: string | null
          checklist?: Json
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_name?: string | null
          assignee_user_id?: string | null
          case_id?: string | null
          checklist?: Json
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "sales" | "finance" | "viewer"
      case_status:
        | "received"
        | "awaiting_info"
        | "awaiting_supplier_quote"
        | "tech_proposal_prep"
        | "tech_proposal_sent"
        | "fin_proposal_prep"
        | "fin_proposal_sent"
        | "won"
        | "purchasing"
        | "receivables"
        | "on_hold"
        | "lost"
        | "closed"
      invoice_status: "draft" | "sent" | "paid" | "partially_paid" | "overdue"
      priority: "low" | "medium" | "high" | "urgent"
      proposal_kind: "technical" | "financial"
      task_status: "todo" | "in_progress" | "done" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "sales", "finance", "viewer"],
      case_status: [
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
      ],
      invoice_status: ["draft", "sent", "paid", "partially_paid", "overdue"],
      priority: ["low", "medium", "high", "urgent"],
      proposal_kind: ["technical", "financial"],
      task_status: ["todo", "in_progress", "done", "cancelled"],
    },
  },
} as const
