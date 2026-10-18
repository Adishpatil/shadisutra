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
      };
    };
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
    };
  };
}
