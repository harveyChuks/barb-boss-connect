-- Add new business types to the enum
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'painting';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'flooring';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'plumbing';