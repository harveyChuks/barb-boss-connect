import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const useTimeBasedTheme = (enabled: boolean = true) => {
  const { setTheme, theme } = useTheme();

  const getThemeBasedOnTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Convert current time to minutes since midnight for easier comparison
    const currentTimeInMinutes = hours * 60 + minutes;
    
    // 6:00 AM = 360 minutes, 6:30 PM = 1110 minutes (18.5 * 60)
    const lightModeStart = 6 * 60; // 6:00 AM
    const darkModeStart = 18.5 * 60; // 6:30 PM
    
    // Light mode: 6:00 AM to 6:30 PM
    // Dark mode: 6:30 PM to 6:00 AM (next day)
    if (currentTimeInMinutes >= lightModeStart && currentTimeInMinutes < darkModeStart) {
      return 'light';
    } else {
      return 'dark';
    }
  };

  const getNextThemeChangeTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;
    
    const lightModeStart = 6 * 60; // 6:00 AM
    const darkModeStart = 18.5 * 60; // 6:30 PM
    
    let nextChangeTime;
    if (currentTimeInMinutes < lightModeStart) {
      // Before 6 AM, next change is to light mode at 6 AM
      nextChangeTime = '6:00 AM';
    } else if (currentTimeInMinutes < darkModeStart) {
      // Between 6 AM and 6:30 PM, next change is to dark mode at 6:30 PM
      nextChangeTime = '6:30 PM';
    } else {
      // After 6:30 PM, next change is to light mode at 6 AM tomorrow
      nextChangeTime = '6:00 AM tomorrow';
    }
    
    return nextChangeTime;
  };

  useEffect(() => {
    if (!enabled) return;

    // Set initial theme based on current time
    const initialTheme = getThemeBasedOnTime();
    setTheme(initialTheme);

    // Check every minute for theme changes
    const interval = setInterval(() => {
      const newTheme = getThemeBasedOnTime();
      setTheme(newTheme);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [setTheme, enabled]);

  return {
    currentTheme: getThemeBasedOnTime(),
    nextChangeTime: getNextThemeChangeTime(),
    isTimeBasedActive: enabled
  };
};