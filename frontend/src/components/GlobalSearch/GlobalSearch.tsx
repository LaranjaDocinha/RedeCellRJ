
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBoxOpen, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import { 
  Overlay, 
  SearchContainer, 
  SearchInputWrapper, 
  SearchInput, 
  ResultsContainer, 
  ResultGroupTitle, 
  ResultItem, 
  NoResults 
} from './GlobalSearch.styled';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

interface SearchResult {
  id: string;
  name: string;
  type: 'product' | 'customer';
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      setError(null);
      setSelectedIndex(0);
      // A requisição agora usará o proxy configurado no package.json
      fetch(`/api/search?q=${debouncedQuery}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Search request failed');
          }
          return res.json();
        })
        .then(data => {
          const combinedResults: SearchResult[] = [
            ...data.products.map((p: any) => ({ ...p, type: 'product' })),
            ...data.customers.map((c: any) => ({ ...c, type: 'customer' })),
          ];
          setResults(combinedResults);
          setLoading(false);
        })
        .catch(err => {
          console.error('Search failed:', err);
          setError('Could not fetch search results. Please try again.');
          setLoading(false);
        });
    } else {
      setResults([]);
      setError(null);
    }
  }, [debouncedQuery]);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const handleNavigation = useCallback((item: SearchResult) => {
    if (!item) return;
    if (item.type === 'product') {
      navigate(`/products/${item.id}`);
    } else if (item.type === 'customer') {
      // TODO: Create a customer detail page and navigate to it.
      console.log(`Navigate to customer: ${item.name} (id: ${item.id})`);
      navigate(`/dashboard`); // Navigate to a safe page for now
    }
    handleClose();
  }, [navigate, handleClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleNavigation(results[selectedIndex]);
      }
    }
  }, [results, selectedIndex, handleNavigation]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  let lastType: string | null = null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <SearchContainer
            variants={containerVariants}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <SearchInputWrapper>
              <FaSearch />
              <SearchInput
                ref={inputRef}
                placeholder="Search for products, customers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </SearchInputWrapper>
            <ResultsContainer>
              {loading && <ResultItem isSelected={false}>Loading...</ResultItem>}
              {error && <ResultItem isSelected={false}><FaExclamationTriangle /> {error}</ResultItem>}
              {!loading && !error && debouncedQuery && !results.length && (
                <NoResults>No results found for "{debouncedQuery}"</NoResults>
              )}
              
              {!loading && !error && results.map((item, index) => {
                const showTitle = item.type !== lastType;
                lastType = item.type;
                return (
                  <React.Fragment key={item.id}>
                    {showTitle && <ResultGroupTitle>{item.type}s</ResultGroupTitle>}
                    <ResultItem
                      isSelected={selectedIndex === index}
                      onClick={() => handleNavigation(item)}
                      onMouseMove={() => setSelectedIndex(index)}
                    >
                      {item.type === 'product' ? <FaBoxOpen /> : <FaUser />}
                      {item.name}
                    </ResultItem>
                  </React.Fragment>
                );
              })}
            </ResultsContainer>
          </SearchContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
