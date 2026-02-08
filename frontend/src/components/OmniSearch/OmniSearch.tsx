import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk'; 
import { 
  FaSearch, FaBox, FaUser, FaShoppingCart, FaWhatsapp, FaTools, 
  FaHistory, FaArrowRight, FaCog, FaExclamationTriangle, FaChartLine, FaClock
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useSound } from '../../contexts/SoundContext'; // Import sound context
import {
  Overlay, Container, Header, SearchIconWrapper, StyledInput,
  MainContent, ListColumn, PreviewColumn, Item, ItemContent, IconBox, TextContainer,
  ItemTitle, ItemSubtitle, ActionPanel, ActionGroup, ActionKey,
  ShortcutHint, EmptyState, PreviewHeader, PreviewImage, PreviewTitle, 
  PreviewSubtitle, PreviewSection, SectionLabel, InfoGrid, InfoCard, 
  InfoLabel, InfoValue, TagList, Tag
} from './OmniSearch.styled';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchResult {
  id: string;
  type: 'product' | 'customer' | 'service_order' | 'page';
  name: string;
  description?: string;
  icon?: React.ReactNode;
  action?: () => void;
  meta?: any; 
}

interface OmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const OmniSearch: React.FC<OmniSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const { playSound } = useSound(); 
  
  // Fetch recent activities when opening empty
  useEffect(() => {
    if (isOpen && !query) {
      fetch('/api/v1/activity-feed?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setRecentActivities(data))
      .catch(err => console.error('Failed to fetch activities', err));
    }
  }, [isOpen, query, token]);

  // Memoized default pages
  const defaultPages: SearchResult[] = useMemo(() => [
    { id: 'nav-pos', type: 'page', name: 'Ponto de Venda (PDV)', description: 'Ir para tela de vendas', icon: <FaShoppingCart />, action: () => navigate('/pos') },
    { id: 'nav-customers', type: 'page', name: 'Clientes', description: 'Gerenciar base de clientes', icon: <FaUser />, action: () => navigate('/customers') },
    { id: 'nav-tech', type: 'page', name: 'Painel Técnico', description: 'Visualizar ordens de serviço', icon: <FaTools />, action: () => navigate('/tech') },
    { id: 'nav-kanban', type: 'page', name: 'Kanban OS', description: 'Fluxo visual de ordens', icon: <FaBox />, action: () => navigate('/kanban') },
    { id: 'nav-settings', type: 'page', name: 'Configurações', description: 'Ajustes do sistema', icon: <FaCog />, action: () => navigate('/settings') },
  ], [navigate]);

  // Search Effect
  useEffect(() => {
    if (!debouncedQuery) {
      setResults(defaultPages);
      // Select first item by default when resetting
      if (defaultPages.length > 0) setSelectedItemId(defaultPages[0].id);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Falha na busca');
        
        const data = await response.json();
        const mappedResults: SearchResult[] = [];

        // Map Products
        if (data.products) {
          mappedResults.push(...data.products.map((p: any) => ({
            id: `prod-${p.id}`,
            type: 'product',
            name: p.name,
            description: `Estoque: ${p.stock_quantity || 0} | R$ ${p.price || 0}`,
            icon: <FaBox />,
            meta: p,
            action: () => navigate(`/products/${p.id}`)
          })));
        }

        // Map Customers
        if (data.customers) {
          mappedResults.push(...data.customers.map((c: any) => ({
            id: `cust-${c.id}`,
            type: 'customer',
            name: c.name,
            description: c.phone || c.email,
            icon: <FaUser />,
            meta: c,
            action: () => navigate(`/customers/${c.id}`)
          })));
        }
        
        setResults(mappedResults);
        if (mappedResults.length > 0) setSelectedItemId(mappedResults[0].id);

      } catch (error) {
        console.error('OmniSearch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, token, navigate, defaultPages]);

  // Global Key Handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        playSound('click'); // Sound on close
        onClose();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose, playSound]);

  // Reset selected item when opening
  useEffect(() => {
    if (isOpen) {
      playSound('woosh'); // Sound on open
      if (results.length > 0) {
        setSelectedItemId(results[0].id);
      }
    }
  }, [isOpen, playSound]);

  // Get active item for preview
  const activeItem = useMemo(() => {
    if (selectedItemId?.startsWith('act-')) {
      const actId = selectedItemId.replace('act-', '');
      const act = recentActivities.find(a => String(a.id) === actId);
      return act ? { id: selectedItemId, type: 'activity', name: act.type, description: act.description, meta: act } : null;
    }
    return results.find(r => r.id === selectedItemId) || results[0];
  }, [results, selectedItemId, recentActivities]);

  // Render Preview Panel Content
  const renderPreview = () => {
    if (!activeItem) return null;

    if (activeItem.type === 'activity') {
      const act = activeItem.meta;
      return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={activeItem.id}>
          <PreviewHeader>
            <PreviewImage><FaHistory /></PreviewImage>
            <div>
              <PreviewTitle>{act.type.toUpperCase()}</PreviewTitle>
              <PreviewSubtitle>Registro de Log</PreviewSubtitle>
            </div>
          </PreviewHeader>
          <PreviewSection>
            <SectionLabel>Detalhes do Evento</SectionLabel>
            <p style={{ fontSize: '13px', color: '#666' }}>{act.description}</p>
            <InfoCard>
              <InfoLabel>Horário</InfoLabel>
              <InfoValue>{new Date(act.timestamp).toLocaleTimeString()}</InfoValue>
            </InfoCard>
          </PreviewSection>
        </motion.div>
      );
    }

    if (activeItem.type === 'page') {
      return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={activeItem.id}>
          <PreviewHeader>
            <PreviewImage>{activeItem.icon}</PreviewImage>
            <div>
              <PreviewTitle>{activeItem.name}</PreviewTitle>
              <PreviewSubtitle>Navegação do Sistema</PreviewSubtitle>
            </div>
          </PreviewHeader>
          <PreviewSection>
            <SectionLabel>Sobre</SectionLabel>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
              {activeItem.description}. Atalho rápido para acessar esta funcionalidade.
            </p>
          </PreviewSection>
        </motion.div>
      );
    }

    if (activeItem.type === 'customer') {
      const c = activeItem.meta;
      return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={activeItem.id}>
          <PreviewHeader>
            <PreviewImage><FaUser /></PreviewImage>
            <div>
              <PreviewTitle>{c.name}</PreviewTitle>
              <PreviewSubtitle>Cliente Registrado</PreviewSubtitle>
            </div>
          </PreviewHeader>
          
          <PreviewSection>
            <SectionLabel>Resumo Financeiro</SectionLabel>
            <InfoGrid>
              <InfoCard>
                <InfoLabel>LTV (Total Gasto)</InfoLabel>
                <InfoValue>R$ {c.total_spent || '0,00'}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Crédito em Loja</InfoLabel>
                <InfoValue style={{ color: '#2ecc71' }}>R$ {c.store_credit || '0,00'}</InfoValue>
              </InfoCard>
            </InfoGrid>
          </PreviewSection>

          <PreviewSection>
            <SectionLabel>Contato</SectionLabel>
            <InfoCard>
              <InfoLabel>Email</InfoLabel>
              <InfoValue style={{ fontSize: '13px', fontWeight: 500 }}>{c.email || 'Não informado'}</InfoValue>
            </InfoCard>
            <div style={{ marginTop: 8 }}></div>
            <InfoCard>
              <InfoLabel>Telefone / WhatsApp</InfoLabel>
              <InfoValue style={{ fontSize: '13px', fontWeight: 500 }}>{c.phone || 'Não informado'}</InfoValue>
            </InfoCard>
          </PreviewSection>

          <PreviewSection>
            <SectionLabel>Tags</SectionLabel>
            <TagList>
              <Tag $color="#3498db">Cliente Recorrente</Tag>
              {c.loyalty_points > 100 && <Tag $color="#f1c40f">VIP</Tag>}
            </TagList>
          </PreviewSection>
        </motion.div>
      );
    }

    if (activeItem.type === 'product') {
      const p = activeItem.meta;
      return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={activeItem.id}>
          <PreviewHeader>
            <PreviewImage><FaBox /></PreviewImage>
            <div>
              <PreviewTitle>{p.name}</PreviewTitle>
              <PreviewSubtitle>SKU: {p.sku || 'N/A'}</PreviewSubtitle>
            </div>
          </PreviewHeader>

          <PreviewSection>
            <SectionLabel>Estoque e Preço</SectionLabel>
            <InfoGrid>
              <InfoCard>
                <InfoLabel>Preço de Venda</InfoLabel>
                <InfoValue>R$ {Number(p.price).toFixed(2)}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Disponível</InfoLabel>
                <InfoValue style={{ color: p.stock_quantity > 0 ? '#2ecc71' : '#e74c3c' }}>
                  {p.stock_quantity || 0} unid.
                </InfoValue>
              </InfoCard>
            </InfoGrid>
          </PreviewSection>

          <PreviewSection>
            <SectionLabel>Performance</SectionLabel>
            <InfoGrid>
              <InfoCard>
                <InfoLabel><FaChartLine style={{ marginRight: 4 }} /> Saídas (30d)</InfoLabel>
                <InfoValue>12 unid.</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel><FaClock style={{ marginRight: 4 }} /> Última Venda</InfoLabel>
                <InfoValue>2 dias atrás</InfoValue>
              </InfoCard>
            </InfoGrid>
          </PreviewSection>
        </motion.div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Container
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Command 
            loop 
            label="Global Command Menu"
            value={selectedItemId || ''}
            onValueChange={(val) => {
              setSelectedItemId(val);
              playSound('select'); // Sound on navigation
            }}
          >
            <Header>
              <SearchIconWrapper>
                <FaSearch />
              </SearchIconWrapper>
              <StyledInput
                autoFocus
                placeholder="Busque por Produtos, Clientes ou Comandos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <ShortcutHint>ESC</ShortcutHint>
            </Header>

            <MainContent>
              <ListColumn>
                {/* Fixed: cmdk List wrapper needs to be direct child of Command usually, but utilizing styled wrapper */}
                <Command.List style={{ height: '100%' }}>
                  <Command.Empty>
                    <EmptyState>
                      <FaExclamationTriangle size={24} />
                      <span>Nenhum resultado encontrado.</span>
                    </EmptyState>
                  </Command.Empty>

                  {!query && (
                    <>
                      <Command.Group heading="Navegação Rápida">
                        {defaultPages.map((page) => (
                          <Command.Item
                            key={page.id}
                            value={page.id} 
                            onSelect={() => { 
                              playSound('click'); 
                              page.action?.(); 
                              onClose(); 
                            }}
                          >
                            <Item>
                              <ItemContent>
                                <IconBox>{page.icon}</IconBox>
                                <TextContainer>
                                  <ItemTitle>{page.name}</ItemTitle>
                                  <ItemSubtitle>{page.description}</ItemSubtitle>
                                </TextContainer>
                              </ItemContent>
                            </Item>
                          </Command.Item>
                        ))}
                      </Command.Group>

                      {recentActivities.length > 0 && (
                        <Command.Group heading="Atividades Recentes">
                          {recentActivities.map((act) => (
                            <Command.Item
                              key={act.id}
                              value={`act-${act.id}`}
                              onSelect={() => { 
                                playSound('click');
                                if (act.type === 'sale') navigate(`/sales/${act.details?.saleId}`);
                                onClose();
                              }}
                            >
                              <Item>
                                <ItemContent>
                                  <IconBox><FaHistory /></IconBox>
                                  <TextContainer>
                                    <ItemTitle>{act.description || act.type}</ItemTitle>
                                    <ItemSubtitle>{new Date(act.timestamp).toLocaleString()}</ItemSubtitle>
                                  </TextContainer>
                                </ItemContent>
                              </Item>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}
                    </>
                  )}

                  {results.filter(r => r.type === 'customer').length > 0 && (
                    <Command.Group heading="Clientes">
                      {results.filter(r => r.type === 'customer').map((customer) => (
                        <Command.Item
                          key={customer.id}
                          value={customer.id}
                          onSelect={() => { 
                            playSound('click'); // Sound on select
                            customer.action?.(); 
                            onClose(); 
                          }}
                        >
                          <Item>
                            <ItemContent>
                              <IconBox>{customer.icon}</IconBox>
                              <TextContainer>
                                <ItemTitle>{customer.name}</ItemTitle>
                                <ItemSubtitle>{customer.description}</ItemSubtitle>
                              </TextContainer>
                            </ItemContent>
                          </Item>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {results.filter(r => r.type === 'product').length > 0 && (
                    <Command.Group heading="Produtos">
                      {results.filter(r => r.type === 'product').map((product) => (
                        <Command.Item
                          key={product.id}
                          value={product.id}
                          onSelect={() => { 
                            playSound('click'); // Sound on select
                            product.action?.(); 
                            onClose(); 
                          }}
                        >
                          <Item>
                            <ItemContent>
                              <IconBox>{product.icon}</IconBox>
                              <TextContainer>
                                <ItemTitle>{product.name}</ItemTitle>
                                <ItemSubtitle>{product.description}</ItemSubtitle>
                              </TextContainer>
                            </ItemContent>
                          </Item>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                </Command.List>
              </ListColumn>

              <PreviewColumn>
                {renderPreview()}
              </PreviewColumn>
            </MainContent>

            <ActionPanel>
              <ActionGroup>
                <FaArrowRight size={12} /> Navegar / Selecionar
              </ActionGroup>
              <ActionGroup>
                <ActionKey><kbd>↑</kbd> <kbd>↓</kbd></ActionKey>
                <ActionKey><kbd>Enter</kbd></ActionKey>
              </ActionGroup>
            </ActionPanel>
          </Command>
        </Container>
      </Overlay>
    </AnimatePresence>
  );
};

export default OmniSearch;
