import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  WidgetList,
  WidgetItem,
  ModalActions,
  ModalButton,
} from './ManageWidgetsModal.styled';

/**
 * @interface WidgetConfig
 * @description Define a configuração de um widget para o modal de gerenciamento.
 * @property {string} id - Identificador único do widget.
 * @property {string} title - O título do widget.
 * @property {boolean} visible - Indica se o widget está visível.
 */
interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
}

/**
 * @interface ManageWidgetsModalProps
 * @description Propriedades para o componente ManageWidgetsModal.
 * @property {boolean} isOpen - Indica se o modal está aberto.
 * @property {() => void} onClose - Função de callback para fechar o modal.
 * @property {WidgetConfig[]} widgets - Lista de widgets a serem gerenciados.
 * @property {(updatedWidgets: WidgetConfig[]) => void} onSave - Função de callback para salvar as configurações dos widgets.
 */
interface ManageWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onSave: (updatedWidgets: WidgetConfig[]) => void;
}

/**
 * @function ManageWidgetsModal
 * @description Componente de modal para gerenciar a visibilidade e ordem dos widgets do dashboard.
 * @param {ManageWidgetsModalProps} props - As propriedades do componente.
 * @returns {React.FC | null} O componente ManageWidgetsModal ou null se não estiver aberto.
 */
const ManageWidgetsModal: React.FC<ManageWidgetsModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onSave,
}) => {
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focar no modal quando ele abre
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCheckboxChange = (id: string) => {
    setLocalWidgets((prev) =>
      prev.map((widget) => (widget.id === id ? { ...widget, visible: !widget.visible } : widget)),
    );
  };

  const handleSave = () => {
    onSave(localWidgets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-widgets-modal-title"
        tabIndex={-1}
      >
        <ModalHeader>
          <h2 id="manage-widgets-modal-title">Manage Dashboard Widgets</h2>
          <button onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </ModalHeader>
        <WidgetList>
          {localWidgets.map((widget) => (
            <WidgetItem key={widget.id}>
              <input
                type="checkbox"
                checked={widget.visible}
                onChange={() => handleCheckboxChange(widget.id)}
              />
              {widget.title}
            </WidgetItem>
          ))}
        </WidgetList>
        <ModalActions>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton primary onClick={handleSave}>
            Save
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ManageWidgetsModal;
