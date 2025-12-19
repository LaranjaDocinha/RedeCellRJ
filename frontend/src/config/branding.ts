
interface BrandingConfig {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  faviconUrl: string;
  appName: string;
  // Add more branding options as needed
}

const defaultBranding: BrandingConfig = {
  logoUrl: '/logo.svg', // Default logo
  primaryColor: '#1976d2', // Material Blue
  secondaryColor: '#dc004e', // Material Red
  fontFamily: 'Roboto, sans-serif',
  faviconUrl: '/favicon.ico',
  appName: 'Redecell PDV',
};

// In a real application, this would be loaded dynamically based on the franchise
const getBranding = (franchiseId?: string): BrandingConfig => {
  // For demonstration, we can simulate different branding based on franchiseId
  if (franchiseId === 'franchiseA') {
    return {
      logoUrl: '/logo-franchiseA.svg',
      primaryColor: '#4CAF50', // Green
      secondaryColor: '#FFC107', // Amber
      fontFamily: 'Arial, sans-serif',
      faviconUrl: '/favicon-franchiseA.ico',
      appName: 'Franchise A POS',
    };
  }
  // For now, return default branding
  return defaultBranding;
};

export default getBranding;
