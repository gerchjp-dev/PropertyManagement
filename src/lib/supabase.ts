import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの変数宣言
let supabase;

// 環境変数からSupabase設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// デバッグ用（開発時のみ）
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');
}

// プレースホルダーURLをチェック
const isPlaceholderUrl = !supabaseUrl || 
  supabaseUrl.includes('your-project-id') || 
  supabaseUrl === 'https://your-project-id.supabase.co';

const isPlaceholderKey = !supabaseAnonKey || 
  supabaseAnonKey.includes('your-anon-key') || 
  supabaseAnonKey === 'your-anon-key-here';

if (!supabaseUrl || !supabaseAnonKey || isPlaceholderUrl || isPlaceholderKey) {
  console.warn('⚠️ Supabase設定が未完了です。モックデータを使用します。');
  console.warn('設定画面でSupabase URLとAnon Keyを設定してください。');
  
  // プレースホルダー値でクライアントを作成（実際には使用されない）
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key'
  );
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Database types
export interface Database {
  public: {
    Tables: {
      mansions: {
        Row: {
          id: string;
          name: string;
          address: string;
          purchase_date: string;
          photo_paths: string[];
          deed_pdf_path: string | null;
          total_rooms: number;
          occupancy_rate: number;
          is_deleted: boolean;
          deleted_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          purchase_date: string;
          photo_paths?: string[];
          deed_pdf_path?: string | null;
          total_rooms: number;
          occupancy_rate?: number;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          purchase_date?: string;
          photo_paths?: string[];
          deed_pdf_path?: string | null;
          total_rooms?: number;
          occupancy_rate?: number;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
      };
      rooms: {
        Row: {
          id: string;
          mansion_id: string;
          room_number: string;
          layout: string;
          size: number;
          floor: number;
          photo_paths: string[];
          condition_notes: string;
          is_occupied: boolean;
          monthly_rent: number;
          maintenance_fee: number;
          parking_fee: number;
          bicycle_parking_fee: number | null;
          is_deleted: boolean;
          deleted_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mansion_id: string;
          room_number: string;
          layout: string;
          size: number;
          floor: number;
          photo_paths?: string[];
          condition_notes?: string;
          is_occupied?: boolean;
          monthly_rent: number;
          maintenance_fee?: number;
          parking_fee?: number;
          bicycle_parking_fee?: number | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
        Update: {
          id?: string;
          mansion_id?: string;
          room_number?: string;
          layout?: string;
          size?: number;
          floor?: number;
          photo_paths?: string[];
          condition_notes?: string;
          is_occupied?: boolean;
          monthly_rent?: number;
          maintenance_fee?: number;
          parking_fee?: number;
          bicycle_parking_fee?: number | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
      };
      residents: {
        Row: {
          id: string;
          room_id: string | null;
          name: string;
          phone: string;
          email: string;
          move_in_date: string;
          emergency_contact: string;
          user_id: string | null;
          password: string | null;
          is_active: boolean;
          is_deleted: boolean;
          deleted_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          name: string;
          phone: string;
          email: string;
          move_in_date: string;
          emergency_contact: string;
          user_id?: string | null;
          password?: string | null;
          is_active?: boolean;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string | null;
          name?: string;
          phone?: string;
          email?: string;
          move_in_date?: string;
          emergency_contact?: string;
          user_id?: string | null;
          password?: string | null;
          is_active?: boolean;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
      };
      contractors: {
        Row: {
          id: string;
          name: string;
          contact_person: string;
          phone: string;
          email: string;
          address: string;
          specialties: string[];
          hourly_rate: number;
          rating: number;
          is_active: boolean;
          last_work_date: string | null;
          notes: string | null;
          is_deleted: boolean;
          deleted_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person: string;
          phone: string;
          email: string;
          address: string;
          specialties?: string[];
          hourly_rate?: number;
          rating?: number;
          is_active?: boolean;
          last_work_date?: string | null;
          notes?: string | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string;
          phone?: string;
          email?: string;
          address?: string;
          specialties?: string[];
          hourly_rate?: number;
          rating?: number;
          is_active?: boolean;
          last_work_date?: string | null;
          notes?: string | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
      };
      repair_records: {
        Row: {
          id: string;
          room_id: string | null;
          mansion_id: string;
          contractor_id: string | null;
          scope: 'room' | 'building';
          description: string;
          request_date: string;
          start_date: string | null;
          completion_date: string | null;
          cost: number;
          estimated_cost: number;
          contractor_name: string;
          photo_paths: string[];
          report_pdf_path: string | null;
          status: 'pending' | 'in-progress' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          category: 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'equipment' | 'other';
          notes: string | null;
          is_deleted: boolean;
          deleted_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          mansion_id: string;
          contractor_id?: string | null;
          scope: 'room' | 'building';
          description: string;
          request_date: string;
          start_date?: string | null;
          completion_date?: string | null;
          cost?: number;
          estimated_cost?: number;
          contractor_name: string;
          photo_paths?: string[];
          report_pdf_path?: string | null;
          status?: 'pending' | 'in-progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'equipment' | 'other';
          notes?: string | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string | null;
          mansion_id?: string;
          contractor_id?: string | null;
          scope?: 'room' | 'building';
          description?: string;
          request_date?: string;
          start_date?: string | null;
          completion_date?: string | null;
          cost?: number;
          estimated_cost?: number;
          contractor_name?: string;
          photo_paths?: string[];
          report_pdf_path?: string | null;
          status?: 'pending' | 'in-progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'equipment' | 'other';
          notes?: string | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
      };
      contracts: {
        Row: {
          id: string;
          resident_id: string;
          start_date: string;
          end_date: string;
          rent: number;
          maintenance_fee: number;
          deposit: number;
          key_money: number;
          guarantor: string;
          contract_pdf_path: string | null;
          status: 'active' | 'expired' | 'pending' | 'renewal-due';
          renewal_date: string | null;
          renewal_fee: number | null;
          notes: string | null;
          application_date: string | null;
          approval_date: string | null;
          signing_date: string | null;
          move_in_date: string | null;
          key_handover_date: string | null;
          is_deleted: boolean;
          deleted_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          start_date: string;
          end_date: string;
          rent: number;
          maintenance_fee?: number;
          deposit?: number;
          key_money?: number;
          guarantor: string;
          contract_pdf_path?: string | null;
          status?: 'active' | 'expired' | 'pending' | 'renewal-due';
          renewal_date?: string | null;
          renewal_fee?: number | null;
          notes?: string | null;
          application_date?: string | null;
          approval_date?: string | null;
          signing_date?: string | null;
          move_in_date?: string | null;
          key_handover_date?: string | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
        Update: {
          id?: string;
          resident_id?: string;
          start_date?: string;
          end_date?: string;
          rent?: number;
          maintenance_fee?: number;
          deposit?: number;
          key_money?: number;
          guarantor?: string;
          contract_pdf_path?: string | null;
          status?: 'active' | 'expired' | 'pending' | 'renewal-due';
          renewal_date?: string | null;
          renewal_fee?: number | null;
          notes?: string | null;
          application_date?: string | null;
          approval_date?: string | null;
          signing_date?: string | null;
          move_in_date?: string | null;
          key_handover_date?: string | null;
          is_deleted?: boolean;
          deleted_date?: string | null;
        };
      };
      contract_steps: {
        Row: {
          id: string;
          contract_id: string;
          step_number: number;
          title: string;
          description: string;
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category: 'application' | 'screening' | 'approval' | 'contract' | 'payment' | 'move-in' | 'other';
          start_date: string | null;
          completion_date: string | null;
          due_date: string | null;
          document_paths: string[];
          notes: string | null;
          assigned_to: string | null;
          reported_by: string | null;
          reported_date: string | null;
          is_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          step_number: number;
          title: string;
          description: string;
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category?: 'application' | 'screening' | 'approval' | 'contract' | 'payment' | 'move-in' | 'other';
          start_date?: string | null;
          completion_date?: string | null;
          due_date?: string | null;
          document_paths?: string[];
          notes?: string | null;
          assigned_to?: string | null;
          reported_by?: string | null;
          reported_date?: string | null;
          is_required?: boolean;
        };
        Update: {
          id?: string;
          contract_id?: string;
          step_number?: number;
          title?: string;
          description?: string;
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category?: 'application' | 'screening' | 'approval' | 'contract' | 'payment' | 'move-in' | 'other';
          start_date?: string | null;
          completion_date?: string | null;
          due_date?: string | null;
          document_paths?: string[];
          notes?: string | null;
          assigned_to?: string | null;
          reported_by?: string | null;
          reported_date?: string | null;
          is_required?: boolean;
        };
      };
      resident_requests: {
        Row: {
          id: string;
          resident_id: string;
          room_id: string;
          type: 'repair' | 'complaint' | 'suggestion' | 'inquiry';
          title: string;
          description: string;
          photo_paths: string[];
          status: 'submitted' | 'reviewing' | 'in-progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          submitted_date: string;
          response_date: string | null;
          response: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          room_id: string;
          type: 'repair' | 'complaint' | 'suggestion' | 'inquiry';
          title: string;
          description: string;
          photo_paths?: string[];
          status?: 'submitted' | 'reviewing' | 'in-progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          submitted_date: string;
          response_date?: string | null;
          response?: string | null;
          assigned_to?: string | null;
        };
        Update: {
          id?: string;
          resident_id?: string;
          room_id?: string;
          type?: 'repair' | 'complaint' | 'suggestion' | 'inquiry';
          title?: string;
          description?: string;
          photo_paths?: string[];
          status?: 'submitted' | 'reviewing' | 'in-progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          submitted_date?: string;
          response_date?: string | null;
          response?: string | null;
          assigned_to?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'contract-renewal' | 'payment-overdue' | 'repair-request' | 'maintenance-scheduled' | 'general';
          title: string;
          message: string;
          is_read: boolean;
          created_date: string;
          action_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'contract-renewal' | 'payment-overdue' | 'repair-request' | 'maintenance-scheduled' | 'general';
          title: string;
          message: string;
          is_read?: boolean;
          created_date: string;
          action_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'contract-renewal' | 'payment-overdue' | 'repair-request' | 'maintenance-scheduled' | 'general';
          title?: string;
          message?: string;
          is_read?: boolean;
          created_date?: string;
          action_url?: string | null;
        };
      };
      financial_records: {
        Row: {
          id: string;
          date: string;
          type: 'income' | 'expense';
          category: string;
          subcategory: string | null;
          amount: number;
          description: string;
          room_id: string | null;
          resident_id: string | null;
          invoice_pdf_path: string | null;
          receipt_pdf_path: string | null;
          is_recurring: boolean;
          recurring_frequency: 'monthly' | 'quarterly' | 'yearly' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          type: 'income' | 'expense';
          category: string;
          subcategory?: string | null;
          amount: number;
          description: string;
          room_id?: string | null;
          resident_id?: string | null;
          invoice_pdf_path?: string | null;
          receipt_pdf_path?: string | null;
          is_recurring?: boolean;
          recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | null;
        };
        Update: {
          id?: string;
          date?: string;
          type?: 'income' | 'expense';
          category?: string;
          subcategory?: string | null;
          amount?: number;
          description?: string;
          room_id?: string | null;
          resident_id?: string | null;
          invoice_pdf_path?: string | null;
          receipt_pdf_path?: string | null;
          is_recurring?: boolean;
          recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | null;
        };
      };
      payment_records: {
        Row: {
          id: string;
          payee_name: string;
          amount: number;
          description: string;
          payment_date: string;
          due_date: string | null;
          category: 'contractor' | 'utility' | 'maintenance' | 'insurance' | 'tax' | 'other';
          payment_method: 'bank_transfer' | 'credit_card' | 'cash' | 'check';
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          bank_name: string | null;
          branch_name: string | null;
          account_type: 'checking' | 'savings' | null;
          account_number: string | null;
          account_name: string | null;
          invoice_number: string | null;
          receipt_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payee_name: string;
          amount: number;
          description: string;
          payment_date: string;
          due_date?: string | null;
          category: 'contractor' | 'utility' | 'maintenance' | 'insurance' | 'tax' | 'other';
          payment_method: 'bank_transfer' | 'credit_card' | 'cash' | 'check';
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          bank_name?: string | null;
          branch_name?: string | null;
          account_type?: 'checking' | 'savings' | null;
          account_number?: string | null;
          account_name?: string | null;
          invoice_number?: string | null;
          receipt_path?: string | null;
        };
        Update: {
          id?: string;
          payee_name?: string;
          amount?: number;
          description?: string;
          payment_date?: string;
          due_date?: string | null;
          category?: 'contractor' | 'utility' | 'maintenance' | 'insurance' | 'tax' | 'other';
          payment_method?: 'bank_transfer' | 'credit_card' | 'cash' | 'check';
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          bank_name?: string | null;
          branch_name?: string | null;
          account_type?: 'checking' | 'savings' | null;
          account_number?: string | null;
          account_name?: string | null;
          invoice_number?: string | null;
          receipt_path?: string | null;
        };
      };
    };
  };
}