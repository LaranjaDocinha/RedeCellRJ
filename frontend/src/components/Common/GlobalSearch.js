import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useDebounce } from '../../hooks/useDebounce';

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  // Atalho de teclado (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Efeito para buscar na API
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/search?q=${debouncedSearch}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(response.data);
      } catch (error) {
        console.error('Erro ao buscar:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Command.Dialog label='Pesquisa Global' open={open} onOpenChange={setOpen}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}>
        Pesquisa Global
      </h1>
      <Command.Input
        placeholder='Pesquisar por clientes, produtos, OS...'
        value={search}
        onValueChange={setSearch}
      />
      <Command.List>
        {loading && <Command.Loading>Buscando...</Command.Loading>}
        {!loading && results.length === 0 && debouncedSearch.length > 1 && (
          <Command.Empty>Nenhum resultado encontrado.</Command.Empty>
        )}

        <Command.Group heading='Resultados'>
          {results.map((item) => (
            <Command.Item key={item.id} onSelect={() => handleSelect(item.path)}>
              <i className={`bx ${item.icon}`}></i>
              {item.name} ({item.type})
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export default GlobalSearch;
