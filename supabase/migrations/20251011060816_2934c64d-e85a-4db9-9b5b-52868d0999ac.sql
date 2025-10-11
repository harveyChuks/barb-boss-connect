-- Create app_feedback table for business owners to provide feedback about the Boji app
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.app_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
ON public.app_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" 
ON public.app_feedback 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_app_feedback_user_id ON public.app_feedback(user_id);
CREATE INDEX idx_app_feedback_created_at ON public.app_feedback(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_feedback_updated_at
BEFORE UPDATE ON public.app_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();