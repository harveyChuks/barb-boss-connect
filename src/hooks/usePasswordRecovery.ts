import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordRecovery = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL contains password recovery hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      // Supabase automatically handles the token exchange
      // Just redirect to the reset password page
      navigate('/reset-password', { replace: true });
    }
  }, [navigate]);
};
