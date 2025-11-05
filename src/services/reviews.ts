import { supabase } from './supabase';
import { Review } from '../types';

export const reviewsService = {
  /**
   * Get all reviews for a toilet
   */
  async getReviews(toiletId: string): Promise<{ reviews: Review[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('toilet_id', toiletId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include username
      const reviews = (data || []).map((review: any) => ({
        ...review,
        username: review.profiles?.username || 'Anonymous',
      }));

      return { reviews, error: null };
    } catch (error: any) {
      return { reviews: [], error: error.message };
    }
  },

  /**
   * Add a review for a toilet
   */
  async addReview(
    toiletId: string,
    reviewText: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!reviewText.trim()) {
        throw new Error('Review text cannot be empty');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to review');

      const { error } = await supabase
        .from('reviews')
        .insert({
          toilet_id: toiletId,
          user_id: user.id,
          review_text: reviewText.trim(),
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete user's own review
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

