-- Add TikTok field to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS tiktok text;