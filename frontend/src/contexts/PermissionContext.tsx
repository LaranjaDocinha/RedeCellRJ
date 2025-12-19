import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user with permissions

interface Permission {
  action: string;
  subject: string;
}

interface PermissionContextType {
  hasPermission: (action: string, subject: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Get the authenticated user from AuthContext

  const hasPermission = (action: string, subject: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    // Check if the user has the specific permission
    const hasSpecificPermission = user.permissions.some(
      (p: Permission) => p.action === action && p.subject === subject
    );

    // Check for 'manage' permission on the subject, which implies all actions
    const hasManagePermission = user.permissions.some(
      (p: Permission) => p.action === 'manage' && p.subject === subject
    );

    // Check for 'manage' permission on 'all', which implies all actions on all subjects
    const hasGlobalManagePermission = user.permissions.some(
      (p: Permission) => p.action === 'manage' && p.subject === 'all'
    );

    return hasSpecificPermission || hasManagePermission || hasGlobalManagePermission;
  };

  return (
    <PermissionContext.Provider value={{ hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
