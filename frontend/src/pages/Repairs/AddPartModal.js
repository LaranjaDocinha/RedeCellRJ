import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import { debounce } from 'lodash';
import axios from 'axios';
import { toast } from 'react-toastify';

import config from '../../config';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const AddPartModal = ({ isOpen, toggle, repairId, onPartAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = async (query) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.api.API_URL}/api/products?search=${query}&limit=10`,
      );
      const flattenedVariations = response.data.products.flatMap((p) =>
        p.variations.map((v) => ({ ...v, product_name: p.name })),
      );
      setResults(flattenedVariations);
    } catch (err) {
      toast.error('Falha ao buscar produtos.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchProducts, 300), []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleAddPart = async (variation) => {
    if (variation.stock_quantity <= 0) {
      toast.warn('Este item está fora de estoque e não pode ser adicionado.');
      return;
    }

    const quantity = prompt(
      `Quantas unidades de "${variation.product_name} (${variation.color})" você deseja usar?`,
      '1',
    );
    if (quantity === null || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return; // Cancelado ou inválido
    }

    try {
      await axios.post(`${config.api.API_URL}/api/repairs/${repairId}/parts`, {
        variation_id: variation.id,
        quantity_used: parseInt(quantity),
      });
      toast.success('Peça adicionada com sucesso!');
      onPartAdded(); // Callback para recarregar os detalhes da O.S.
      toggle(); // Fecha o modal
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao adicionar a peça.';
      toast.error(errorMessage);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Adicionar Peça ao Reparo</ModalHeader>
      <ModalBody>
        <Input
          placeholder='Buscar peça por nome ou código...'
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {loading && (
          <div className='text-center my-3'>
            <LoadingSpinner />
          </div>
        )}
        <ListGroup className='mt-3' style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {results.map((v) => (
            <ListGroupItem
              key={v.id}
              action
              className='d-flex justify-content-between align-items-center'
              disabled={v.stock_quantity <= 0}
              onClick={() => handleAddPart(v)}
            >
              <div>
                <strong>{v.product_name}</strong> ({v.color})
                <br />
                <small className='text-muted'>Estoque: {v.stock_quantity}</small>
              </div>
              <span>R$ {parseFloat(v.price).toFixed(2)}</span>
            </ListGroupItem>
          ))}
        </ListGroup>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddPartModal;
