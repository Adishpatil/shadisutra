export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "customer";
          username: string;
          full_name: string;
          access_enabled: boolean;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "admin" | "customer";
          username: string;
          full_name: string;
          access_enabled?: boolean;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "customer";
          username?: string;
          full_name?: string;
          access_enabled?: boolean;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          customer_id: string | null;
          name: string;
          type: "wedding" | "birthday" | "function";
          date: string;
          venue: string;
          status: "planning" | "finalized" | "completed" | "cancelled";
          show_payments_to_customer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          name: string;
          type: "wedding" | "birthday" | "function";
          date: string;
          venue: string;
          status?: "planning" | "finalized" | "completed" | "cancelled";
          show_payments_to_customer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          name?: string;
          type?: "wedding" | "birthday" | "function";
          date?: string;
          venue?: string;
          status?: "planning" | "finalized" | "completed" | "cancelled";
          show_payments_to_customer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      event_functions: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          date: string;
          start_time: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          date: string;
          start_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          date?: string;
          start_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_functions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      event_items: {
        Row: {
          id: string;
          function_id: string;
          category: "lighting" | "flowers" | "decor" | "instruments" | "other";
          title: string;
          vendor: string | null;
          status: "not_started" | "in_progress" | "done";
          cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          function_id: string;
          category: "lighting" | "flowers" | "decor" | "instruments" | "other";
          title: string;
          vendor?: string | null;
          status?: "not_started" | "in_progress" | "done";
          cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          function_id?: string;
          category?: "lighting" | "flowers" | "decor" | "instruments" | "other";
          title?: string;
          vendor?: string | null;
          status?: "not_started" | "in_progress" | "done";
          cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_items_function_id_fkey";
            columns: ["function_id"];
            isOneToOne: false;
            referencedRelation: "event_functions";
            referencedColumns: ["id"];
          }
        ];
      };
      budgets: {
        Row: {
          id: string;
          event_id: string;
          agreed_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          agreed_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          agreed_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: true;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          event_id: string;
          amount: number;
          paid_on: string;
          mode: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          amount: number;
          paid_on: string;
          mode?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          amount?: number;
          paid_on?: string;
          mode?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      designs: {
        Row: {
          id: string;
          event_id: string;
          title: string;
          file_path: string;
          version: number;
          is_finalized: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          title: string;
          file_path: string;
          version?: number;
          is_finalized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          title?: string;
          file_path?: string;
          version?: number;
          is_finalized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "designs_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      timeline_entries: {
        Row: {
          id: string;
          event_id: string;
          function_id: string | null;
          starts_at: string;
          title: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          function_id?: string | null;
          starts_at: string;
          title: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          function_id?: string | null;
          starts_at?: string;
          title?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timeline_entries_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      guests: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          party_size: number;
          phone: string | null;
          rsvp: "pending" | "yes" | "no";
          table_no: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          party_size?: number;
          phone?: string | null;
          rsvp?: "pending" | "yes" | "no";
          table_no?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          party_size?: number;
          phone?: string | null;
          rsvp?: "pending" | "yes" | "no";
          table_no?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      enquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          event_type: string;
          event_date: string | null;
          message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          event_type: string;
          event_date?: string | null;
          message: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          event_type?: string;
          event_date?: string | null;
          message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          table_name: string;
          row_id: string | null;
          payload: Json | null;
          at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          table_name: string;
          row_id?: string | null;
          payload?: Json | null;
          at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          table_name?: string;
          row_id?: string | null;
          payload?: Json | null;
          at?: string;
        };
        Relationships: [];
      };
      event_share_links: {
        Row: {
          event_id: string;
          token: string;
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          event_id: string;
          token: string;
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          token?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_share_links_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      event_share_rate_limits: {
        Row: {
          key_hash: string;
          window_started_at: string;
          hits: number;
          updated_at: string;
        };
        Insert: {
          key_hash: string;
          window_started_at: string;
          hits: number;
          updated_at?: string;
        };
        Update: {
          key_hash?: string;
          window_started_at?: string;
          hits?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      customer_can_access_event: {
        Args: {
          target_event_id: string;
        };
        Returns: boolean;
      };
      consume_rate_limit: {
        Args: {
          p_key_hash: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
