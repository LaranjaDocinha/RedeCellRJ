import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
  Stack,
  Divider,
  Snackbar,
  IconButton,
} from '@mui/material';
import { Search, Close, Fullscreen, FullscreenExit, AdminPanelSettings, SupportAgent } from '@mui/icons-material';
import { styled } from '@mui/system';
import * as kioskProductService from '../services/kioskProductService';
import type { Product, ProductVariation } from '../services/kioskProductService';

// --- Mock Admin Credentials ---
const ADMIN_EMAIL = 'admin@pdv.com';
const ADMIN_PASSWORD = 'admin123';

// --- Styled Components ---
const KioskContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  position: 'relative', // Needed for screensaver overlay
}));

const ProductGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const ProductCardStyled = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    cursor: 'pointer',
  },
}));

const ProductImage = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 aspect ratio
  backgroundSize: 'contain',
});

const KioskScreensaver = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  color: theme.palette.common.white,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  cursor: 'none', // Hide cursor during screensaver
}));

// --- KioskModePage Component ---
const KioskModePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen
  const [isInactive, setIsInactive] = useState(false); // State for inactivity
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT_MS = 30 * 1000; // 30 seconds

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false); // New state for admin login modal
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // New state for Snackbar feedback

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await kioskProductService.fetchAllPublicProducts(searchTerm);
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Fullscreen Logic ---
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  // --- End Fullscreen Logic ---

  // --- Inactivity Logic (Screensaver) ---
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsInactive(false); // Any activity resets screensaver
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsInactive(true);
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    // Set up initial timer
    resetInactivityTimer();

    // Add event listeners for user activity
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer); // For touch devices

    // Clean up event listeners on component unmount
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('touchstart', resetInactivityTimer);
    };
  }, [resetInactivityTimer]);

  // If in screensaver mode, any interaction should exit it
  const handleScreensaverInteraction = useCallback(() => {
    if (isInactive) {
      setIsInactive(false);
      resetInactivityTimer();
    }
  }, [isInactive, resetInactivityTimer]);
  // --- End Inactivity Logic ---

  // --- Admin Login Logic ---
  const handleAdminLogin = useCallback(() => {
    setAdminLoginError(null);
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      console.log('Admin login successful! Entering admin mode...');
      // TODO: Implement actual admin mode logic (e.g., redirect to admin dashboard, show admin controls)
      setIsAdminLoginModalOpen(false);
      setAdminEmail('');
      setAdminPassword('');
      alert('Admin mode activated! (Check console for details)');
    } else {
      setAdminLoginError('Invalid email or password.');
    }
  }, [adminEmail, adminPassword]);
  // --- End Admin Login Logic ---

  // --- Call Seller Logic ---
  const handleCallSeller = useCallback(() => {
    console.log('A seller has been notified.');
    // In a real app, this would trigger a notification to a staff system.
    setIsSnackbarOpen(true);
  }, []);
  // --- End Call Seller Logic ---

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailModalOpen(true);
  };

  const handleCloseProductDetailModal = () => {
    setIsProductDetailModalOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <KioskContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </KioskContainer>
    );
  }

  if (error) {
    return (
      <KioskContainer>
        <Alert severity="error">{error}</Alert>
      </KioskContainer>
    );
  }

  return (
    <KioskContainer onClick={handleScreensaverInteraction} onMouseMove={handleScreensaverInteraction}>
      {isInactive && (
        <KioskScreensaver>
          <Typography variant="h4" align="center" gutterBottom>
            Touch to Wake Up
          </Typography>
          <Typography variant="h6" align="center">
            Explore our amazing products!
          </Typography>
          {/* TODO: Add a rotating product showcase or promotional content */}
        </KioskScreensaver>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" align="center" color="primary" sx={{ flexGrow: 1 }}>
          Welcome! Explore Our Products.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleCallSeller}
          startIcon={<SupportAgent />}
          sx={{ mr: 1 }}
        >
          Call Seller
        </Button>
        <Button
          variant="outlined"
          onClick={toggleFullscreen}
          startIcon={isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          sx={{ mr: 1 }}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setIsAdminLoginModalOpen(true)}
          startIcon={<AdminPanelSettings />}
        >
          Admin
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          label="Search Products"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />,
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      <ProductGrid container spacing={3}>
        {products.length > 0 ? (
          products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCardStyled onClick={() => handleProductClick(product)}>
                <ProductImage
                  image="https://via.placeholder.com/300x200?text=Product+Image" // Placeholder image
                  title={product.name}
                />
                <CardContent>
                  <Typography variant="h6" component="div" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description?.substring(0, 100)}...
                  </Typography>
                  <Typography variant="h5" color="text.primary">
                    R$ {product.price?.toFixed(2) || 'N/A'}
                  </Typography>
                  {/* Add more product details like rating, stock, etc. */}
                </CardContent>
              </ProductCardStyled>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No products found.
            </Typography>
          </Grid>
        )}
      </ProductGrid>

      {/* Product Detail Modal */}
      <Dialog open={isProductDetailModalOpen} onClose={handleCloseProductDetailModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct?.name}
          <IconButton
            aria-label="close"
            onClick={handleCloseProductDetailModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img
                  src="https://via.placeholder.com/400x300?text=Product+Image" // Placeholder image
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
                {/* TODO: Implement image gallery */}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" gutterBottom>
                  {selectedProduct.name}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  R$ {selectedProduct.price?.toFixed(2) || 'N/A'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedProduct.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {selectedProduct.is_used && <Chip label="Used" color="warning" />}
                  {selectedProduct.condition && <Chip label={`Condition: ${selectedProduct.condition}`} />}
                  {/* TODO: Add more dynamic chips for categories, tags, etc. */}
                </Stack>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  SKU: {selectedProduct.sku || 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  Stock: {selectedProduct.stock_quantity !== undefined ? selectedProduct.stock_quantity : 'N/A'}
                </Typography>
                {/* TODO: Display variations if available */}
                {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Variations:</Typography>
                    <List>
                      {selectedProduct.variations.map((variation) => (
                        <ListItem key={variation.id}>
                          <ListItemText primary={`Color: ${variation.color || 'N/A'} - Price: R$${variation.price.toFixed(2)} - Stock: ${variation.stock_quantity}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {/* TODO: Add "Add to Cart" or "Inquire" button */}
                <Button variant="contained" color="primary" size="large" sx={{ mt: 3 }}>
                  Add to Cart (Not Implemented)
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDetailModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Admin Login Modal */}
      <Dialog open={isAdminLoginModalOpen} onClose={() => setIsAdminLoginModalOpen(false)}>
        <DialogTitle>Admin Login</DialogTitle>
        <DialogContent>
          {adminLoginError && <Alert severity="error" sx={{ mb: 2 }}>{adminLoginError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAdminLoginModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAdminLogin} variant="contained">Login</Button>
        </DialogActions>
      </Dialog>

      {/* Call Seller Snackbar */}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        message="A seller has been notified and will be with you shortly."
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setIsSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </KioskContainer>
  );
};

export default KioskModePage;