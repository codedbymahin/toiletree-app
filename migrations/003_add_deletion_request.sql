-- Migration: Add deletion_requested_at column to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE;

