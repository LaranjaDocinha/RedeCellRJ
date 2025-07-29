import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';

import { useTheme } from '../../context/ThemeContext';
import { get } from '../../helpers/api_helper';
import useDebounce from '../../hooks/useDebounce';
import './CommandBar.scss';

const navigationData = [
  { name: 'Dashboard', path: '/dashboard', icon: 'bx-home-alt' },
  { name: 'PDV (Ponto de Venda)', path: '/pdv', icon: 'bx-store' },
  { name: 'Produtos', path: '/products', icon: 'bx-package' },
  { name: 'Serviços e Reparos', path: '/repairs', icon: 'bx-wrench' },
  { name: 'Clientes', path: '/customers', icon: 'bx-user' },
  { name: 'Fornecedores', path: '/suppliers', icon: 'bx-buildings' },
  { name: 'Histórico de Vendas', path: '/sales-history', icon: 'bx-history' },
  { name: 'Configurações', path: '/settings', icon: 'bx-cog' },
];

const quickActions = [
  { name: 'Adicionar Novo Produto', path: '/products/new', icon: 'bx-plus-circle' },
  { name: 'Adicionar Novo Cliente', path: '/customers/new', icon: 'bx-user-plus' },
  { name: 'Iniciar Nova Venda', path: '/pdv', icon: 'bx-cart-add' },
];

const CommandBar = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle]);

  useEffect(() => {
    const fetchData = async () => {
      if (debouncedSearch.length > 1) {
        try {
          const [productResults, customerResults] = await Promise.all([
            get(`/products/search?query=${debouncedSearch}`),
            get(`/customers?search=${debouncedSearch}`),
          ]);
          setProducts(productResults || []);
          setCustomers(customerResults?.customers || []);
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          setProducts([]);
          setCustomers([]);
        }
      } else {
        setProducts([]);
        setCustomers([]);
      }
    };
    fetchData();
  }, [debouncedSearch]);

  const runCommand = (command) => {
    toggle(false);
    command();
  };

  return (
    <Command.Dialog label='Command Menu' open={isOpen} onOpenChange={toggle}>
      <Command.Input
        placeholder='Busque produtos, clientes ou comandos...'
        value={search}
        onValueChange={setSearch}
      />
      <Command.List>
        <Command.Empty>Nenhum resultado encontrado.</Command.Empty>

        {products.length > 0 && (
          <Command.Group heading='Produtos'>
            {products.map((product) => (
              <Command.Item
                key={`product-${product.id}`}
                value={`Produto: ${product.name}`}
                onSelect={() => runCommand(() => navigate(`/products/view/${product.id}`))}
              >
                <i className='bx bx-package'></i>
                {product.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {customers.length > 0 && (
          <Command.Group heading='Clientes'>
            {customers.map((customer) => (
              <Command.Item
                key={`customer-${customer.id}`}
                value={`Cliente: ${customer.name}`}
                onSelect={() => runCommand(() => navigate(`/customers/view/${customer.id}`))}
              >
                <i className='bx bx-user'></i>
                {customer.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading='Ações Rápidas'>
          {quickActions.map((item) => (
            <Command.Item
              key={item.path}
              value={item.name}
              onSelect={() => runCommand(() => navigate(item.path))}
            >
              <i className={`bx ${item.icon}`}></i>
              {item.name}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading='Navegação'>
          {navigationData.map((item) => (
            <Command.Item
              key={item.path}
              value={item.name}
              onSelect={() => runCommand(() => navigate(item.path))}
            >
              <i className={`bx ${item.icon}`}></i>
              {item.name}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading='Ações do Tema'>
          <Command.Item
            value={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            onSelect={() => runCommand(() => toggleTheme())}
          >
            <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`}></i>
            Mudar para tema {theme === 'dark' ? 'Claro (Light)' : 'Escuro (Dark)'}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export default CommandBar;
