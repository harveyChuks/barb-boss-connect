-- Add trial_days column to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN trial_days integer DEFAULT 90;