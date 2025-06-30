
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'midnight' | 'light' | 'classic' | 'ocean' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: {
    id: Theme;
    name: string;
    description: string;
    preview: string;
  }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  {
    id: 'midnight' as Theme,
    name: 'Midnight Professional',
    description: 'Deep slate with amber accents',
    preview: 'bg-slate-900 border-amber-500'
  },
  {
    id: 'light' as Theme,
    name: 'Clean Light',
    description: 'Pure whites with blue accents',
    preview: 'bg-white border-blue-500'
  },
  {
    id: 'classic' as Theme,
    name: 'Barbershop Classic',
    description: 'Deep reds and blacks with gold',
    preview: 'bg-red-900 border-yellow-500'
  },
  {
    id: 'ocean' as Theme,
    name: 'Ocean Breeze',
    description: 'Soft blues and teals',
    preview: 'bg-blue-50 border-teal-500'
  },
  {
    id: 'sunset' as Theme,
    name: 'Warm Sunset',
    description: 'Warm oranges and creams',
    preview: 'bg-orange-50 border-orange-500'
  }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('midnight');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-midnight', 'theme-light', 'theme-classic', 'theme-ocean', 'theme-sunset');
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
