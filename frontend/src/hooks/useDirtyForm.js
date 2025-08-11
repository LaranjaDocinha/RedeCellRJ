import { create } from 'zustand';

const useDirtyFormStore = create((set) => ({
  isDirty: false,
  message: 'Você tem alterações não salvas. Tem certeza que deseja sair?',
  proceedNavigation: () => {},

  setDirty: (dirty, msg) => set({ isDirty: dirty, message: msg || 'Você tem alterações não salvas. Tem certeza que deseja sair?' }),
  
  setProceedNavigation: (callback) => set({ proceedNavigation: callback }),

  reset: () => set({ isDirty: false, message: '', proceedNavigation: () => {} }),
}));

export const useDirtyForm = useDirtyFormStore;
