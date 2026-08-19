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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      article_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string
          read_minutes: number
          slug: string
          source: string | null
          original_url: string | null
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          read_minutes?: number
          slug: string
          source?: string | null
          original_url?: string | null
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          read_minutes?: number
          slug?: string
          source?: string | null
          original_url?: string | null
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          category: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number
          address: string | null
          lat: number | null
          lng: number | null
          pin_icon: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
          address?: string | null
          lat?: number | null
          lng?: number | null
          pin_icon?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          address?: string | null
          lat?: number | null
          lng?: number | null
          pin_icon?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          about: string | null
          address: string | null
          address_ro: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          iso_images: Json
          linkedin_url: string | null
          logo_url: string | null
          maps_embed: string | null
          maps_embed_ro: string | null
          mission: string | null
          name: string
          operating_hours: string | null
          stats: Json
          tagline: string | null
          timeline: Json
          updated_at: string
          vision: string | null
          youtube_url: string | null
          whatsapp: string | null
          whatsapp_2: string | null
          whatsapp_3: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          address_ro?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          iso_images?: Json
          linkedin_url?: string | null
          logo_url?: string | null
          maps_embed?: string | null
          maps_embed_ro?: string | null
          mission?: string | null
          name?: string
          operating_hours?: string | null
          stats?: Json
          tagline?: string | null
          timeline?: Json
          updated_at?: string
          vision?: string | null
          youtube_url?: string | null
          whatsapp?: string | null
          whatsapp_2?: string | null
          whatsapp_3?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          address_ro?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          iso_images?: Json
          linkedin_url?: string | null
          logo_url?: string | null
          maps_embed?: string | null
          maps_embed_ro?: string | null
          mission?: string | null
          name?: string
          operating_hours?: string | null
          stats?: Json
          tagline?: string | null
          timeline?: Json
          updated_at?: string
          vision?: string | null
          youtube_url?: string | null
          whatsapp?: string | null
          whatsapp_2?: string | null
          whatsapp_3?: string | null
        }
        Relationships: []
      }
      company_admins: {
        Row: {
          id: string
          name: string
          phone: string
          instagram: string | null
          photo_url: string | null
          quote: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          instagram?: string | null
          photo_url?: string | null
          quote?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          instagram?: string | null
          photo_url?: string | null
          quote?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          applications: Json
          brand: string
          category: string
          category_label: string
          created_at: string
          description: string | null
          documents: Json
          features: Json
          gallery: Json | null
          id: string
          image_url: string | null
          name: string
          sku: string | null
          slug: string
          sort_order: number
          specs: Json
          stock: string
          updated_at: string
        }
        Insert: {
          applications?: Json
          brand: string
          category: string
          category_label: string
          created_at?: string
          description?: string | null
          documents?: Json
          features?: Json
          id?: string
          image_url?: string | null
          name: string
          sku?: string | null
          slug: string
          sort_order?: number
          specs?: Json
          stock?: string
          updated_at?: string
        }
        Update: {
          applications?: Json
          brand?: string
          category?: string
          category_label?: string
          created_at?: string
          description?: string | null
          documents?: Json
          features?: Json
          id?: string
          image_url?: string | null
          name?: string
          sku?: string | null
          slug?: string
          sort_order?: number
          specs?: Json
          stock?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          client: string | null
          created_at: string
          description: string | null
          documents: Json
          duration: string | null
          gallery: Json
          id: string
          image_url: string | null
          location: string | null
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          category?: string
          client?: string | null
          created_at?: string
          description?: string | null
          documents?: Json
          duration?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          location?: string | null
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          category?: string
          client?: string | null
          created_at?: string
          description?: string | null
          documents?: Json
          duration?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          location?: string | null
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          quote: string
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          quote: string
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          quote?: string
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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

      page_views: {
        Row: {
          id: string
          path: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          path: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          path?: string
          user_agent?: string | null
          created_at?: string
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
