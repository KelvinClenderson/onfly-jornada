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
      metricas_eventos: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          session_id: string
          tipo: Database["public"]["Enums"]["tipo_evento"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id: string
          tipo: Database["public"]["Enums"]["tipo_evento"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_eventos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_eventos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias: {
        Row: {
          assento_preferido: string | null
          classe_habitual: Database["public"]["Enums"]["classe_voo"]
          companhias_preferidas: string[] | null
          hotel_categoria_preferida: number
          hotel_redes_preferidas: string[] | null
          id: string
          preferencia_conforto: boolean
          preferencia_preco: boolean
          preferencia_rapidez: boolean
          programa_milhas: string | null
          transporte_preferido: Database["public"]["Enums"]["transporte_tipo"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assento_preferido?: string | null
          classe_habitual?: Database["public"]["Enums"]["classe_voo"]
          companhias_preferidas?: string[] | null
          hotel_categoria_preferida?: number
          hotel_redes_preferidas?: string[] | null
          id?: string
          preferencia_conforto?: boolean
          preferencia_preco?: boolean
          preferencia_rapidez?: boolean
          programa_milhas?: string | null
          transporte_preferido?: Database["public"]["Enums"]["transporte_tipo"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assento_preferido?: string | null
          classe_habitual?: Database["public"]["Enums"]["classe_voo"]
          companhias_preferidas?: string[] | null
          hotel_categoria_preferida?: number
          hotel_redes_preferidas?: string[] | null
          id?: string
          preferencia_conforto?: boolean
          preferencia_preco?: boolean
          preferencia_rapidez?: boolean
          programa_milhas?: string | null
          transporte_preferido?: Database["public"]["Enums"]["transporte_tipo"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferencias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          revogado: boolean
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          revogado?: boolean
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          revogado?: boolean
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      reserva_jobs: {
        Row: {
          created_at: string
          dados_reserva: Json
          etapa_atual: string | null
          etapas_concluidas: string[]
          etapas_pendentes: string[]
          falha_motivo: string | null
          id: string
          max_tentativas: number
          next_retry_at: string | null
          opcao_escolhida: string
          status: Database["public"]["Enums"]["status_job"]
          tentativas: number
          updated_at: string
          user_id: string
          viagem_id: string
          webhook_dados: Json | null
        }
        Insert: {
          created_at?: string
          dados_reserva?: Json
          etapa_atual?: string | null
          etapas_concluidas?: string[]
          etapas_pendentes?: string[]
          falha_motivo?: string | null
          id: string
          max_tentativas?: number
          next_retry_at?: string | null
          opcao_escolhida: string
          status?: Database["public"]["Enums"]["status_job"]
          tentativas?: number
          updated_at?: string
          user_id: string
          viagem_id: string
          webhook_dados?: Json | null
        }
        Update: {
          created_at?: string
          dados_reserva?: Json
          etapa_atual?: string | null
          etapas_concluidas?: string[]
          etapas_pendentes?: string[]
          falha_motivo?: string | null
          id?: string
          max_tentativas?: number
          next_retry_at?: string | null
          opcao_escolhida?: string
          status?: Database["public"]["Enums"]["status_job"]
          tentativas?: number
          updated_at?: string
          user_id?: string
          viagem_id?: string
          webhook_dados?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reserva_jobs_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          empresa: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          empresa?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      viagens: {
        Row: {
          classe_voo: Database["public"]["Enums"]["classe_voo"] | null
          companhia_aerea: string | null
          compromisso_id: string | null
          created_at: string
          data_ida: string
          data_volta: string | null
          destino: string
          hotel_categoria: number | null
          hotel_nome: string | null
          hotel_valor_noite: number | null
          id: string
          motivo_viagem: string | null
          numero_voo: string | null
          opcao_escolhida: Database["public"]["Enums"]["opcao_escolhida"] | null
          origem: string
          reserva_job_id: string | null
          status: Database["public"]["Enums"]["status_viagem"]
          tipo: Database["public"]["Enums"]["tipo_viagem"]
          transporte_tipo: Database["public"]["Enums"]["transporte_tipo"] | null
          transporte_valor: number | null
          updated_at: string
          user_id: string
          valor_total: number | null
          valor_voo: number | null
        }
        Insert: {
          classe_voo?: Database["public"]["Enums"]["classe_voo"] | null
          companhia_aerea?: string | null
          compromisso_id?: string | null
          created_at?: string
          data_ida: string
          data_volta?: string | null
          destino: string
          hotel_categoria?: number | null
          hotel_nome?: string | null
          hotel_valor_noite?: number | null
          id?: string
          motivo_viagem?: string | null
          numero_voo?: string | null
          opcao_escolhida?:
            | Database["public"]["Enums"]["opcao_escolhida"]
            | null
          origem: string
          reserva_job_id?: string | null
          status?: Database["public"]["Enums"]["status_viagem"]
          tipo: Database["public"]["Enums"]["tipo_viagem"]
          transporte_tipo?:
            | Database["public"]["Enums"]["transporte_tipo"]
            | null
          transporte_valor?: number | null
          updated_at?: string
          user_id: string
          valor_total?: number | null
          valor_voo?: number | null
        }
        Update: {
          classe_voo?: Database["public"]["Enums"]["classe_voo"] | null
          companhia_aerea?: string | null
          compromisso_id?: string | null
          created_at?: string
          data_ida?: string
          data_volta?: string | null
          destino?: string
          hotel_categoria?: number | null
          hotel_nome?: string | null
          hotel_valor_noite?: number | null
          id?: string
          motivo_viagem?: string | null
          numero_voo?: string | null
          opcao_escolhida?:
            | Database["public"]["Enums"]["opcao_escolhida"]
            | null
          origem?: string
          reserva_job_id?: string | null
          status?: Database["public"]["Enums"]["status_viagem"]
          tipo?: Database["public"]["Enums"]["tipo_viagem"]
          transporte_tipo?:
            | Database["public"]["Enums"]["transporte_tipo"]
            | null
          transporte_valor?: number | null
          updated_at?: string
          user_id?: string
          valor_total?: number | null
          valor_voo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "viagens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      users_safe: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string | null
          empresa: string | null
          id: string | null
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string | null
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string | null
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      classe_voo: "ECONOMICA" | "EXECUTIVA" | "PRIMEIRA"
      opcao_escolhida:
        | "MELHOR_PRECO"
        | "MAIS_RAPIDO"
        | "MAIS_CONFORTO"
        | "CUSTOM"
      status_job: "waiting" | "active" | "completed" | "failed" | "delayed"
      status_viagem: "PENDENTE" | "CONFIRMADA" | "CANCELADA" | "FALHOU"
      tipo_evento:
        | "RELOAD"
        | "ACEITE_PRIMEIRA_OPCAO"
        | "ABANDONO"
        | "PERSONALIZACAO_CUSTOM"
        | "JORNADA_CONCLUIDA"
        | "HOOK_ACEITO"
        | "HOOK_RECUSADO"
      tipo_viagem: "IDA_SOMENTE" | "IDA_E_VOLTA"
      transporte_tipo: "TAXI" | "UBER" | "ALUGUEL"
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
      classe_voo: ["ECONOMICA", "EXECUTIVA", "PRIMEIRA"],
      opcao_escolhida: [
        "MELHOR_PRECO",
        "MAIS_RAPIDO",
        "MAIS_CONFORTO",
        "CUSTOM",
      ],
      status_job: ["waiting", "active", "completed", "failed", "delayed"],
      status_viagem: ["PENDENTE", "CONFIRMADA", "CANCELADA", "FALHOU"],
      tipo_evento: [
        "RELOAD",
        "ACEITE_PRIMEIRA_OPCAO",
        "ABANDONO",
        "PERSONALIZACAO_CUSTOM",
        "JORNADA_CONCLUIDA",
        "HOOK_ACEITO",
        "HOOK_RECUSADO",
      ],
      tipo_viagem: ["IDA_SOMENTE", "IDA_E_VOLTA"],
      transporte_tipo: ["TAXI", "UBER", "ALUGUEL"],
    },
  },
} as const
