// Auto-generated Supabase database types.
// Run `npx supabase gen types typescript --project-id <id>` to regenerate.

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
      rooms: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string;
          price_per_night: number;
          capacity: number;
          size_sqm: number;
          amenities: string[];
          images: string[];
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          description: string;
          price_per_night: number;
          capacity: number;
          size_sqm: number;
          amenities?: string[];
          images?: string[];
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          description?: string;
          price_per_night?: number;
          capacity?: number;
          size_sqm?: number;
          amenities?: string[];
          images?: string[];
          is_available?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          room_id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          check_in: string;
          check_out: string;
          guests_count: number;
          total_price: number;
          status: string;
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string;
          check_in: string;
          check_out: string;
          guests_count: number;
          total_price: number;
          status?: string;
          special_requests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          room_id?: string;
          guest_name?: string;
          guest_email?: string;
          guest_phone?: string;
          check_in?: string;
          check_out?: string;
          guests_count?: number;
          total_price?: number;
          status?: string;
          special_requests?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
