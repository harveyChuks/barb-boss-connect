-- Add more business types to the enum
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'cleaning_service';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'fitness_center';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'massage_therapy';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'tattoo_parlor';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'medspa';