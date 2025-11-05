import { supabase } from './supabase';
import { Profile } from '../types';

export const authService = {
  /**
   * Sign up a new user with email, password, and username
   */
  async signUp(email: string, password: string, username: string) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          is_admin: false,
        });

      if (profileError) throw profileError;

      return { user: authData.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  /**
   * Get the current user's profile with admin status
   */
  async getCurrentUser(): Promise<{ profile: Profile | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return { profile: null, error: null };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { profile, error: null };
    } catch (error: any) {
      return { profile: null, error: error.message };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Profile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  /**
   * Request account deletion by setting deletion_requested_at timestamp
   */
  async requestAccountDeletion(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({ deletion_requested_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

