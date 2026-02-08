import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack, useTheme } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ActionButton[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
  const theme = useTheme();

  return (
    <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
      <Box>
        {breadcrumbs && (
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 1 }}>
            {breadcrumbs.map((item, index) => (
              item.to ? (
                <Link key={index} component={RouterLink} to={item.to} underline="hover" color="inherit" fontSize="small">
                  {item.label}
                </Link>
              ) : (
                <Typography key={index} color="text.primary" fontSize="small">
                  {item.label}
                </Typography>
              )
            ))}
          </Breadcrumbs>
        )}
        <Typography variant="h4" sx={{ fontWeight: 500, letterSpacing: '-0.5px' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && actions.length > 0 && (
        <Stack direction="row" spacing={2}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'contained'}
              color={action.color || 'primary'}
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PageHeader;
