import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_announcement: string;
  hero_image: string;
}

interface SiteContextType {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

interface SiteProviderProps {
  children: ReactNode;
}

export function SiteProvider({ children }: SiteProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'ShinigamiStream',
    site_logo: '死',
    site_announcement: '',
    hero_image: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          site_name: data.site_name || 'ShinigamiStream',
          site_logo: data.site_logo || '死',
          site_announcement: data.site_announcement || '',
          hero_image: data.hero_image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteContext.Provider value={{ settings, refreshSettings, isLoading }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
