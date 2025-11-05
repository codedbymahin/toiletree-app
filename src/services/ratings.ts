import { supabase } from './supabase';
import { Rating } from '../types';

export const ratingsService = {
  /**
   * Rate a toilet (1-5 stars) - creates or updates user's rating
   */
  async rateToilet(
    toiletId: string,
    stars: number
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (stars < 1 || stars > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to rate');

      // Upsert rating (insert or update if exists)
      const { error } = await supabase
        .from('ratings')
        .upsert(
          {
            toilet_id: toiletId,
            user_id: user.id,
            stars,
          },
          {
            onConflict: 'toilet_id,user_id',
          }
        );

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get the current user's rating for a specific toilet
   */
  async getUserRating(toiletId: string): Promise<{ rating: Rating | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { rating: null, error: null };

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('toilet_id', toiletId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return { rating: data, error: null };
    } catch (error: any) {
      return { rating: null, error: error.message };
    }
  },

  /**
   * Get average rating for a toilet
   */
  async getAverageRating(toiletId: string): Promise<{ average: number; count: number; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('stars')
        .eq('toilet_id', toiletId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { average: 0, count: 0, error: null };
      }

      const sum = data.reduce((acc, rating) => acc + rating.stars, 0);
      const average = sum / data.length;

      return { average, count: data.length, error: null };
    } catch (error: any) {
      return { average: 0, count: 0, error: error.message };
    }
  },
};

