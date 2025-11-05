export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
}

export interface Toilet {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  status: 'active' | 'inactive' | 'closed';
  created_by: string;
  created_at: string;
  average_rating?: number;
  is_female_friendly?: boolean;
  has_water_access?: boolean;
  is_paid?: boolean;
}

export interface ToiletSubmission {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  is_female_friendly?: boolean;
  has_water_access?: boolean;
  is_paid?: boolean;
}

export interface Rating {
  id: string;
  toilet_id: string;
  user_id: string;
  stars: number;
  created_at: string;
}

export interface Review {
  id: string;
  toilet_id: string;
  user_id: string;
  username?: string;
  review_text: string;
  created_at: string;
}

export interface Report {
  id: string;
  toilet_id: string;
  user_id: string;
  issue_type: string;
  description: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
}

