import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !isAuthenticated) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setRole('business_owner'); // Default role
        } else {
          setRole(data?.role || 'business_owner');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('business_owner');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, isAuthenticated]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isBusinessOwner: role === 'business_owner'
  };
};