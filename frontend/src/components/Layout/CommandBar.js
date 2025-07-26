import React, { useState, useEffect, useRef } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import './CommandBar.scss';

const searchData = [
  { type: 'Página', name: 'Dashboard', path: '/dashboard', icon: 'bx-home-alt' },
  { type: 'Página', name: 'PDV (Ponto de Venda)', path: '/pdv', icon: 'bx-store' },
  { type: 'Página', name: 'Produtos', path: '/products', icon: 'bx-package' },
  { type: 'Página', name: 'Serviços e Reparos', path: '/repairs', icon: 'bx-wrench' },
  { type: 'Página', name: 'Clientes', path: '/customers', icon: 'bx-user' },
  { type: 'Página', name: 'Fornecedores', path: '/suppliers', icon: 'bx-buildings' },
  { type: 'Página', name: 'Pedidos de Compra', path: '/purchase-orders', icon: 'bx-file' },
  { type: 'Página', name: 'Devoluções', path: '/returns', icon: 'bx-log-out-circle' },
  { type: 'Página', name: 'Caixa', path: '/cashier', icon: 'bx-calculator' },
  { type: 'Página', name: 'Histórico de Vendas', path: '/sales-history', icon: 'bx-history' },
  { type: 'Página', name: 'Gestão de Estoque', path: '/stock', icon: 'bx-archive' },
  { type: 'Página', name: 'Financeiro', path: '/finance', icon: 'bx-dollar-circle' },
  { type: 'Página', name: 'Relatórios', path: '/reports', icon: 'bx-bar-chart-alt-2' },
  { type: 'Página', name: 'Usuários', path: '/users', icon: 'bx-group' },
  { type: 'Página', name: 'Configurações', path: '/settings', icon: 'bx-cog' },
  { type: 'Ação', name: 'Nova Venda', path: '/pdv', icon: 'bx-plus' },
  { type: 'Ação', name: 'Novo Reparo', path: '/repairs/new', icon: 'bx-plus' },
  { type: 'Ação', name: 'Novo Produto', path: '/products', action: 'openAddModal' }, // Exemplo de ação customizada
];

const fuseOptions = {
  keys: ['name', 'type'],
  includeScore: true,
  threshold: 0.4,
};

const CommandBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const fuse = new Fuse(searchData, fuseOptions);

  useEffect(() => {
    if (query.length > 0) {
      const searchResult = fuse.search(query);
      setResults(searchResult.map(res => res.item));
    } else {
      setResults(searchData.filter(item => item.type === 'Página')); // Mostrar páginas por padrão
    }
    setActiveIndex(0);
  }, [query]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setQuery('');
  };

  const handleResultClick = (item) => {
    toggleModal();
    // Aqui você poderia adicionar lógica para 'action'
    navigate(item.path);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        handleResultClick(results[activeIndex]);
      }
    }
  };

  return (
    <>
      <button onClick={toggleModal} className="command-bar-search-icon" aria-label="Abrir busca (Ctrl+K)">
        <i className="bx bx-search"></i>
        <span className="command-bar-shortcut">Ctrl+K</span>
      </button>

      <Modal isOpen={isOpen} toggle={toggleModal} centered className="command-bar-modal" onKeyDown={handleKeyDown}>
        <ModalBody>
          <div className="search-input-wrapper">
            <i className="bx bx-search"></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar páginas ou ações..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="search-results">
            {results.length > 0 ? (
              results.map((item, index) => (
                <li 
                  key={`${item.path}-${item.name}`}
                  className={`result-item ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => handleResultClick(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <i className={`bx ${item.icon || 'bx-file'}`}></i>
                  <span>{item.name}</span>
                  <span className="result-item-type">{item.type}</span>
                </li>
              ))
            ) : (
              <div className="no-results">Nenhum resultado encontrado para "{query}".</div>
            )}
          </ul>
        </ModalBody>
      </Modal>
    </>
  );
};

export default CommandBar;
