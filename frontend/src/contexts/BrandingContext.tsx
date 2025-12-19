// frontend/src/contexts/BrandingContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import getBranding from '../config/branding'; // Import the getBranding function
import { useAuth } from './AuthContext'; // Assuming useAuth provides user and token

interface BrandingConfig {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  faviconUrl: string;
  appName: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  loading: boolean;
  error: string | null;
}

export const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingConfig>(getBranding()); // Start with default branding
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth(); // Get user and token from auth context

  useEffect(() => {
    const fetchBranding = async () => {
      if (!token) { // Only fetch branding if a token exists
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // In a real app, franchiseId would come from the authenticated user
        // For now, we'll use a mock or a query parameter for demonstration
        const franchiseId = user?.franchiseId || new URLSearchParams(window.location.search).get('franchiseId');

        // Fetch branding from backend API
        const response = await fetch(`/api/branding?franchiseId=${franchiseId || ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch branding configuration');
        }

        const data: BrandingConfig = await response.json();
        setBranding(data);

        // Dynamically update favicon
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = data.faviconUrl;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = data.faviconUrl;
          document.head.appendChild(newLink);
        }

        // Apply global CSS variables for colors and font
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
        document.documentElement.style.setProperty('--font-family', data.fontFamily);

        // Update document title
        document.title = data.appName;

      } catch (err: any) {
        console.error('Error fetching branding:', err);
        setError(err.message || 'Failed to load branding');
        setBranding(getBranding()); // Fallback to default branding on error
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [user, token]); // Re-fetch if user or token changes

  return (
    <BrandingContext.Provider value={{ branding, loading, error }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
