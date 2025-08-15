import React, { useState } from 'react';
import { Button, Card, CardBody, CardTitle } from 'reactstrap';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/Common/ConfirmationModal'; // Adjusted path

const ResetSettingsSection = () => {
  const [resetModalOpen, setResetModal] = useState(false);

  const handleResetConfirm = () => {
    // Lógica para resetar as configurações
    // Por enquanto, apenas um toast e console.log
    // console.log('Configurações resetadas para os padrões!');
    toast.success('Configurações resetadas para os padrões!');
    setResetModal(false);
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5" className="mb-4">Resetar Configurações</CardTitle>
        <p className="mb-3">
          Cuidado: Ao clicar no botão abaixo, todas as configurações do sistema serão resetadas para os valores padrão de fábrica. Esta ação é irreversível.
        </p>
        <Button color="warning" onClick={() => setResetModal(true)}>
          <i className="bx bx-reset me-2"></i>Resetar para Padrões
        </Button>
      </CardBody>

      <ConfirmationModal
        isOpen={resetModalOpen}
        toggle={() => setResetModal(false)}
        onConfirm={handleResetConfirm}
        title='Confirmar Reset?'
        message='Tem certeza que deseja resetar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.'
      />
    </Card>
  );
};

export default ResetSettingsSection;