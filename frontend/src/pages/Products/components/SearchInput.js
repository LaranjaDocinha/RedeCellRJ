import React, { useState, useEffect, useContext } from 'react';
import { Input, InputGroup, InputGroupText } from 'reactstrap';

import { ProductContext } from '../../../context/ProductContext';
import useDebounce from '../../../hooks/useDebounce';

const SearchInput = () => {
  const { setSearchTerm } = useContext(ProductContext);
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchTerm = useDebounce(inputValue, 300); // 300ms delay

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  return (
    <InputGroup>
      <InputGroupText>
        <i className='bx bx-search-alt-2'></i>
      </InputGroupText>
      <Input
        placeholder='Buscar por nome ou SKU...'
        type='text'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </InputGroup>
  );
};

export default SearchInput;
