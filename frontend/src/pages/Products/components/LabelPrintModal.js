import React, { useRef, useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Input, FormGroup, Label } from 'reactstrap';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import './LabelPrintModal.scss'; // Import the new SCSS file

const LabelPrintModal = ({ isOpen, toggle, selectedVariations }) => {
  const componentRef = useRef();
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    // Initialize quantities when modal opens or selectedVariations change
    const initialQuantities = {};
    selectedVariations.forEach(v => {
      initialQuantities[v.id] = 1; // Default to 1 label per item
    });
    setQuantities(initialQuantities);
  }, [selectedVariations]);

  const handleQuantityChange = (id, value) => {
    const parsedValue = parseInt(value, 10);
    setQuantities(prev => ({
      ...prev,
      [id]: isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue,
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'etiquetas-produtos',
    pageStyle: '@page { size: auto; margin: 0mm; }',
  });

  const generateLabels = () => {
    const labels = [];
    selectedVariations.forEach(variation => {
      const numLabels = quantities[variation.id] || 0;
      for (let i = 0; i < numLabels; i++) {
        labels.push(
          <div key={`${variation.id}-${i}`} className="product-label">
            <p className="product-label-name">{variation.product_name}</p>
            <div className="product-label-barcode">
              <Barcode
                fontSize={10}
                height={25}
                margin={2}
                value={variation.barcode || 'P' + variation.product_id + 'V' + variation.id}
              />
            </div>
            <p className="product-label-price">R$ {parseFloat(variation.price).toFixed(2)}</p>
          </div>
        );
      }
    });
    return labels;
  };

  return (
    <Modal fade={false} isOpen={isOpen} size='lg' toggle={toggle}>
      <ModalHeader toggle={toggle}>Imprimir Etiquetas</ModalHeader>
      <ModalBody>
        <p>Defina a quantidade de etiquetas para cada produto e clique em "Imprimir".</p>

        <Table responsive striped className="mb-4">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código de Barras</th>
              <th>Preço</th>
              <th>Qtd. Etiquetas</th>
            </tr>
          </thead>
          <tbody>
            {(selectedVariations || []).map((variation) => (
              <tr key={variation.id}>
                <td>{variation.product_name} {variation.color && `(${variation.color})`}</td>
                <td>{variation.barcode}</td>
                <td>R$ {parseFloat(variation.price).toFixed(2)}</td>
                <td>
                  <FormGroup className="mb-0">
                    <Input
                      type="number"
                      min="0"
                      value={quantities[variation.id] || 0}
                      onChange={(e) => handleQuantityChange(variation.id, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </FormGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Componente que será impresso */}
        <div ref={componentRef} className="label-print-container">
          {generateLabels()}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggle}>
          Cancelar
        </Button>
        <Button color='primary' onClick={handlePrint}>
          <i className='bx bx-printer me-1'></i>
          Imprimir
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LabelPrintModal;
