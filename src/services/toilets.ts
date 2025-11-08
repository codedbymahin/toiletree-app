import { supabase } from './supabase';
import { Toilet } from '../types';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { sanitizeInput } from '../utils/sanitize';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const toiletsService = {
  /**
   * Get nearby toilets within a specified radius (in kilometers)
   * Returns toilets sorted by distance (nearest first)
   */
  async getNearbyToilets(
    userLat: number,
    userLon: number,
    radiusKm: number = 10
  ): Promise<{ toilets: Toilet[]; error: string | null }> {
    try {
      // Calculate approximate bounding box for initial filter
      // This reduces the number of toilets we need to calculate distance for
      const latDelta = radiusKm / 111; // ~111 km per degree latitude
      const lonDelta = radiusKm / (111 * Math.cos((userLat * Math.PI) / 180));

      const minLat = userLat - latDelta;
      const maxLat = userLat + latDelta;
      const minLon = userLon - lonDelta;
      const maxLon = userLon + lonDelta;

      // Fetch toilets within bounding box
      const { data, error } = await supabase
        .from('toilets')
        .select('*')
        .eq('status', 'active')
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLon)
        .lte('longitude', maxLon);

      if (error) throw error;

      // Calculate distance for each toilet and filter by radius
      const toiletsWithDistance = (data || [])
        .map((toilet) => ({
          ...toilet,
          distance: calculateDistance(
            userLat,
            userLon,
            toilet.latitude,
            toilet.longitude
          ),
        }))
        .filter((toilet) => toilet.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .map(({ distance, ...toilet }) => toilet); // Remove distance from final result

      return { toilets: toiletsWithDistance, error: null };
    } catch (error: any) {
      return { toilets: [], error: error.message };
    }
  },

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
   * Get toilets within a bounding box (visible map area)
   * This function is optimized for map view queries
   */
  async getToiletsInBounds(bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }): Promise<{ toilets: Toilet[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('toilets')
        .select('*')
        .eq('status', 'active')
        .gte('latitude', bounds.minLat)
        .lte('latitude', bounds.maxLat)
        .gte('longitude', bounds.minLng)
        .lte('longitude', bounds.maxLng);

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
      // Sanitize user inputs (max 200 characters for name, 300 for address)
      const sanitizedName = sanitizeInput(name, 200);
      const sanitizedAddress = sanitizeInput(address, 300);
      
      if (!sanitizedName.trim()) {
        throw new Error('Toilet name is required');
      }
      
      if (!sanitizedAddress.trim()) {
        throw new Error('Address is required');
      }

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
          name: sanitizedName,
          address: sanitizedAddress,
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

