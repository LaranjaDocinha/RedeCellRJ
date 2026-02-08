import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PhotoUploadComponent from '../components/PhotoUploadComponent';
import ChecklistFormComponent from '../components/ChecklistFormComponent';
import OrderTrackingCard from '../components/OrderTrackingCard';
import WebcamCapture from '../components/WebcamCapture';
import { AppError } from '../../../backend/src/utils/errors';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { Mic } from '@mui/icons-material';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 25px;
`;

const SectionContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ImageGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const GalleryImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const FloatingMic = styled.button<{ listening: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.listening ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${props => props.listening ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
  }
`;

interface OrderDetails {
  id: number;
  device_name: string;
  problem_description: string;
  status: string;
  estimated_cost?: number;
  final_cost?: number;
  entry_date: string;
  delivery_date?: string;
  customer_name: string;
  branch_name: string;
  notes?: string;
  items: { description: string; unit_price: number; quantity: number }[];
  photos: { url: string; type: string }[];
  inspection_checklist?: any;
}

interface TechOrderDetailPageProps {
  apiBaseUrl?: string;
}

const TechOrderDetailPage: React.FC<TechOrderDetailPageProps> = ({ apiBaseUrl = '/api' }) => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklistTemplate, setChecklistTemplate] = useState<any>(null);
  const [isChecklistSubmitted, setIsChecklistSubmitted] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleWebcamCapture = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('photo', blob, `bench-snapshot-${Date.now()}.jpg`);
    formData.append('type', 'internal');
    formData.append('description', 'Snapshot Automático de Bancada');

    try {
      const response = await fetch(`${apiBaseUrl}/tech/orders/${orderId}/photos`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const photo = await response.json();
        if (order) {
            setOrder({ ...order, photos: [...order.photos, { url: photo.url, type: 'internal' }] });
        }
      }
    } catch (err) {
      console.error('Failed to upload bench snapshot:', err);
    }
  };

  // Voice Commands
  const { isListening, startListening, supported, speak } = useVoiceCommands([
    {
      command: 'status',
      action: () => speak(`O status atual é ${order?.status || 'desconhecido'}`),
      feedback: 'Verificando status'
    },
    {
      command: 'cliente',
      action: () => speak(`O cliente é ${order?.customer_name}`),
    },
    {
      command: 'problema',
      action: () => speak(`Relato: ${order?.problem_description}`),
    }
  ]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/portal/orders/${orderId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar os detalhes da OS.');
        }
        setOrder(data);

        const checklistResponse = await fetch(`${apiBaseUrl}/tech/checklists?type=pre-repair`);
        const checklistData = await checklistResponse.json();
        if (!checklistResponse.ok) {
          // Fail gracefully if checklist template is missing (maybe seed data issue in some environments)
           console.warn('Checklist template not found');
        } else {
            setChecklistTemplate(checklistData);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, apiBaseUrl]);

  const handlePhotoUploadSuccess = (photoUrl: string, type: 'entry' | 'exit' | 'internal') => {
    if (order) {
      setOrder({ ...order, photos: [...order.photos, { url: photoUrl, type }] });
    }
    alert('Foto enviada com sucesso!');
  };

  const handleChecklistSubmit = async (checklistData: any) => {
    setIsChecklistSubmitted(false);
    try {
      const response = await fetch(`${apiBaseUrl}/tech/orders/${orderId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checklistData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Falha ao enviar o checklist.');
      }
      setIsChecklistSubmitted(true);
      alert('Checklist enviado com sucesso!');
    } catch (err: any) {
      setError(err.message);
    }
  };


  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando detalhes da Ordem de Serviço...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <h2 style={{ textAlign: 'center', color: '#e74c3c' }}>Erro ao Carregar OS</h2>
        <p style={{ textAlign: 'center' }}>{error}</p>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <h2 style={{ textAlign: 'center' }}>OS Não Encontrada</h2>
        <p style={{ textAlign: 'center' }}>A Ordem de Serviço que você procura não foi encontrada.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>Detalhes da OS #{order.id}</Title>

      <OrderTrackingCard order={order} />

      <SectionContainer>
        <h3>Monitoramento de Bancada (Live)</h3>
        <WebcamCapture onCapture={handleWebcamCapture} />
      </SectionContainer>

      <SectionContainer>
        <h3>Fotos da Ordem de Serviço</h3>
        {order.photos && order.photos.length > 0 ? (
          <ImageGallery>
            {order.photos.map((photo, index) => (
              <GalleryImage key={index} src={photo.url} alt={`OS Photo ${index} (${photo.type})`} />
            ))}
          </ImageGallery>
        ) : (
          <p>Nenhuma foto adicionada ainda.</p>
        )}
        <PhotoUploadComponent
          serviceOrderId={order.id}
          onUploadSuccess={handlePhotoUploadSuccess}
          isLoading={isUploadingPhoto}
        />
      </SectionContainer>

      {checklistTemplate && (
        <SectionContainer>
          <ChecklistFormComponent
            serviceOrderId={order.id}
            checklistTemplate={checklistTemplate}
            onSubmit={handleChecklistSubmit}
            isSubmitted={isChecklistSubmitted}
          />
        </SectionContainer>
      )}

      {supported && (
        <FloatingMic onClick={startListening} listening={isListening} title="Comando de Voz">
            <Mic />
        </FloatingMic>
      )}
    </PageContainer>
  );
};

export default TechOrderDetailPage;
