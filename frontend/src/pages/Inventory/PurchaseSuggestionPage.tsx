import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { PageContainer } from '../../styles/common.styles';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import LoadingSpinner from '../../components/LoadingSpinner';

const SuggestionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #555;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const AlertBadge = styled.span<{ level: 'critical' | 'warning' }>`
  background-color: ${props => props.level === 'critical' ? '#ffebee' : '#fff3e0'};
  color: ${props => props.level === 'critical' ? '#c62828' : '#ef6c00'};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const ActionButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: #2980b9;
  }
`;

interface Suggestion {
  productId: number;
  productName: string;
  currentStock: number;
  avgWeeklyConsumption: number;
  daysOfCover: number;
  suggestedQuantity: number;
  classification?: 'A' | 'B' | 'C';
}

const ABCBadge = styled.span<{ classification?: 'A' | 'B' | 'C' }>`
  background: ${props => 
    props.classification === 'A' ? 'linear-gradient(135deg, #d4af37 0%, #f9d423 100%)' : 
    props.classification === 'B' ? 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' : 
    'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'};
  color: white;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-right: 8px;
`;

const IntelligenceCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  gap: 24px;
  align-items: center;
  border-left: 5px solid #3498db;
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  .label { font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px; }
  .value { font-size: 1.4rem; font-weight: 300; color: #2c3e50; }
`;

const PurchaseSuggestionPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/inventory/purchase-suggestions');
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = (suggestion: Suggestion) => {
    alert(`Gerando Pedido de Compra Estratégico para Item ${suggestion.classification}: ${suggestion.productName}`);
  };

  if (loading) return <LoadingSpinner />;

  const stats = {
    criticalA: suggestions.filter(s => s.classification === 'A').length,
    totalToBuy: suggestions.reduce((acc, s) => acc + s.suggestedQuantity, 0),
    capitalRequired: suggestions.reduce((acc, s) => acc + (s.suggestedQuantity * 100), 0) // Mock price
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '5px', fontWeight: 400 }}>Inteligência de Reposição</h1>
          <p style={{ color: '#7f8c8d' }}>Algoritmo preditivo baseado em Curva ABC e Consumo Real</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
             <ABCBadge classification="A">Classe A: 80% Faturamento</ABCBadge>
             <ABCBadge classification="B">Classe B: 15%</ABCBadge>
             <ABCBadge classification="C">Classe C: 5%</ABCBadge>
        </div>
      </div>

      <IntelligenceCard>
        <StatItem>
          <div className="label">Itens 'A' em Risco</div>
          <div className="value" style={{ color: stats.criticalA > 0 ? '#e74c3c' : '#27ae60' }}>{stats.criticalA}</div>
        </StatItem>
        <StatItem>
          <div className="label">Unidades a Comprar</div>
          <div className="value">{stats.totalToBuy}</div>
        </StatItem>
        <StatItem>
          <div className="label">Urgência do Sistema</div>
          <div className="value">{suggestions.some(s => s.daysOfCover < 3) ? 'ALTA' : 'NORMAL'}</div>
        </StatItem>
      </IntelligenceCard>

      {suggestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
            <CheckCircle style={{ fontSize: 60, color: '#2ecc71', marginBottom: '15px' }} />
            <h2 style={{ fontWeight: 300 }}>Seu estoque está otimizado!</h2>
            <p style={{ color: '#7f8c8d' }}>Nenhuma sugestão de compra gerada pelo algoritmo no momento.</p>
        </div>
      ) : (
        <SuggestionTable>
          <thead>
            <tr>
              <th>Produto</th>
              <th>ABC</th>
              <th>Estoque</th>
              <th>Consumo/Sem</th>
              <th>Cobertura</th>
              <th>Sugestão</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map(item => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td><ABCBadge classification={item.classification}>{item.classification}</ABCBadge></td>
                <td>{item.currentStock}</td>
                <td>{item.avgWeeklyConsumption}</td>
                <td>
                    <AlertBadge level={item.daysOfCover < (item.classification === 'A' ? 14 : 7) ? 'critical' : 'warning'}>
                        <Warning fontSize="small" />
                        {item.daysOfCover} dias
                    </AlertBadge>
                </td>
                <td style={{ fontWeight: 400, color: '#27ae60' }}>+ {item.suggestedQuantity} un</td>
                <td>
                    <ActionButton onClick={() => handleCreateOrder(item)} style={{ borderRadius: '12px' }}>
                        <ShoppingCart fontSize="small" /> Gerar Pedido
                    </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </SuggestionTable>
      )}
    </PageContainer>
  );
};

export default PurchaseSuggestionPage;