import { supabase } from './supabase';
import { ToiletSubmission, Report } from '../types';

export const adminService = {
  /**
   * Get all pending toilet submissions
   */
  async getPendingSubmissions(): Promise<{
    submissions: ToiletSubmission[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('toilet_submissions')
        .select(`
          *,
          profiles:submitted_by (username)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      return { submissions: data || [], error: null };
    } catch (error: any) {
      return { submissions: [], error: error.message };
    }
  },

  /**
   * Approve a toilet submission and create the toilet
   */
  async approveSubmission(submissionId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Get submission details
      const { data: submission, error: fetchError } = await supabase
        .from('toilet_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;
      if (!submission) throw new Error('Submission not found');

      // Create the toilet
      const { error: insertError } = await supabase
        .from('toilets')
        .insert({
          name: submission.name,
          address: submission.address,
          latitude: submission.latitude,
          longitude: submission.longitude,
          photo_url: submission.photo_url,
          is_female_friendly: submission.is_female_friendly,
          has_water_access: submission.has_water_access,
          is_paid: submission.is_paid,
          status: 'active',
          created_by: submission.submitted_by,
        });

      if (insertError) throw insertError;

      // Update submission status
      const { error: updateError } = await supabase
        .from('toilet_submissions')
        .update({ status: 'approved' })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Reject a toilet submission
   */
  async rejectSubmission(
    submissionId: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('toilet_submissions')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
        })
        .eq('id', submissionId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all open reports
   */
  async getReports(): Promise<{ reports: Report[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          toilets:toilet_id (name, address),
          profiles:user_id (username)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { reports: data || [], error: null };
    } catch (error: any) {
      return { reports: [], error: error.message };
    }
  },

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string,
    status: 'resolved' | 'dismissed'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a toilet (admin only)
   */
  async deleteToilet(toiletId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('toilets')
        .delete()
        .eq('id', toiletId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Update toilet status
   */
  async updateToiletStatus(
    toiletId: string,
    status: 'active' | 'inactive' | 'closed'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('toilets')
        .update({ status })
        .eq('id', toiletId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all users who have requested account deletion
   */
  async getDeletionRequests(): Promise<{
    requests: Array<{
      id: string;
      username: string;
      email?: string;
      deletion_requested_at: string;
    }>;
    error: string | null;
  }> {
    try {
      // Try to use the view first (if migration was run)
      let data, error;
      
      try {
        const result = await supabase
          .from('deletion_requests_with_email')
          .select('id, username, email, deletion_requested_at')
          .order('deletion_requested_at', { ascending: false });
        
        data = result.data;
        error = result.error;
        
        // If view doesn't exist, fall back to profiles table
        if (error && error.message?.includes('relation') && error.message?.includes('does not exist')) {
          throw new Error('VIEW_NOT_FOUND');
        }
      } catch (viewError: any) {
        // Fallback: query profiles table directly (without email)
        const result = await supabase
          .from('profiles')
          .select('id, username, deletion_requested_at')
          .not('deletion_requested_at', 'is', null)
          .order('deletion_requested_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      const requests = (data || []).map((item: any) => ({
        id: item.id,
        username: item.username,
        email: item.email || undefined,
        deletion_requested_at: item.deletion_requested_at,
      }));

      return { requests, error: null };
    } catch (error: any) {
      return { requests: [], error: error.message };
    }
  },
};

