import React, { useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { 
  StyledSidebar, 
  SidebarHeader, 
  SidebarTitle, 
  SidebarCloseBtn, 
  SidebarNav, 
  SidebarNavItem 
} from './Sidebar.styled';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Save the element that triggered the sidebar
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus on the first focusable element inside the sidebar
      const firstFocusable = sidebarRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    } else {
      // Return focus to the trigger element when sidebar closes
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Trap focus inside the sidebar and handle Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !sidebarRef.current) return;

    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }

    if (event.key === 'Tab') {
      const focusableElements = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <StyledSidebar isOpen={isOpen} ref={sidebarRef} role="navigation" aria-label="Main navigation" id="main-sidebar">
      <SidebarHeader>
        <SidebarTitle>Menu</SidebarTitle>
        <SidebarCloseBtn onClick={onClose} aria-label="Close menu">
          <FaTimes />
        </SidebarCloseBtn>
      </SidebarHeader>
      <SidebarNav>
        <ul>
          <li><SidebarNavItem as={NavLink} to="/dashboard" onClick={onClose} data-tut="sidebar-dashboard-link">Dashboard</SidebarNavItem></li>
          <li><SidebarNavItem as={NavLink} to="/products" onClick={onClose} data-tut="sidebar-products-link">Products</SidebarNavItem></li>
          <li><SidebarNavItem as={NavLink} to="/pos" onClick={onClose}>Sales</SidebarNavItem></li>
          <li><SidebarNavItem as={NavLink} to="/customers" onClick={onClose}>Customers</SidebarNavItem></li>
          <li><SidebarNavItem as={NavLink} to="/kanban" onClick={onClose} data-tut="sidebar-kanban-link">Kanban</SidebarNavItem></li>
          <li><SidebarNavItem as={NavLink} to="/inventory" onClick={onClose}>Inventory</SidebarNavItem></li>
          <li><SidebarNavItem as={NavLink} to="/reports" onClick={onClose}>Reports</SidebarNavItem></li>
        </ul>
      </SidebarNav>
    </StyledSidebar>
  );
};

export default Sidebar;
