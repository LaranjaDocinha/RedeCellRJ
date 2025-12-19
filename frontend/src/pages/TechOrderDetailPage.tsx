import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom'; // Assumindo react-router-dom
import LoadingSpinner from '../components/LoadingSpinner';
import PhotoUploadComponent from '../components/PhotoUploadComponent';
import ChecklistFormComponent from '../components/ChecklistFormComponent';
import OrderTrackingCard from '../components/OrderTrackingCard'; // Reutilizar o card para exibição de detalhes
import { AppError } from '../../../backend/src/utils/errors';

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
  inspection_checklist?: any; // Para armazenar o checklist preenchido
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

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/portal/orders/${orderId}`, {
          // No backend, a rota para o tech usa /api/tech/orders, mas o controller do public portal já retorna os detalhes completos.
          // Para simplificar, vou usar a rota do portal para obter os detalhes completos da OS, mas o ideal seria ter um endpoint específico no /api/tech
          headers: {
            // 'Authorization': `Bearer ${yourAuthToken}`, // Exemplo para rota tech autenticada
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar os detalhes da OS.');
        }
        setOrder(data);

        // Fetch checklist template
        const checklistResponse = await fetch(`${apiBaseUrl}/tech/checklists?type=pre-repair`); // Fetch pre-repair checklist
        const checklistData = await checklistResponse.json();
        if (!checklistResponse.ok) {
          throw new Error(checklistData.message || 'Não foi possível carregar o template do checklist.');
        }
        setChecklistTemplate(checklistData);

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
    setIsChecklistSubmitted(false); // Reset status
    try {
      const response = await fetch(`${apiBaseUrl}/tech/orders/${orderId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourAuthToken}`,
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

      <OrderTrackingCard order={order} /> {/* Reutilizando o componente de detalhes */}

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
    </PageContainer>
  );
};

export default TechOrderDetailPage;
