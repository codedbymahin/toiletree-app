import { supabase } from './supabase';
import { Report } from '../types';
import { sanitizeInput } from '../utils/sanitize';

export const reportsService = {
  /**
   * Submit a report for a toilet
   */
  async reportIssue(
    toiletId: string,
    issueType: 'closed' | 'dirty' | 'broken' | 'incorrect_location' | 'other',
    description: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Sanitize input (max 500 characters for report descriptions)
      const sanitizedDescription = sanitizeInput(description, 500);
      
      if (!sanitizedDescription.trim()) {
        throw new Error('Description cannot be empty');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to report an issue');

      const { error } = await supabase
        .from('reports')
        .insert({
          toilet_id: toiletId,
          user_id: user.id,
          issue_type: issueType,
          description: sanitizedDescription,
          status: 'open',
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's own reports
   */
  async getUserReports(): Promise<{ reports: Report[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { reports: [], error: 'Not logged in' };

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { reports: data || [], error: null };
    } catch (error: any) {
      return { reports: [], error: error.message };
    }
  },
};

