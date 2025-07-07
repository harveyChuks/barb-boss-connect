export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_modifications: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          modification_type: string
          modified_by: string | null
          new_date: string | null
          new_end_time: string | null
          new_start_time: string | null
          new_status: string | null
          old_date: string | null
          old_end_time: string | null
          old_start_time: string | null
          old_status: string | null
          reason: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          modification_type: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          new_status?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          old_status?: string | null
          reason?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          modification_type?: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          new_status?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          old_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_modifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          business_id: string
          can_cancel: boolean | null
          can_reschedule: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          end_time: string
          id: string
          notes: string | null
          payment_intent_id: string | null
          requires_deposit: boolean | null
          service_id: string
          staff_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          business_id: string
          can_cancel?: boolean | null
          can_reschedule?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          end_time: string
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          requires_deposit?: boolean | null
          service_id: string
          staff_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          business_id?: string
          can_cancel?: boolean | null
          can_reschedule?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          end_time?: string
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          requires_deposit?: boolean | null
          service_id?: string
          staff_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_modifications: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          modification_type: string
          modified_by: string | null
          new_date: string | null
          new_end_time: string | null
          new_start_time: string | null
          old_date: string | null
          old_end_time: string | null
          old_start_time: string | null
          reason: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          modification_type: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          reason?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          modification_type?: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_modifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          business_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_closed: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_closed?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_closed?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          booking_link: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          language_settings: Json | null
          logo_url: string | null
          name: string
          owner_id: string
          payment_settings: Json | null
          phone: string | null
          updated_at: string | null
          website: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
          whatsapp_settings: Json | null
        }
        Insert: {
          address?: string | null
          booking_link?: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          language_settings?: Json | null
          logo_url?: string | null
          name: string
          owner_id: string
          payment_settings?: Json | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          whatsapp_settings?: Json | null
        }
        Update: {
          address?: string | null
          booking_link?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          language_settings?: Json | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          payment_settings?: Json | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          whatsapp_settings?: Json | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string | null
          currency: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          specialties: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          specialties?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          specialties?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      work_pictures: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          service_type: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          service_type?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_pictures_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_deposit_amount: {
        Args: { service_price: number }
        Returns: number
      }
      check_appointment_conflict: {
        Args: {
          p_business_id: string
          p_appointment_date: string
          p_start_time: string
          p_end_time: string
          p_staff_id?: string
          p_exclude_appointment_id?: string
        }
        Returns: boolean
      }
      get_available_time_slots: {
        Args: {
          p_business_id: string
          p_date: string
          p_duration_minutes: number
          p_staff_id?: string
        }
        Returns: {
          slot_time: string
          is_available: boolean
        }[]
      }
      initialize_default_business_hours: {
        Args: { p_business_id: string }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      business_type:
        | "barbershop"
        | "hair_salon"
        | "makeup_artist"
        | "nail_salon"
        | "spa"
        | "beauty_clinic"
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
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      business_type: [
        "barbershop",
        "hair_salon",
        "makeup_artist",
        "nail_salon",
        "spa",
        "beauty_clinic",
      ],
    },
  },
} as const
