-- Drop existing app_feedback table if it exists
DROP TABLE IF EXISTS public.app_feedback CASCADE;

-- Create app_feedback table with proper structure
CREATE TABLE public.app_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on user_id for better query performance
CREATE INDEX idx_app_feedback_user_id ON public.app_feedback(user_id);

-- Create index on created_at for sorting
CREATE INDEX idx_app_feedback_created_at ON public.app_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.app_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.app_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.app_feedback
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_app_feedback_updated_at
  BEFORE UPDATE ON public.app_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();