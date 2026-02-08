import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const useWhatsappApi = () => {
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const sendTemplate = async (phone: string, templateName: string, variables: Record<string, string | number>, customerId?: number) => {
    try {
      const response = await fetch('/api/v1/whatsapp/send-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          templateName,
          variables,
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem de WhatsApp');
      }

      addNotification('Mensagem de WhatsApp enfileirada com sucesso!', 'success');
      return true;
    } catch (error: any) {
      addNotification(`Erro: ${error.message}`, 'error');
      return false;
    }
  };

  return { sendTemplate };
};
