import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePasswordRecovery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if URL contains password recovery hash
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    // If we have a recovery type and access token, redirect to reset password page
    if (type === 'recovery' && accessToken) {
      // Clear the hash from URL and redirect to reset password page
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/reset-password', { replace: true });
    }
  }, [navigate, location]);
};
