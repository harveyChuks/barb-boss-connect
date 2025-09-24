import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface VisitData {
  page_path: string;
  business_id?: string;
  user_agent?: string;
  referrer?: string;
  session_id?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
}

export const usePageVisitTracker = (businessId?: string) => {
  const location = useLocation();
  const sessionId = useRef(crypto.randomUUID());
  const trackedPaths = useRef(new Set<string>());

  const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const trackVisit = async (data: VisitData) => {
    try {
      const visitData = {
        page_path: data.page_path,
        business_id: data.business_id || null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        session_id: sessionId.current,
        device_type: getDeviceType(),
        is_unique_visit: !trackedPaths.current.has(data.page_path)
      };

      const { error } = await supabase
        .from('page_visits')
        .insert(visitData);

      if (error) {
        console.error('Error tracking page visit:', error);
      } else {
        trackedPaths.current.add(data.page_path);
      }
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  };

  useEffect(() => {
    // Track the current page visit
    trackVisit({
      page_path: location.pathname,
      business_id: businessId
    });
  }, [location.pathname, businessId]);

  return { trackVisit };
};