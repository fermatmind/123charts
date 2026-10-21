export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          granted_at: string;
          granted_by: string | null;
          id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          created_at: string;
          event_payload: NonNullable<Json>;
          event_source: string;
          event_type: string;
          id: string;
          request_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          event_payload?: NonNullable<Json>;
          event_source: string;
          event_type: string;
          id?: string;
          request_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_payload?: NonNullable<Json>;
          event_source?: string;
          event_type?: string;
          id?: string;
          request_id?: string | null;
        };
        Relationships: [];
      };
      audit_observations: {
        Row: {
          audit_method: string;
          audit_observation_hash: string | null;
          checked_at: string | null;
          created_at: string;
          failure_class: string | null;
          id: string;
          observation_type: string;
          observation_value: NonNullable<Json>;
          project_entity_id: string;
          ttl_expires_at: string | null;
          updated_at: string;
          visibility: string;
        };
        ComputedFields: never;
        Insert: {
          audit_method?: string;
          audit_observation_hash?: string | null;
          checked_at?: string | null;
          created_at?: string;
          failure_class?: string | null;
          id?: string;
          observation_type: string;
          observation_value?: NonNullable<Json>;
          project_entity_id: string;
          ttl_expires_at?: string | null;
          updated_at?: string;
          visibility?: string;
        };
        Update: {
          audit_method?: string;
          audit_observation_hash?: string | null;
          checked_at?: string | null;
          created_at?: string;
          failure_class?: string | null;
          id?: string;
          observation_type?: string;
          observation_value?: NonNullable<Json>;
          project_entity_id?: string;
          ttl_expires_at?: string | null;
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_observations_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          index_status: string;
          name: string;
          overview: string | null;
          slug: string;
          updated_at: string;
          why_matters: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          index_status?: string;
          name: string;
          overview?: string | null;
          slug: string;
          updated_at?: string;
          why_matters?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          index_status?: string;
          name?: string;
          overview?: string | null;
          slug?: string;
          updated_at?: string;
          why_matters?: string | null;
        };
        Relationships: [];
      };
      charts_applications: {
        Row: {
          created_at: string;
          demo: boolean;
          draft: NonNullable<Json>;
          feedback: string | null;
          id: string;
          kind: string;
          owner_id: string;
          project_id: string | null;
          reviewed_at: string | null;
          status: string;
          submitted_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          demo?: boolean;
          draft?: NonNullable<Json>;
          feedback?: string | null;
          id?: string;
          kind?: string;
          owner_id: string;
          project_id?: string | null;
          reviewed_at?: string | null;
          status?: string;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          demo?: boolean;
          draft?: NonNullable<Json>;
          feedback?: string | null;
          id?: string;
          kind?: string;
          owner_id?: string;
          project_id?: string | null;
          reviewed_at?: string | null;
          status?: string;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_applications_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_applications_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_categories: {
        Row: {
          description_en: string;
          description_zh: string;
          name_en: string;
          name_zh: string;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          description_en: string;
          description_zh: string;
          name_en: string;
          name_zh: string;
          slug: string;
        };
        Update: {
          description_en?: string;
          description_zh?: string;
          name_en?: string;
          name_zh?: string;
          slug?: string;
        };
        Relationships: [];
      };
      charts_claims: {
        Row: {
          created_at: string;
          evidence: string;
          feedback: string | null;
          id: string;
          method: string;
          owner_id: string;
          project_id: string;
          reviewed_at: string | null;
          state: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          evidence: string;
          feedback?: string | null;
          id?: string;
          method?: string;
          owner_id: string;
          project_id: string;
          reviewed_at?: string | null;
          state?: string;
        };
        Update: {
          created_at?: string;
          evidence?: string;
          feedback?: string | null;
          id?: string;
          method?: string;
          owner_id?: string;
          project_id?: string;
          reviewed_at?: string | null;
          state?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_claims_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_claims_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_contributions: {
        Row: {
          adopted_at: string;
          demo: boolean;
          eligible: boolean;
          fingerprint: string;
          id: string;
          project_id: string;
          type: string;
        };
        ComputedFields: never;
        Insert: {
          adopted_at?: string;
          demo?: boolean;
          eligible?: boolean;
          fingerprint: string;
          id?: string;
          project_id: string;
          type: string;
        };
        Update: {
          adopted_at?: string;
          demo?: boolean;
          eligible?: boolean;
          fingerprint?: string;
          id?: string;
          project_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_contributions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_contributions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_corrections: {
        Row: {
          created_at: string;
          feedback: string | null;
          id: string;
          message: string;
          owner_id: string;
          project_id: string;
          state: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          feedback?: string | null;
          id?: string;
          message: string;
          owner_id: string;
          project_id: string;
          state?: string;
        };
        Update: {
          created_at?: string;
          feedback?: string | null;
          id?: string;
          message?: string;
          owner_id?: string;
          project_id?: string;
          state?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_corrections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_corrections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_events: {
        Row: {
          created_at: string;
          excluded: boolean;
          exclusion_reason: string | null;
          id: string;
          kind: string;
          project_id: string;
          session_id: string;
          surface: string;
          visitor_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          excluded?: boolean;
          exclusion_reason?: string | null;
          id?: string;
          kind: string;
          project_id: string;
          session_id: string;
          surface: string;
          visitor_id: string;
        };
        Update: {
          created_at?: string;
          excluded?: boolean;
          exclusion_reason?: string | null;
          id?: string;
          kind?: string;
          project_id?: string;
          session_id?: string;
          surface?: string;
          visitor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_evidence: {
        Row: {
          application_id: string;
          created_at: string;
          demo: boolean;
          extracted: Json | null;
          file_hash: string;
          id: string;
          original_name: string;
          owner_id: string;
          peer_domain: string;
          raw_text: string | null;
          review_channel: string | null;
          review_note: string | null;
          review_reference: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          state: string;
          storage_path: string;
          traffic_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          application_id: string;
          created_at?: string;
          demo?: boolean;
          extracted?: Json | null;
          file_hash: string;
          id?: string;
          original_name: string;
          owner_id: string;
          peer_domain: string;
          raw_text?: string | null;
          review_channel?: string | null;
          review_note?: string | null;
          review_reference?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          state?: string;
          storage_path: string;
          traffic_id?: string | null;
        };
        Update: {
          application_id?: string;
          created_at?: string;
          demo?: boolean;
          extracted?: Json | null;
          file_hash?: string;
          id?: string;
          original_name?: string;
          owner_id?: string;
          peer_domain?: string;
          raw_text?: string | null;
          review_channel?: string | null;
          review_note?: string | null;
          review_reference?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          state?: string;
          storage_path?: string;
          traffic_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "charts_evidence_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "charts_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_evidence_traffic_id_fkey";
            columns: ["traffic_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_traffic";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_evidence_traffic_id_fkey";
            columns: ["traffic_id"];
            isOneToOne: false;
            referencedRelation: "charts_traffic";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_follows: {
        Row: {
          created_at: string;
          email_enabled: boolean;
          kind: string;
          owner_id: string;
          target: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email_enabled?: boolean;
          kind: string;
          owner_id: string;
          target: string;
        };
        Update: {
          created_at?: string;
          email_enabled?: boolean;
          kind?: string;
          owner_id?: string;
          target?: string;
        };
        Relationships: [];
      };
      charts_jobs: {
        Row: {
          attempts: number;
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          kind: string;
          locked_at: string | null;
          owner_id: string | null;
          payload: NonNullable<Json>;
          result: Json | null;
          run_after: string;
          state: string;
        };
        ComputedFields: never;
        Insert: {
          attempts?: number;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          kind: string;
          locked_at?: string | null;
          owner_id?: string | null;
          payload: NonNullable<Json>;
          result?: Json | null;
          run_after?: string;
          state?: string;
        };
        Update: {
          attempts?: number;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          kind?: string;
          locked_at?: string | null;
          owner_id?: string | null;
          payload?: NonNullable<Json>;
          result?: Json | null;
          run_after?: string;
          state?: string;
        };
        Relationships: [];
      };
      charts_notifications: {
        Row: {
          body_en: string;
          body_zh: string;
          created_at: string;
          dedupe_key: string;
          email_sent_at: string | null;
          href: string;
          id: string;
          owner_id: string;
          seen: boolean;
          title_en: string;
          title_zh: string;
        };
        ComputedFields: never;
        Insert: {
          body_en: string;
          body_zh: string;
          created_at?: string;
          dedupe_key: string;
          email_sent_at?: string | null;
          href: string;
          id?: string;
          owner_id: string;
          seen?: boolean;
          title_en: string;
          title_zh: string;
        };
        Update: {
          body_en?: string;
          body_zh?: string;
          created_at?: string;
          dedupe_key?: string;
          email_sent_at?: string | null;
          href?: string;
          id?: string;
          owner_id?: string;
          seen?: boolean;
          title_en?: string;
          title_zh?: string;
        };
        Relationships: [];
      };
      charts_projects: {
        Row: {
          category: string | null;
          collected_at: string;
          controller_id: string | null;
          demo: boolean;
          description_en: string;
          description_zh: string;
          domain: string;
          enrolled_at: string | null;
          id: string;
          measurement_domain: string;
          name: string;
          official_source: string | null;
          price_type: string;
          price_verified: boolean;
          publication: string;
          slug: string;
          source_checked_at: string | null;
          updated_at: string;
          website_url: string;
        };
        ComputedFields: never;
        Insert: {
          category?: string | null;
          collected_at?: string;
          controller_id?: string | null;
          demo?: boolean;
          description_en?: string;
          description_zh?: string;
          domain: string;
          enrolled_at?: string | null;
          id?: string;
          measurement_domain: string;
          name: string;
          official_source?: string | null;
          price_type?: string;
          price_verified?: boolean;
          publication?: string;
          slug: string;
          source_checked_at?: string | null;
          updated_at?: string;
          website_url: string;
        };
        Update: {
          category?: string | null;
          collected_at?: string;
          controller_id?: string | null;
          demo?: boolean;
          description_en?: string;
          description_zh?: string;
          domain?: string;
          enrolled_at?: string | null;
          id?: string;
          measurement_domain?: string;
          name?: string;
          official_source?: string | null;
          price_type?: string;
          price_verified?: boolean;
          publication?: string;
          slug?: string;
          source_checked_at?: string | null;
          updated_at?: string;
          website_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_projects_category_fkey";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "charts_categories";
            referencedColumns: ["slug"];
          },
        ];
      };
      charts_recommendations: {
        Row: {
          context: string;
          day: string;
          demo: boolean;
          id: string;
          project_id: string;
          reason: string;
          slot: number;
        };
        ComputedFields: never;
        Insert: {
          context: string;
          day: string;
          demo?: boolean;
          id?: string;
          project_id: string;
          reason: string;
          slot: number;
        };
        Update: {
          context?: string;
          day?: string;
          demo?: boolean;
          id?: string;
          project_id?: string;
          reason?: string;
          slot?: number;
        };
        Relationships: [
          {
            foreignKeyName: "charts_recommendations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_recommendations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_relations: {
        Row: {
          application_id: string;
          feedback: string | null;
          id: string;
          peer_domain: string;
          peer_name: string;
          project_id: string | null;
          rationale: string;
          status: string;
          task: string;
        };
        ComputedFields: never;
        Insert: {
          application_id: string;
          feedback?: string | null;
          id?: string;
          peer_domain: string;
          peer_name: string;
          project_id?: string | null;
          rationale: string;
          status?: string;
          task: string;
        };
        Update: {
          application_id?: string;
          feedback?: string | null;
          id?: string;
          peer_domain?: string;
          peer_name?: string;
          project_id?: string | null;
          rationale?: string;
          status?: string;
          task?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charts_relations_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "charts_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_relations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_relations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_reports: {
        Row: {
          application_id: string;
          created_at: string;
          demo: boolean;
          id: string;
          owner_id: string;
          peers: NonNullable<Json>;
          project_id: string;
          share_token: string | null;
        };
        ComputedFields: never;
        Insert: {
          application_id: string;
          created_at?: string;
          demo?: boolean;
          id?: string;
          owner_id: string;
          peers: NonNullable<Json>;
          project_id: string;
          share_token?: string | null;
        };
        Update: {
          application_id?: string;
          created_at?: string;
          demo?: boolean;
          id?: string;
          owner_id?: string;
          peers?: NonNullable<Json>;
          project_id?: string;
          share_token?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "charts_reports_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "charts_applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_reports_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charts_reports_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "charts_public_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      charts_settings: {
        Row: {
          key: string;
          value: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          key: string;
          value: NonNullable<Json>;
        };
        Update: {
          key?: string;
          value?: NonNullable<Json>;
        };
        Relationships: [];
      };
      charts_snapshots: {
        Row: {
          category: string;
          correction_note: string | null;
          coverage_count: number;
          created_at: string;
          demo: boolean;
          entries: NonNullable<Json>;
          id: string;
          metric: string;
          month: string;
          scope: string;
          source: string;
          total_count: number;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          category: string;
          correction_note?: string | null;
          coverage_count: number;
          created_at?: string;
          demo?: boolean;
          entries: NonNullable<Json>;
          id?: string;
          metric: string;
          month: string;
          scope: string;
          source: string;
          total_count: number;
          version: number;
        };
        Update: {
          category?: string;
          correction_note?: string | null;
          coverage_count?: number;
          created_at?: string;
          demo?: boolean;
          entries?: NonNullable<Json>;
          id?: string;
          metric?: string;
          month?: string;
          scope?: string;
          source?: string;
          total_count?: number;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "charts_snapshots_category_fkey";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "charts_categories";
            referencedColumns: ["slug"];
          },
        ];
      };
      charts_source_months: {
        Row: {
          accepted: boolean;
          demo: boolean;
          month: string;
          published_at: string;
          reference: string;
          source: string;
        };
        ComputedFields: never;
        Insert: {
          accepted?: boolean;
          demo?: boolean;
          month: string;
          published_at: string;
          reference: string;
          source: string;
        };
        Update: {
          accepted?: boolean;
          demo?: boolean;
          month?: string;
          published_at?: string;
          reference?: string;
          source?: string;
        };
        Relationships: [];
      };
      charts_traffic: {
        Row: {
          correction_note: string | null;
          demo: boolean;
          domain: string;
          evidence_id: string | null;
          id: string;
          metric: string;
          month: string;
          review_reference: string;
          scope: string;
          source: string;
          state: string;
          value: number;
          verified_at: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          correction_note?: string | null;
          demo?: boolean;
          domain: string;
          evidence_id?: string | null;
          id?: string;
          metric?: string;
          month: string;
          review_reference: string;
          scope?: string;
          source: string;
          state?: string;
          value: number;
          verified_at?: string;
          version?: number;
        };
        Update: {
          correction_note?: string | null;
          demo?: boolean;
          domain?: string;
          evidence_id?: string | null;
          id?: string;
          metric?: string;
          month?: string;
          review_reference?: string;
          scope?: string;
          source?: string;
          state?: string;
          value?: number;
          verified_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "charts_traffic_evidence_id_fkey";
            columns: ["evidence_id"];
            isOneToOne: false;
            referencedRelation: "charts_evidence";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string;
          editorial_summary: string | null;
          id: string;
          inclusion_criteria: string | null;
          index_status: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          editorial_summary?: string | null;
          id?: string;
          inclusion_criteria?: string | null;
          index_status?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          editorial_summary?: string | null;
          id?: string;
          inclusion_criteria?: string | null;
          index_status?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversion_metric_daily_counts: {
        Row: {
          bucket_date: string;
          count_total: number;
          created_at: string;
          id: string;
          metric_key: string;
          surface: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          bucket_date?: string;
          count_total?: number;
          created_at?: string;
          id?: string;
          metric_key: string;
          surface: string;
          updated_at?: string;
        };
        Update: {
          bucket_date?: string;
          count_total?: number;
          created_at?: string;
          id?: string;
          metric_key?: string;
          surface?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversion_pivot_gate_snapshots: {
        Row: {
          created_at: string;
          day_mark: number;
          geo_checker_run_count: number;
          id: string;
          project_claim_count: number;
          project_submission_count: number;
          report_view_count: number;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          day_mark: number;
          geo_checker_run_count?: number;
          id?: string;
          project_claim_count?: number;
          project_submission_count?: number;
          report_view_count?: number;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          day_mark?: number;
          geo_checker_run_count?: number;
          id?: string;
          project_claim_count?: number;
          project_submission_count?: number;
          report_view_count?: number;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      editorial_drafts: {
        Row: {
          created_at: string;
          created_by: string | null;
          draft_growth_opportunity: string | null;
          draft_note: string;
          draft_source_summary: NonNullable<Json>;
          draft_title: string | null;
          id: string;
          project_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_note: string | null;
          source_job_id: string | null;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          draft_growth_opportunity?: string | null;
          draft_note: string;
          draft_source_summary?: NonNullable<Json>;
          draft_title?: string | null;
          id?: string;
          project_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_note?: string | null;
          source_job_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          draft_growth_opportunity?: string | null;
          draft_note?: string;
          draft_source_summary?: NonNullable<Json>;
          draft_title?: string | null;
          id?: string;
          project_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_note?: string | null;
          source_job_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "editorial_drafts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "editorial_drafts_source_job_id_fkey";
            columns: ["source_job_id"];
            isOneToOne: false;
            referencedRelation: "project_editorial_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      external_project_imports: {
        Row: {
          created_at: string;
          id: string;
          import_fingerprint: string | null;
          import_payload: NonNullable<Json>;
          last_imported_at: string | null;
          normalized_project_id: string | null;
          quarantine_details: NonNullable<Json>;
          quarantine_reason_code: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_notes: string | null;
          source_name: string;
          source_url: string | null;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          import_fingerprint?: string | null;
          import_payload: NonNullable<Json>;
          last_imported_at?: string | null;
          normalized_project_id?: string | null;
          quarantine_details?: NonNullable<Json>;
          quarantine_reason_code?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          source_name: string;
          source_url?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          import_fingerprint?: string | null;
          import_payload?: NonNullable<Json>;
          last_imported_at?: string | null;
          normalized_project_id?: string | null;
          quarantine_details?: NonNullable<Json>;
          quarantine_reason_code?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          source_name?: string;
          source_url?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "external_project_imports_normalized_project_id_fkey";
            columns: ["normalized_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          is_sent: boolean;
          payload: NonNullable<Json>;
          recipient_hint: string | null;
          request_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          is_sent?: boolean;
          payload?: NonNullable<Json>;
          recipient_hint?: string | null;
          request_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          is_sent?: boolean;
          payload?: NonNullable<Json>;
          recipient_hint?: string | null;
          request_id?: string | null;
        };
        Relationships: [];
      };
      project_alternative_candidates: {
        Row: {
          canonical_pair_key: string;
          created_at: string;
          id: string;
          review_state: string;
          source_project_entity_id: string;
          target_project_entity_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          canonical_pair_key: string;
          created_at?: string;
          id?: string;
          review_state?: string;
          source_project_entity_id: string;
          target_project_entity_id: string;
          updated_at?: string;
        };
        Update: {
          canonical_pair_key?: string;
          created_at?: string;
          id?: string;
          review_state?: string;
          source_project_entity_id?: string;
          target_project_entity_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_alternative_candidates_source_project_entity_id_fkey";
            columns: ["source_project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_alternative_candidates_target_project_entity_id_fkey";
            columns: ["target_project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      project_badges: {
        Row: {
          awarded_at: string;
          badge_type: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          project_id: string;
          revoked_at: string | null;
          revoked_reason: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          awarded_at?: string;
          badge_type: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          project_id: string;
          revoked_at?: string | null;
          revoked_reason?: string | null;
          updated_at?: string;
        };
        Update: {
          awarded_at?: string;
          badge_type?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          project_id?: string;
          revoked_at?: string | null;
          revoked_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_badges_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_changelog_entries: {
        Row: {
          affects_signal_score: boolean;
          affects_source_confidence: boolean;
          body: string;
          change_type: string;
          created_at: string;
          id: string;
          project_id: string;
          public_visible: boolean;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          source_summary: NonNullable<Json>;
          status: string;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          affects_signal_score?: boolean;
          affects_source_confidence?: boolean;
          body: string;
          change_type: string;
          created_at?: string;
          id?: string;
          project_id: string;
          public_visible?: boolean;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          source_summary?: NonNullable<Json>;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          affects_signal_score?: boolean;
          affects_source_confidence?: boolean;
          body?: string;
          change_type?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
          public_visible?: boolean;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          source_summary?: NonNullable<Json>;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_changelog_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_claims: {
        Row: {
          claim_evidence: string | null;
          claim_method: string;
          created_at: string;
          id: string;
          project_id: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_notes: string | null;
          status: string;
          submission_id: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          claim_evidence?: string | null;
          claim_method: string;
          created_at?: string;
          id?: string;
          project_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          submission_id?: string | null;
          updated_at?: string;
        };
        Update: {
          claim_evidence?: string | null;
          claim_method?: string;
          created_at?: string;
          id?: string;
          project_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          submission_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_claims_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_claims_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "project_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      project_collection_links: {
        Row: {
          collection_slug: string;
          created_at: string;
          id: string;
          project_entity_id: string;
          review_state: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          collection_slug: string;
          created_at?: string;
          id?: string;
          project_entity_id: string;
          review_state?: string;
          updated_at?: string;
        };
        Update: {
          collection_slug?: string;
          created_at?: string;
          id?: string;
          project_entity_id?: string;
          review_state?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_collection_links_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      project_consents: {
        Row: {
          ad_readiness_scan: boolean;
          consented_at: string;
          created_at: string;
          future_mcp_exposure: boolean;
          future_verified_data_contact: boolean;
          github_signal_scan: boolean;
          id: string;
          project_id: string;
          public_api_exposure: boolean;
          public_pricing_scan: boolean;
          public_website_scan: boolean;
          structured_profile_exposure: boolean;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          ad_readiness_scan?: boolean;
          consented_at?: string;
          created_at?: string;
          future_mcp_exposure?: boolean;
          future_verified_data_contact?: boolean;
          github_signal_scan?: boolean;
          id?: string;
          project_id: string;
          public_api_exposure?: boolean;
          public_pricing_scan?: boolean;
          public_website_scan?: boolean;
          structured_profile_exposure?: boolean;
          updated_at?: string;
        };
        Update: {
          ad_readiness_scan?: boolean;
          consented_at?: string;
          created_at?: string;
          future_mcp_exposure?: boolean;
          future_verified_data_contact?: boolean;
          github_signal_scan?: boolean;
          id?: string;
          project_id?: string;
          public_api_exposure?: boolean;
          public_pricing_scan?: boolean;
          public_website_scan?: boolean;
          structured_profile_exposure?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_consents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_editorial_jobs: {
        Row: {
          created_at: string;
          draft_ad_readiness_note: string | null;
          draft_editorial_note: string | null;
          draft_growth_opportunity: string | null;
          draft_seo_gap_note: string | null;
          hallucination_risk: string | null;
          human_approved_at: string | null;
          human_approved_by: string | null;
          id: string;
          input_snapshot: Json | null;
          model_name: string | null;
          model_provider: string | null;
          project_id: string;
          prompt_version: string | null;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          draft_ad_readiness_note?: string | null;
          draft_editorial_note?: string | null;
          draft_growth_opportunity?: string | null;
          draft_seo_gap_note?: string | null;
          hallucination_risk?: string | null;
          human_approved_at?: string | null;
          human_approved_by?: string | null;
          id?: string;
          input_snapshot?: Json | null;
          model_name?: string | null;
          model_provider?: string | null;
          project_id: string;
          prompt_version?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          draft_ad_readiness_note?: string | null;
          draft_editorial_note?: string | null;
          draft_growth_opportunity?: string | null;
          draft_seo_gap_note?: string | null;
          hallucination_risk?: string | null;
          human_approved_at?: string | null;
          human_approved_by?: string | null;
          id?: string;
          input_snapshot?: Json | null;
          model_name?: string | null;
          model_provider?: string | null;
          project_id?: string;
          prompt_version?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_editorial_jobs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_entities: {
        Row: {
          collection_tags: string[];
          created_at: string;
          display_name: string;
          id: string;
          lifecycle_status: string;
          normalized_name: string;
          open_source_or_commercial: string;
          organization_name: string | null;
          primary_category: string | null;
          product_name: string | null;
          review_state: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          collection_tags?: string[];
          created_at?: string;
          display_name: string;
          id?: string;
          lifecycle_status?: string;
          normalized_name: string;
          open_source_or_commercial?: string;
          organization_name?: string | null;
          primary_category?: string | null;
          product_name?: string | null;
          review_state?: string;
          updated_at?: string;
        };
        Update: {
          collection_tags?: string[];
          created_at?: string;
          display_name?: string;
          id?: string;
          lifecycle_status?: string;
          normalized_name?: string;
          open_source_or_commercial?: string;
          organization_name?: string | null;
          primary_category?: string | null;
          product_name?: string | null;
          review_state?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_lifecycle_events: {
        Row: {
          created_at: string;
          from_status: string;
          id: string;
          performed_at: string;
          performed_by: string | null;
          project_id: string;
          reason: string | null;
          to_status: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          from_status: string;
          id?: string;
          performed_at?: string;
          performed_by?: string | null;
          project_id: string;
          reason?: string | null;
          to_status: string;
        };
        Update: {
          created_at?: string;
          from_status?: string;
          id?: string;
          performed_at?: string;
          performed_by?: string | null;
          project_id?: string;
          reason?: string | null;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_lifecycle_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_lifecycle_snapshots: {
        Row: {
          archive_status: string;
          created_at: string;
          id: string;
          index_status: string;
          previous_status: string;
          private_payload_included: boolean;
          project_id: string;
          public_record_action: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          snapshot_payload: NonNullable<Json>;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          archive_status: string;
          created_at?: string;
          id?: string;
          index_status?: string;
          previous_status: string;
          private_payload_included?: boolean;
          project_id: string;
          public_record_action?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          snapshot_payload?: NonNullable<Json>;
          updated_at?: string;
        };
        Update: {
          archive_status?: string;
          created_at?: string;
          id?: string;
          index_status?: string;
          previous_status?: string;
          private_payload_included?: boolean;
          project_id?: string;
          public_record_action?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          snapshot_payload?: NonNullable<Json>;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_lifecycle_snapshots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_raw_payloads: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          project_source_id: string;
          raw_pointer: string | null;
          raw_size_bytes: number | null;
          raw_summary: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          project_source_id: string;
          raw_pointer?: string | null;
          raw_size_bytes?: number | null;
          raw_summary?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          project_source_id?: string;
          raw_pointer?: string | null;
          raw_size_bytes?: number | null;
          raw_summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_raw_payloads_project_source_id_fkey";
            columns: ["project_source_id"];
            isOneToOne: false;
            referencedRelation: "project_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      project_score_snapshots: {
        Row: {
          calculation_version: string;
          commercial_readiness: number;
          created_at: string;
          dev_momentum: number;
          id: string;
          market_presence: number;
          product_readiness: number;
          project_id: string;
          seo_foundation: number;
          signal_score: number;
          snapshot_taken_at: string;
          source_confidence: string;
          trust_confidence: number;
        };
        ComputedFields: never;
        Insert: {
          calculation_version?: string;
          commercial_readiness?: number;
          created_at?: string;
          dev_momentum?: number;
          id?: string;
          market_presence?: number;
          product_readiness?: number;
          project_id: string;
          seo_foundation?: number;
          signal_score?: number;
          snapshot_taken_at?: string;
          source_confidence: string;
          trust_confidence?: number;
        };
        Update: {
          calculation_version?: string;
          commercial_readiness?: number;
          created_at?: string;
          dev_momentum?: number;
          id?: string;
          market_presence?: number;
          product_readiness?: number;
          project_id?: string;
          seo_foundation?: number;
          signal_score?: number;
          snapshot_taken_at?: string;
          source_confidence?: string;
          trust_confidence?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_score_snapshots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_scores: {
        Row: {
          calculated_at: string;
          calculation_version: string;
          commercial_readiness: number;
          created_at: string;
          dev_momentum: number;
          id: string;
          market_presence: number;
          missing_sources: number;
          product_readiness: number;
          project_id: string;
          seo_foundation: number;
          signal_score: number;
          source_confidence: string;
          stale_sources: number;
          trust_confidence: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          calculated_at?: string;
          calculation_version?: string;
          commercial_readiness?: number;
          created_at?: string;
          dev_momentum?: number;
          id?: string;
          market_presence?: number;
          missing_sources?: number;
          product_readiness?: number;
          project_id: string;
          seo_foundation?: number;
          signal_score?: number;
          source_confidence?: string;
          stale_sources?: number;
          trust_confidence?: number;
          updated_at?: string;
        };
        Update: {
          calculated_at?: string;
          calculation_version?: string;
          commercial_readiness?: number;
          created_at?: string;
          dev_momentum?: number;
          id?: string;
          market_presence?: number;
          missing_sources?: number;
          product_readiness?: number;
          project_id?: string;
          seo_foundation?: number;
          signal_score?: number;
          source_confidence?: string;
          stale_sources?: number;
          trust_confidence?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_scores_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_source_snapshots: {
        Row: {
          created_at: string;
          id: string;
          is_current: boolean;
          normalized_payload: NonNullable<Json>;
          project_source_id: string;
          snapshot_taken_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          is_current?: boolean;
          normalized_payload: NonNullable<Json>;
          project_source_id: string;
          snapshot_taken_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_current?: boolean;
          normalized_payload?: NonNullable<Json>;
          project_source_id?: string;
          snapshot_taken_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_source_snapshots_project_source_id_fkey";
            columns: ["project_source_id"];
            isOneToOne: false;
            referencedRelation: "project_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      project_sources: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          is_stale: boolean;
          last_fetched_at: string | null;
          last_success_at: string | null;
          project_id: string;
          source_type: string;
          source_url: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_stale?: boolean;
          last_fetched_at?: string | null;
          last_success_at?: string | null;
          project_id: string;
          source_type: string;
          source_url: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_stale?: boolean;
          last_fetched_at?: string | null;
          last_success_at?: string | null;
          project_id?: string;
          source_type?: string;
          source_url?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_sources_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_structured_profiles: {
        Row: {
          created_at: string;
          human_approved_at: string | null;
          id: string;
          pricing_model: string | null;
          project_id: string;
          public_sources: NonNullable<Json>;
          same_as_urls: NonNullable<Json>;
          schema_type: string;
          source_confidence: string;
          structured_data_json: NonNullable<Json>;
          target_users: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          human_approved_at?: string | null;
          id?: string;
          pricing_model?: string | null;
          project_id: string;
          public_sources?: NonNullable<Json>;
          same_as_urls?: NonNullable<Json>;
          schema_type?: string;
          source_confidence?: string;
          structured_data_json?: NonNullable<Json>;
          target_users?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          human_approved_at?: string | null;
          id?: string;
          pricing_model?: string | null;
          project_id?: string;
          public_sources?: NonNullable<Json>;
          same_as_urls?: NonNullable<Json>;
          schema_type?: string;
          source_confidence?: string;
          structured_data_json?: NonNullable<Json>;
          target_users?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_structured_profiles_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_submissions: {
        Row: {
          category_slug: string | null;
          created_at: string;
          github_url: string | null;
          id: string;
          name: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_notes: string | null;
          status: string;
          submitter_note: string | null;
          tagline: string | null;
          updated_at: string;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          category_slug?: string | null;
          created_at?: string;
          github_url?: string | null;
          id?: string;
          name: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          submitter_note?: string | null;
          tagline?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          category_slug?: string | null;
          created_at?: string;
          github_url?: string | null;
          id?: string;
          name?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes?: string | null;
          status?: string;
          submitter_note?: string | null;
          tagline?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          category_id: string | null;
          claim_status: string;
          created_at: string;
          docs_url: string | null;
          founder_name: string | null;
          founder_social_url: string | null;
          github_url: string | null;
          id: string;
          index_status: string;
          launch_url: string | null;
          name: string;
          slug: string;
          status: string;
          tagline: string | null;
          updated_at: string;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          category_id?: string | null;
          claim_status?: string;
          created_at?: string;
          docs_url?: string | null;
          founder_name?: string | null;
          founder_social_url?: string | null;
          github_url?: string | null;
          id?: string;
          index_status?: string;
          launch_url?: string | null;
          name: string;
          slug: string;
          status?: string;
          tagline?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          category_id?: string | null;
          claim_status?: string;
          created_at?: string;
          docs_url?: string | null;
          founder_name?: string | null;
          founder_social_url?: string | null;
          github_url?: string | null;
          id?: string;
          index_status?: string;
          launch_url?: string | null;
          name?: string;
          slug?: string;
          status?: string;
          tagline?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      published_projections: {
        Row: {
          collection_tags: string[];
          created_at: string;
          docs_url: string | null;
          github_url: string | null;
          id: string;
          last_reviewed_at: string;
          lifecycle_status: string;
          official_website_url: string;
          open_source_or_commercial: string;
          original_summary: string;
          primary_category: string;
          project_entity_id: string;
          project_name: string;
          public_signal_chips: NonNullable<Json>;
          seo_indexable: boolean;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          collection_tags?: string[];
          created_at?: string;
          docs_url?: string | null;
          github_url?: string | null;
          id?: string;
          last_reviewed_at: string;
          lifecycle_status?: string;
          official_website_url: string;
          open_source_or_commercial: string;
          original_summary: string;
          primary_category: string;
          project_entity_id: string;
          project_name: string;
          public_signal_chips?: NonNullable<Json>;
          seo_indexable?: boolean;
          slug: string;
          updated_at?: string;
        };
        Update: {
          collection_tags?: string[];
          created_at?: string;
          docs_url?: string | null;
          github_url?: string | null;
          id?: string;
          last_reviewed_at?: string;
          lifecycle_status?: string;
          official_website_url?: string;
          open_source_or_commercial?: string;
          original_summary?: string;
          primary_category?: string;
          project_entity_id?: string;
          project_name?: string;
          public_signal_chips?: NonNullable<Json>;
          seo_indexable?: boolean;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "published_projections_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: true;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      repo_assets: {
        Row: {
          created_at: string;
          github_url: string | null;
          id: string;
          project_entity_id: string;
          repo_name: string | null;
          repo_owner: string | null;
          repo_relationship: string;
          repo_visibility: string;
          source_evidence_id: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          github_url?: string | null;
          id?: string;
          project_entity_id: string;
          repo_name?: string | null;
          repo_owner?: string | null;
          repo_relationship?: string;
          repo_visibility?: string;
          source_evidence_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          github_url?: string | null;
          id?: string;
          project_entity_id?: string;
          repo_name?: string | null;
          repo_owner?: string | null;
          repo_relationship?: string;
          repo_visibility?: string;
          source_evidence_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "repo_assets_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "repo_assets_source_evidence_id_fkey";
            columns: ["source_evidence_id"];
            isOneToOne: false;
            referencedRelation: "source_evidences";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          executive_summary: string | null;
          id: string;
          index_status: string;
          report_date: string;
          slug: string;
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          executive_summary?: string | null;
          id?: string;
          index_status?: string;
          report_date?: string;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          executive_summary?: string | null;
          id?: string;
          index_status?: string;
          report_date?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      review_decisions: {
        Row: {
          created_at: string;
          decision: string;
          decision_reason: string | null;
          id: string;
          project_entity_id: string;
          review_state: string;
          reviewed_fields: NonNullable<Json>;
          reviewer_ref: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          decision: string;
          decision_reason?: string | null;
          id?: string;
          project_entity_id: string;
          review_state: string;
          reviewed_fields?: NonNullable<Json>;
          reviewer_ref?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          decision?: string;
          decision_reason?: string | null;
          id?: string;
          project_entity_id?: string;
          review_state?: string;
          reviewed_fields?: NonNullable<Json>;
          reviewer_ref?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_decisions_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      scouted_profile_intents: {
        Row: {
          created_at: string;
          id: string;
          intent_type: string;
          payload_summary: NonNullable<Json>;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_note: string | null;
          scouted_profile_id: string;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          intent_type: string;
          payload_summary?: NonNullable<Json>;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_note?: string | null;
          scouted_profile_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          intent_type?: string;
          payload_summary?: NonNullable<Json>;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_note?: string | null;
          scouted_profile_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scouted_profile_intents_scouted_profile_id_fkey";
            columns: ["scouted_profile_id"];
            isOneToOne: false;
            referencedRelation: "scouted_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      scouted_profiles: {
        Row: {
          created_at: string;
          github_url: string | null;
          id: string;
          index_status: string;
          name: string;
          observed_source_urls: string[];
          project_id: string | null;
          public_summary: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          slug: string;
          source_snapshot: NonNullable<Json>;
          status: string;
          updated_at: string;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          github_url?: string | null;
          id?: string;
          index_status?: string;
          name: string;
          observed_source_urls?: string[];
          project_id?: string | null;
          public_summary?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          slug: string;
          source_snapshot?: NonNullable<Json>;
          status?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          created_at?: string;
          github_url?: string | null;
          id?: string;
          index_status?: string;
          name?: string;
          observed_source_urls?: string[];
          project_id?: string | null;
          public_summary?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          slug?: string;
          source_snapshot?: NonNullable<Json>;
          status?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "scouted_profiles_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      signal_alert_rules: {
        Row: {
          alert_type: string;
          created_at: string;
          external_delivery_allowed: boolean;
          id: string;
          last_evaluated_at: string | null;
          private_contact_payload: Json | null;
          project_id: string;
          status: string;
          transport: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          alert_type: string;
          created_at?: string;
          external_delivery_allowed?: boolean;
          id?: string;
          last_evaluated_at?: string | null;
          private_contact_payload?: Json | null;
          project_id: string;
          status?: string;
          transport?: string;
          updated_at?: string;
        };
        Update: {
          alert_type?: string;
          created_at?: string;
          external_delivery_allowed?: boolean;
          id?: string;
          last_evaluated_at?: string | null;
          private_contact_payload?: Json | null;
          project_id?: string;
          status?: string;
          transport?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "signal_alert_rules_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      source_evidences: {
        Row: {
          claim_boundary: string;
          created_at: string;
          evidence_hash: string;
          id: string;
          is_official_source: boolean;
          observed_at: string;
          project_entity_id: string | null;
          source_role: string;
          source_type: string;
          source_url: string;
          updated_at: string;
          visibility: string;
        };
        ComputedFields: never;
        Insert: {
          claim_boundary?: string;
          created_at?: string;
          evidence_hash: string;
          id?: string;
          is_official_source?: boolean;
          observed_at: string;
          project_entity_id?: string | null;
          source_role?: string;
          source_type?: string;
          source_url: string;
          updated_at?: string;
          visibility?: string;
        };
        Update: {
          claim_boundary?: string;
          created_at?: string;
          evidence_hash?: string;
          id?: string;
          is_official_source?: boolean;
          observed_at?: string;
          project_entity_id?: string | null;
          source_role?: string;
          source_type?: string;
          source_url?: string;
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_evidences_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      source_refresh_jobs: {
        Row: {
          attempts: number;
          created_at: string;
          finished_at: string | null;
          id: string;
          job_type: string;
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          max_attempts: number;
          priority: number;
          project_source_id: string;
          result: Json | null;
          run_after: string;
          started_at: string | null;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          attempts?: number;
          created_at?: string;
          finished_at?: string | null;
          id?: string;
          job_type: string;
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          max_attempts?: number;
          priority?: number;
          project_source_id: string;
          result?: Json | null;
          run_after?: string;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          created_at?: string;
          finished_at?: string | null;
          id?: string;
          job_type?: string;
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          max_attempts?: number;
          priority?: number;
          project_source_id?: string;
          result?: Json | null;
          run_after?: string;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_refresh_jobs_project_source_id_fkey";
            columns: ["project_source_id"];
            isOneToOne: false;
            referencedRelation: "project_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      system_budgets: {
        Row: {
          budget_name: string;
          created_at: string;
          current_usage: number;
          daily_limit: number;
          is_exhausted: boolean;
          last_reset_date: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          budget_name: string;
          created_at?: string;
          current_usage?: number;
          daily_limit?: number;
          is_exhausted?: boolean;
          last_reset_date?: string;
          updated_at?: string;
        };
        Update: {
          budget_name?: string;
          created_at?: string;
          current_usage?: number;
          daily_limit?: number;
          is_exhausted?: boolean;
          last_reset_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_flags: {
        Row: {
          created_at: string;
          description: string | null;
          enabled: boolean;
          flag_name: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          flag_name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          flag_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      web_assets: {
        Row: {
          asset_role: string;
          created_at: string;
          domain: string;
          id: string;
          is_official: boolean;
          project_entity_id: string;
          source_evidence_id: string | null;
          updated_at: string;
          url: string;
        };
        ComputedFields: never;
        Insert: {
          asset_role?: string;
          created_at?: string;
          domain: string;
          id?: string;
          is_official?: boolean;
          project_entity_id: string;
          source_evidence_id?: string | null;
          updated_at?: string;
          url: string;
        };
        Update: {
          asset_role?: string;
          created_at?: string;
          domain?: string;
          id?: string;
          is_official?: boolean;
          project_entity_id?: string;
          source_evidence_id?: string | null;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "web_assets_project_entity_id_fkey";
            columns: ["project_entity_id"];
            isOneToOne: false;
            referencedRelation: "project_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "web_assets_source_evidence_id_fkey";
            columns: ["source_evidence_id"];
            isOneToOne: false;
            referencedRelation: "source_evidences";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      charts_public_projects: {
        Row: {
          category: string | null;
          collected_at: string | null;
          demo: boolean | null;
          description_en: string | null;
          description_zh: string | null;
          domain: string | null;
          enrolled_at: string | null;
          id: string | null;
          measurement_domain: string | null;
          name: string | null;
          official_source: string | null;
          price_type: string | null;
          price_verified: boolean | null;
          publication: string | null;
          slug: string | null;
          source_checked_at: string | null;
          updated_at: string | null;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          category?: string | null;
          collected_at?: string | null;
          demo?: boolean | null;
          description_en?: string | null;
          description_zh?: string | null;
          domain?: string | null;
          enrolled_at?: string | null;
          id?: string | null;
          measurement_domain?: string | null;
          name?: string | null;
          official_source?: string | null;
          price_type?: string | null;
          price_verified?: boolean | null;
          publication?: string | null;
          slug?: string | null;
          source_checked_at?: string | null;
          updated_at?: string | null;
          website_url?: string | null;
        };
        Update: {
          category?: string | null;
          collected_at?: string | null;
          demo?: boolean | null;
          description_en?: string | null;
          description_zh?: string | null;
          domain?: string | null;
          enrolled_at?: string | null;
          id?: string | null;
          measurement_domain?: string | null;
          name?: string | null;
          official_source?: string | null;
          price_type?: string | null;
          price_verified?: boolean | null;
          publication?: string | null;
          slug?: string | null;
          source_checked_at?: string | null;
          updated_at?: string | null;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "charts_projects_category_fkey";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "charts_categories";
            referencedColumns: ["slug"];
          },
        ];
      };
      charts_public_traffic: {
        Row: {
          correction_note: string | null;
          demo: boolean | null;
          domain: string | null;
          id: string | null;
          metric: string | null;
          month: string | null;
          scope: string | null;
          source: string | null;
          state: string | null;
          value: number | null;
          verified_at: string | null;
          version: number | null;
        };
        ComputedFields: never;
        Insert: {
          correction_note?: string | null;
          demo?: boolean | null;
          domain?: string | null;
          id?: string | null;
          metric?: string | null;
          month?: string | null;
          scope?: string | null;
          source?: string | null;
          state?: string | null;
          value?: number | null;
          verified_at?: string | null;
          version?: number | null;
        };
        Update: {
          correction_note?: string | null;
          demo?: boolean | null;
          domain?: string | null;
          id?: string | null;
          metric?: string | null;
          month?: string | null;
          scope?: string | null;
          source?: string | null;
          state?: string | null;
          value?: number | null;
          verified_at?: string | null;
          version?: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      charts_adopt_contribution: {
        Args: { fp: string; is_demo: boolean; kind: string; pid: string };
        Returns: undefined;
      };
      charts_approve_application: {
        Args: { actor: string; aid: string };
        Returns: string;
      };
      charts_claim_job: {
        Args: Record<PropertyKey, never>;
        Returns: {
          attempts: number;
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          kind: string;
          locked_at: string | null;
          owner_id: string | null;
          payload: NonNullable<Json>;
          result: Json | null;
          run_after: string;
          state: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "charts_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      charts_review_decision: {
        Args: {
          decision: string;
          feedback_text: string;
          item_id: string;
          kind: string;
          patch?: Json;
        };
        Returns: undefined;
      };
      charts_save_draft: {
        Args: {
          actor: string;
          aid: string;
          d: Json;
          is_demo: boolean;
          update_project?: string;
        };
        Returns: {
          created_at: string;
          demo: boolean;
          draft: NonNullable<Json>;
          feedback: string | null;
          id: string;
          kind: string;
          owner_id: string;
          project_id: string | null;
          reviewed_at: string | null;
          status: string;
          submitted_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "charts_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      charts_verify_evidence: {
        Args: {
          actor: string;
          channel: string;
          eid: string;
          fields: Json;
          note: string;
          reference: string;
          revision?: boolean;
        };
        Returns: Json;
      };
      claim_source_refresh_jobs: {
        Args: { batch_size?: number; worker_id?: string };
        Returns: {
          attempts: number;
          created_at: string;
          finished_at: string | null;
          id: string;
          job_type: string;
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          max_attempts: number;
          priority: number;
          project_source_id: string;
          result: Json | null;
          run_after: string;
          started_at: string | null;
          status: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "source_refresh_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
