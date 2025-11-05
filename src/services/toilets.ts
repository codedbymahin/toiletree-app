import { supabase } from './supabase';
import { Toilet } from '../types';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const toiletsService = {
  /**
   * Fetch all active toilets, optionally filtered by map bounds
   */
  async getToilets(bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }): Promise<{ toilets: Toilet[]; error: string | null }> {
    try {
      let query = supabase
        .from('toilets')
        .select('*')
        .eq('status', 'active');

      if (bounds) {
        query = query
          .gte('latitude', bounds.minLat)
          .lte('latitude', bounds.maxLat)
          .gte('longitude', bounds.minLng)
          .lte('longitude', bounds.maxLng);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { toilets: data || [], error: null };
    } catch (error: any) {
      return { toilets: [], error: error.message };
    }
  },

  /**
   * Get a single toilet by ID with its ratings and reviews
   */
  async getToiletById(id: string): Promise<{ toilet: Toilet | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('toilets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { toilet: data, error: null };
    } catch (error: any) {
      return { toilet: null, error: error.message };
    }
  },

  /**
   * Submit a new toilet for admin approval
   */
  async submitToilet(
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    photo?: { uri: string; base64?: string },
    metadata?: {
      is_female_friendly?: boolean;
      has_water_access?: boolean;
      is_paid?: boolean;
    }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to submit a toilet');

      let photoUrl: string | null = null;

      // Upload photo if provided
      if (photo) {
        const uploadResult = await this.uploadToiletPhoto(photo);
        if (uploadResult.error || !uploadResult.url) {
          throw new Error(
            uploadResult.error || 'Photo upload failed. Please try again later.'
          );
        }
        photoUrl = uploadResult.url;
      }

      // Create submission
      const { error } = await supabase
        .from('toilet_submissions')
        .insert({
          name,
          address,
          latitude,
          longitude,
          photo_url: photoUrl,
          submitted_by: user.id,
          status: 'pending',
          is_female_friendly: metadata?.is_female_friendly ?? false,
          has_water_access: metadata?.has_water_access ?? false,
          is_paid: metadata?.is_paid ?? false,
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Upload a photo to Supabase Storage
   */
  async uploadToiletPhoto(photo: { uri: string; base64?: string }): Promise<{ url: string | null; error: string | null }> {
    try {
      if (!photo.uri) {
        throw new Error('Invalid photo URI');
      }

      // Read the file as base64 if not already provided
      const encoding = FileSystem.EncodingType?.Base64 ?? ('base64' as FileSystem.EncodingType);
      const base64StringRaw = photo.base64
        ? photo.base64
        : await FileSystem.readAsStringAsync(photo.uri, {
            encoding,
          });
      const base64String = base64StringRaw.includes(',')
        ? base64StringRaw.split(',')[1]
        : base64StringRaw;

      // Generate a unique filename
      const fileName = `toilet_${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('toilet-photos')
        .upload(filePath, decode(base64String), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('toilet-photos')
        .getPublicUrl(filePath);

      return { url: publicUrlData.publicUrl, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },
};

