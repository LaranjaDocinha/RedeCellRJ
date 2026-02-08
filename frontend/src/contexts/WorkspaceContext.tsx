import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  path: string;
}

interface WorkspaceContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'>) => void;
  removeTab: (id: string) => void;
  setActiveTabId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const addTab = (newTab: Omit<Tab, 'id'>) => {
    // Evitar duplicatas por path
    const existing = tabs.find(t => t.path === newTab.path);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const tabWithId = { ...newTab, id };
    
    // Limite de 5 abas para manter performance
    setTabs(prev => [...prev.slice(-4), tabWithId]);
    setActiveTabId(id);
  };

  const removeTab = (id: string) => {
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeTabId === id) {
      setActiveTabId(tabs.length > 1 ? tabs[tabs.length - 2].id : null);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ tabs, activeTabId, addTab, removeTab, setActiveTabId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};
