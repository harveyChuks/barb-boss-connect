
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      // Validate the saved theme to prevent invalid values
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        return savedTheme;
      }
      return 'dark';
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Save to localStorage immediately
      try {
        localStorage.setItem('theme', theme);
      } catch (storageError) {
        console.error('Error saving theme to localStorage:', storageError);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error('Error toggling theme:', error);
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
