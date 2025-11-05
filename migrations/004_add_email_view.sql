-- Migration: Create a view to get profiles with emails for deletion requests
-- This view joins profiles with auth.users to get email addresses

CREATE OR REPLACE VIEW deletion_requests_with_email AS
SELECT 
  p.id,
  p.username,
  au.email,
  p.deletion_requested_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.deletion_requested_at IS NOT NULL;

-- Grant access to authenticated users (admins will use this)
GRANT SELECT ON deletion_requests_with_email TO authenticated;

