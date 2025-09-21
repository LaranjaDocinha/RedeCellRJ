
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  WidgetList, 
  WidgetItem, 
  ModalActions, 
  ModalButton 
} from './ManageWidgetsModal.styled';

interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
}

interface ManageWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onSave: (updatedWidgets: WidgetConfig[]) => void;
}

const ManageWidgetsModal: React.FC<ManageWidgetsModalProps> = ({ isOpen, onClose, widgets, onSave }) => {
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleCheckboxChange = (id: string) => {
    setLocalWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, visible: !widget.visible } : widget
      )
    );
  };

  const handleSave = () => {
    onSave(localWidgets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Manage Dashboard Widgets</h2>
          <button onClick={onClose}><FaTimes /></button>
        </ModalHeader>
        <WidgetList>
          {localWidgets.map(widget => (
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
          <ModalButton primary onClick={handleSave}>Save</ModalButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ManageWidgetsModal;
