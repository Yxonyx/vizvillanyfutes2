// =====================================================
// VizVillanyFutes Backend - TypeScript Types
// Auto-generated types for Supabase database
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =====================================================
// Database Schema Types
// =====================================================
export interface Database {
  public: {
    Tables: {
      user_meta: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      contractor_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          phone: string;
          type: ContractorType;
          legal_name: string | null;
          tax_number: string | null;
          company_registration: string | null;
          trades: Trade[];
          service_areas: string[];
          years_experience: number | null;
          is_employee: boolean;
          status: ContractorStatus;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name: string;
          phone: string;
          type?: ContractorType;
          legal_name?: string | null;
          tax_number?: string | null;
          company_registration?: string | null;
          trades: Trade[];
          service_areas: string[];
          years_experience?: number | null;
          is_employee?: boolean;
          status?: ContractorStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          phone?: string;
          type?: ContractorType;
          legal_name?: string | null;
          tax_number?: string | null;
          company_registration?: string | null;
          trades?: Trade[];
          service_areas?: string[];
          years_experience?: number | null;
          is_employee?: boolean;
          status?: ContractorStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          type: CustomerType;
          full_name: string;
          phone: string;
          email: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: CustomerType;
          full_name: string;
          phone: string;
          email?: string | null;
          company_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: CustomerType;
          full_name?: string;
          phone?: string;
          email?: string | null;
          company_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          city: string;
          district: string | null;
          postal_code: string | null;
          street: string;
          house_number: string;
          floor_door: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          city: string;
          district?: string | null;
          postal_code?: string | null;
          street: string;
          house_number: string;
          floor_door?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          city?: string;
          district?: string | null;
          postal_code?: string | null;
          street?: string;
          house_number?: string;
          floor_door?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          customer_id: string;
          address_id: string;
          source: JobSource;
          trade: Trade;
          category: JobCategory;
          title: string;
          description: string;
          status: JobStatus;
          priority: JobPriority;
          preferred_time_from: string | null;
          preferred_time_to: string | null;
          estimated_price_gross: number | null;
          final_price_gross: number | null;
          currency: string;
          dispatcher_notes: string | null;
          created_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          address_id: string;
          source?: JobSource;
          trade: Trade;
          category?: JobCategory;
          title: string;
          description: string;
          status?: JobStatus;
          priority?: JobPriority;
          preferred_time_from?: string | null;
          preferred_time_to?: string | null;
          estimated_price_gross?: number | null;
          final_price_gross?: number | null;
          currency?: string;
          dispatcher_notes?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          address_id?: string;
          source?: JobSource;
          trade?: Trade;
          category?: JobCategory;
          title?: string;
          description?: string;
          status?: JobStatus;
          priority?: JobPriority;
          preferred_time_from?: string | null;
          preferred_time_to?: string | null;
          estimated_price_gross?: number | null;
          final_price_gross?: number | null;
          currency?: string;
          dispatcher_notes?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_assignments: {
        Row: {
          id: string;
          job_id: string;
          contractor_id: string;
          status: AssignmentStatus;
          proposed_start_time: string | null;
          confirmed_start_time: string | null;
          notes: string | null;
          created_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          contractor_id: string;
          status?: AssignmentStatus;
          proposed_start_time?: string | null;
          confirmed_start_time?: string | null;
          notes?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          contractor_id?: string;
          status?: AssignmentStatus;
          proposed_start_time?: string | null;
          confirmed_start_time?: string | null;
          notes?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      create_job_from_form: {
        Args: {
          p_customer_full_name: string;
          p_customer_phone: string;
          p_customer_email?: string | null;
          p_customer_type?: string;
          p_customer_company_name?: string | null;
          p_address_city?: string;
          p_address_district?: string | null;
          p_address_postal_code?: string | null;
          p_address_street?: string | null;
          p_address_house_number?: string | null;
          p_address_floor_door?: string | null;
          p_address_notes?: string | null;
          p_job_trade?: string;
          p_job_category?: string;
          p_job_title?: string | null;
          p_job_description?: string | null;
          p_job_priority?: string;
          p_job_preferred_time_from?: string | null;
          p_job_preferred_time_to?: string | null;
          p_job_estimated_price_gross?: number | null;
        };
        Returns: Json;
      };
      register_contractor: {
        Args: {
          p_user_id: string;
          p_display_name: string;
          p_phone: string;
          p_type?: string;
          p_legal_name?: string | null;
          p_tax_number?: string | null;
          p_company_registration?: string | null;
          p_trades?: string[];
          p_service_areas?: string[];
          p_years_experience?: number | null;
        };
        Returns: Json;
      };
      assign_job_to_contractor: {
        Args: {
          p_job_id: string;
          p_contractor_id: string;
          p_proposed_start_time?: string | null;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      contractor_respond_to_assignment: {
        Args: {
          p_assignment_id: string;
          p_action: string;
          p_confirmed_start_time?: string | null;
          p_comment?: string | null;
        };
        Returns: Json;
      };
      contractor_update_job_status: {
        Args: {
          p_job_id: string;
          p_new_status: string;
          p_final_price_gross?: number | null;
          p_note?: string | null;
        };
        Returns: Json;
      };
      approve_contractor: {
        Args: {
          p_contractor_id: string;
          p_internal_notes?: string | null;
        };
        Returns: Json;
      };
      reject_contractor: {
        Args: {
          p_contractor_id: string;
          p_internal_notes?: string | null;
        };
        Returns: Json;
      };
      is_admin_or_dispatcher: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_contractor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_contractor_profile_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Enums: {};
  };
}

// =====================================================
// Enum Types
// =====================================================
export type UserRole = 'admin' | 'dispatcher' | 'contractor';
export type UserStatus = 'active' | 'pending_approval' | 'suspended';
export type ContractorType = 'individual' | 'company';
export type ContractorStatus = 'pending_approval' | 'approved' | 'rejected';
export type CustomerType = 'b2c' | 'b2b';
export type Trade = 'viz' | 'villany' | 'futes' | 'combined';
export type JobSource = 'web_form' | 'phone' | 'email' | 'b2b';
export type JobCategory = 'sos' | 'standard' | 'b2b_project';
export type JobStatus = 'new' | 'unassigned' | 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'normal' | 'high' | 'critical';
export type AssignmentStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

// =====================================================
// Helper Types for API Requests
// =====================================================
export interface CreateJobRequest {
  customer: {
    id?: string;
    full_name: string;
    phone: string;
    email?: string;
    type?: CustomerType;
    company_name?: string;
  };
  address: {
    city?: string;
    district?: string;
    postal_code?: string;
    street: string;
    house_number: string;
    floor_door?: string;
    notes?: string;
  };
  job: {
    trade: Trade;
    category?: JobCategory;
    title: string;
    description: string;
    priority?: JobPriority;
    preferred_time_from?: string;
    preferred_time_to?: string;
    estimated_price_gross?: number;
  };
}

export interface ContractorRegistrationRequest {
  email: string;
  password: string;
  display_name: string;
  phone: string;
  type?: ContractorType;
  legal_name?: string;
  tax_number?: string;
  company_registration?: string;
  trades: Trade[];
  service_areas: string[];
  years_experience?: number;
}

export interface AssignJobRequest {
  job_id: string;
  contractor_id: string;
  proposed_start_time?: string;
  notes?: string;
}

export interface RespondToAssignmentRequest {
  assignment_id: string;
  action: 'accept' | 'decline';
  confirmed_start_time?: string;
  comment?: string;
}

export interface UpdateJobStatusRequest {
  job_id: string;
  new_status: 'in_progress' | 'completed';
  final_price_gross?: number;
  note?: string;
}

// =====================================================
// Response Types
// =====================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JobCreatedResponse {
  customer_id: string;
  address_id: string;
  job_id: string;
}

export interface ContractorRegisteredResponse {
  user_id: string;
  user_meta_id: string;
  contractor_profile_id: string;
}

// =====================================================
// Extended types with relations
// =====================================================
export type JobWithRelations = Database['public']['Tables']['jobs']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row'];
  address: Database['public']['Tables']['addresses']['Row'];
  assignments?: (Database['public']['Tables']['job_assignments']['Row'] & {
    contractor: Database['public']['Tables']['contractor_profiles']['Row'];
  })[];
};

export type ContractorWithMeta = Database['public']['Tables']['contractor_profiles']['Row'] & {
  user_meta?: Database['public']['Tables']['user_meta']['Row'];
};

// =====================================================
// Trade labels for UI
// =====================================================
export const TRADE_LABELS: Record<Trade, string> = {
  viz: 'Vízszerelés',
  villany: 'Villanyszerelés',
  futes: 'Fűtésszerelés',
  combined: 'Kombinált',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  new: 'Új',
  unassigned: 'Kiosztásra vár',
  assigned: 'Kiosztva',
  scheduled: 'Beütemezve',
  in_progress: 'Folyamatban',
  completed: 'Befejezve',
  cancelled: 'Törölve',
};

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  sos: 'SOS - Sürgős',
  standard: 'Standard',
  b2b_project: 'B2B Projekt',
};

export const JOB_PRIORITY_LABELS: Record<JobPriority, string> = {
  normal: 'Normál',
  high: 'Magas',
  critical: 'Kritikus',
};

export const CONTRACTOR_STATUS_LABELS: Record<ContractorStatus, string> = {
  pending_approval: 'Jóváhagyásra vár',
  approved: 'Jóváhagyva',
  rejected: 'Elutasítva',
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: 'Függőben',
  accepted: 'Elfogadva',
  declined: 'Elutasítva',
  cancelled: 'Törölve',
};

// Budapest districts for service areas
export const BUDAPEST_DISTRICTS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII'
];
