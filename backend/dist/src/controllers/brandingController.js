// Mock branding configurations for different franchises
const mockBrandingConfigs = {
    default: {
        logoUrl: '/logo.svg',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        fontFamily: 'Roboto, sans-serif',
        faviconUrl: '/favicon.ico',
        appName: 'Redecell PDV',
    },
    franchiseA: {
        logoUrl: '/logo-franchiseA.svg',
        primaryColor: '#4CAF50', // Green
        secondaryColor: '#FFC107', // Amber
        fontFamily: 'Arial, sans-serif',
        faviconUrl: '/favicon-franchiseA.ico',
        appName: 'Franchise A POS',
    },
    franchiseB: {
        logoUrl: '/logo-franchiseB.svg',
        primaryColor: '#9C27B0', // Purple
        secondaryColor: '#FFEB3B', // Yellow
        fontFamily: 'Georgia, serif',
        faviconUrl: '/favicon-franchiseB.ico',
        appName: 'Franchise B POS',
    },
};
export const getBrandingConfig = async (req, res, next) => {
    try {
        // In a real application, the franchise ID would come from the authenticated user
        // For now, we'll use a mock or a query parameter for demonstration
        const franchiseId = req.user?.franchiseId || req.query.franchiseId || 'default';
        const brandingConfig = mockBrandingConfigs[franchiseId] ||
            mockBrandingConfigs.default;
        res.status(200).json(brandingConfig);
    }
    catch (error) {
        next(error);
    }
};
export const updateBrandingConfig = async (req, res, next) => {
    try {
        const franchiseId = req.user?.franchiseId || req.query.franchiseId || 'default';
        const updatedConfig = req.body;
        // In a real application, this would update a database. For now, update mock data.
        mockBrandingConfigs[franchiseId] = {
            ...mockBrandingConfigs[franchiseId],
            ...updatedConfig,
        };
        res.status(200).json(mockBrandingConfigs[franchiseId]);
    }
    catch (error) {
        next(error);
    }
};
