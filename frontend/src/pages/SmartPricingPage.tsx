import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PricingRuleCard from '../components/PricingRuleCard';
import PricingRuleForm from '../components/PricingRuleForm';
import LoadingSpinner from '../components/LoadingSpinner';
// import { AppError } from '../../../backend/src/utils/errors'; // Removido, AppError é do backend
import Button from '../components/Button';
import Modal from '../components/Modal'; // Assumindo componente Modal
import { useAuth } from '../contexts/AuthContext'; // Para pegar o token de autenticação

const PageContainer = styled(motion.div)`
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 30px;
`;

const RuleList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const EmptyState = styled.p`
  text-align: center;
  color: #777;
  font-size: 1.1em;
  margin-top: 50px;
`;

interface PricingRule {
  id: number;
  name: string;
  condition_type: string;
  condition_value: any;
  action_type: string;
  action_value: number;
  is_active: boolean;
  priority: number;
}

interface SmartPricingPageProps {
  apiBaseUrl?: string;
}

const SmartPricingPage: React.FC<SmartPricingPageProps> = ({ apiBaseUrl = '/api' }) => {
  const { authToken } = useAuth(); // Obter token de autenticação
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | undefined>(undefined);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/pricing/rules`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar regras de precificação.');
      }
      setRules(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, authToken]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleEditRule = (ruleId: number) => {
    const ruleToEdit = rules.find((rule) => rule.id === ruleId);
    if (ruleToEdit) {
      setEditingRule(ruleToEdit);
      setShowFormModal(true);
    }
  };

  const handleToggleRuleStatus = async (ruleId: number, currentStatus: boolean) => {
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/pricing/rules/${ruleId}`, {
        method: 'PUT', // PUT para atualização completa, PATCH para parcial
        headers: authHeaders,
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar status da regra.');
      }
      fetchRules(); // Recarrega as regras
    } catch (err: any) {
      setError(err.message);
      alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmittingForm(true);
    setFormError(null);
    setFormSubmitted(false);
    try {
      const method = editingRule ? 'PUT' : 'POST';
      const url = editingRule ? `${apiBaseUrl}/admin/pricing/rules/${editingRule.id}` : `${apiBaseUrl}/admin/pricing/rules`;
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Erro ao salvar a regra.');
      }
      setFormSubmitted(true);
      setShowFormModal(false); // Fechar modal após sucesso
      fetchRules(); // Atualizar a lista
      alert('Regra salva com sucesso!');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return (
      <PageContainer initial="hidden" animate="visible" variants={pageVariants}>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando regras de precificação...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer initial="hidden" animate="visible" variants={pageVariants}>
        <Title>Gerenciamento de Precificação Inteligente</Title>
        <p style={{ textAlign: 'center', color: '#e74c3c' }}>Erro: {error}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer initial="hidden" animate="visible" variants={pageVariants}>
      <Title>Gerenciamento de Precificação Inteligente</Title>

      <Button onClick={() => { setEditingRule(undefined); setShowFormModal(true); }} style={{ marginBottom: '20px' }}>
        + Nova Regra de Precificação
      </Button>

      {rules.length === 0 ? (
        <EmptyState>Nenhuma regra de precificação configurada.</EmptyState>
      ) : (
        <RuleList>
          {rules.map((rule) => (
            <PricingRuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleEditRule}
              onToggleStatus={handleToggleRuleStatus}
            />
          ))}
        </RuleList>
      )}

      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingRule(undefined);
          setFormSubmitted(false);
          setFormError(null);
        }}
        title={editingRule ? "Editar Regra de Precificação" : "Criar Nova Regra de Precificação"}
      >
        <PricingRuleForm
          initialData={editingRule}
          onSubmit={handleFormSubmit}
          isLoading={isSubmittingForm}
          error={formError}
          isSubmitted={formSubmitted}
        />
      </Modal>
    </PageContainer>
  );
};

export default SmartPricingPage;
