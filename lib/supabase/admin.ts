import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type AppDatabase = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          email: string;
          display_name: string | null;
          role: string;
          avatar_url: string | null;
          status_text: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<{
          email: string;
          display_name: string | null;
          role: string;
          avatar_url: string | null;
          status_text: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Update: Partial<{
          display_name: string | null;
          role: string;
          avatar_url: string | null;
          status_text: string | null;
          is_active: boolean;
          last_login_at: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      konsumen: {
        Row: {
          id: string;
          kode_barang: string;
          nama: string;
          telepon: string | null;
          email: string | null;
          alamat: string | null;
          catatan: string | null;
          status: string;
          created_by_email: string | null;
          pic_name: string | null;
          pic_phone: string | null;
          pic_email: string | null;
          assigned_cs: string | null;
          updated_by_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<{
          id: string;
          kode_barang: string;
          nama: string;
          telepon: string | null;
          email: string | null;
          alamat: string | null;
          catatan: string | null;
          status: string;
          created_by_email: string | null;
          pic_name: string | null;
          pic_phone: string | null;
          pic_email: string | null;
          assigned_cs: string | null;
          updated_by_email: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Update: Partial<{
          kode_barang: string;
          nama: string;
          telepon: string | null;
          email: string | null;
          alamat: string | null;
          catatan: string | null;
          status: string;
          created_by_email: string | null;
          pic_name: string | null;
          pic_phone: string | null;
          pic_email: string | null;
          assigned_cs: string | null;
          updated_by_email: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          kode_barang: string | null;
          konsumen_id: string | null;
          nama_penjahit: string | null;
          model: string | null;
          model_detail: string | null;
          jumlah_pesanan: number | null;
          status: string | null;
          payment_status: string | null;
          priority: string | null;
          cs: string | null;
          konsumen: string | null;
          warna: string | null;
          saku_type: string | null;
          saku_color: string | null;
          embroidery_status: string | null;
          embroidery_notes: string | null;
          completed_at: string | null;
          tanggal_order: string | null;
          tanggal_target_selesai: string | null;
          deskripsi_pekerjaan: string | null;
          size_details: unknown;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
          integration_source: string | null;
          external_id: string | null;
        };
        Insert: Partial<{
          kode_barang: string;
          konsumen_id: string | null;
          nama_penjahit: string | null;
          model: string | null;
          model_detail: string | null;
          jumlah_pesanan: number;
          status: string;
          payment_status: string;
          priority: string;
          cs: string | null;
          konsumen: string | null;
          warna: string | null;
          saku_type: string | null;
          saku_color: string | null;
          embroidery_status: string | null;
          embroidery_notes: string | null;
          completed_at: string | null;
          tanggal_order: string | null;
          tanggal_target_selesai: string | null;
          deskripsi_pekerjaan: string | null;
          size_details: unknown;
          integration_source: string | null;
          external_id: string | null;
        }>;
        Update: Partial<{
          status: string;
          payment_status: string;
          konsumen_id: string | null;
          konsumen: string | null;
          saku_type: string | null;
          saku_color: string | null;
          embroidery_status: string | null;
          embroidery_notes: string | null;
          completed_at: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      integration_sources: {
        Row: {
          id: string;
          source_key: string;
          source_name: string;
          is_active: boolean;
          config: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      integration_sync_logs: {
        Row: {
          id: string;
          source_key: string;
          idempotency_key: string | null;
          external_id: string | null;
          status: string;
          started_at: string | null;
          completed_at: string | null;
          raw_payload: Record<string, unknown>;
          normalized_payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      ocr_logs: {
        Row: {
          id: string;
          source: string;
          requested_by_email: string | null;
          raw_result: Record<string, unknown>;
          normalized_result: Record<string, unknown>;
          image_preview: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      forum_messages: {
        Row: {
          id: string;
          message_text: string | null;
          author_email: string;
          author_name: string | null;
          author_role: string | null;
          kode_barang_tag: string | null;
          emoji_reactions: Record<string, unknown>;
          attachment_url: string | null;
          attachment_name: string | null;
          attachment_type: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<{
          id: string;
          message_text: string | null;
          author_email: string;
          author_name: string | null;
          author_role: string | null;
          kode_barang_tag: string | null;
          emoji_reactions: Record<string, unknown>;
          attachment_url: string | null;
          attachment_name: string | null;
          attachment_type: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }>;
        Update: Partial<{
          message_text: string | null;
          kode_barang_tag: string | null;
          emoji_reactions: Record<string, unknown>;
          attachment_url: string | null;
          attachment_name: string | null;
          attachment_type: string | null;
          updated_at: string;
          deleted_at: string | null;
        }>;
        Relationships: [];
      };
    };
  };
};

let cachedAdminClient: SupabaseClient<AppDatabase> | null = null;

export function getSupabaseAdmin() {
  if (cachedAdminClient) return cachedAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceRole) {
    throw new Error('Supabase env belum lengkap (url/key).');
  }

  cachedAdminClient = createClient<AppDatabase>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedAdminClient;
}
