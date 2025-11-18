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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      push_message: {
        Row: {
          created_at: string
          description: string
          id: string
          sent_at: string | null
          template_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          sent_at?: string | null
          template_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sent_at?: string | null
          template_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_message_dev: {
        Row: {
          created_at: string
          description: string
          id: string
          sent_at: string | null
          template_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          sent_at?: string | null
          template_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sent_at?: string | null
          template_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          agreed_terms: string[] | null
          auth_provider: string
          birthday: string | null
          ci: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          external_user_id: string
          gender: string | null
          id: string
          last_login_at: string | null
          marketing_consent: boolean | null
          name: string | null
          nationality: string | null
          nickname: string | null
          notification_enabled: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          agreed_terms?: string[] | null
          auth_provider: string
          birthday?: string | null
          ci?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          external_user_id: string
          gender?: string | null
          id?: string
          last_login_at?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          nationality?: string | null
          nickname?: string | null
          notification_enabled?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          agreed_terms?: string[] | null
          auth_provider?: string
          birthday?: string | null
          ci?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          external_user_id?: string
          gender?: string | null
          id?: string
          last_login_at?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          nationality?: string | null
          nickname?: string | null
          notification_enabled?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      video: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          difficulty: number | null
          duration: number
          id: string
          status: Database["public"]["Enums"]["video_status"]
          thumbnail: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          duration: number
          id: string
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          duration?: number
          id?: string
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_category"
            referencedColumns: ["id"]
          },
        ]
      }
      video_category: {
        Row: {
          created_at: string | null
          id: number
          name: string
          order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      video_category_dev: {
        Row: {
          created_at: string | null
          id: number
          name: string
          order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      video_dev: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          difficulty: number | null
          duration: number
          id: string
          status: Database["public"]["Enums"]["video_status"]
          thumbnail: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          duration: number
          id: string
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          duration?: number
          id?: string
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_dev_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_category_dev"
            referencedColumns: ["id"]
          },
        ]
      }
      video_subtitle: {
        Row: {
          blanked_text: string
          created_at: string | null
          end_time: number
          id: number
          index: number
          origin_text: string
          start_time: number
          translation: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          blanked_text: string
          created_at?: string | null
          end_time: number
          id?: number
          index: number
          origin_text: string
          start_time: number
          translation: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          blanked_text?: string
          created_at?: string | null
          end_time?: number
          id?: number
          index?: number
          origin_text?: string
          start_time?: number
          translation?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_subtitle_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
        ]
      }
      video_subtitle_dev: {
        Row: {
          blanked_text: string
          created_at: string | null
          end_time: number
          id: number
          index: number
          origin_text: string
          start_time: number
          translation: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          blanked_text: string
          created_at?: string | null
          end_time: number
          id?: number
          index: number
          origin_text: string
          start_time: number
          translation: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          blanked_text?: string
          created_at?: string | null
          end_time?: number
          id?: number
          index?: number
          origin_text?: string
          start_time?: number
          translation?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_subtitle_dev_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_dev"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      video_status: "draft" | "published"
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
      video_status: ["draft", "published"],
    },
  },
} as const
