import React, { useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

const LabelPrintModal = ({ isOpen, toggle, selectedVariations }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'etiquetas-produtos',
  });

  // Estilos para a etiqueta
  const labelStyle = {
    width: '180px',
    height: '90px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '5px',
    margin: '5px',
    display: 'inline-block',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const productNameStyle = {
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 5px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const priceStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '5px 0',
  };

  return (
    <Modal fade={false} isOpen={isOpen} size='lg' toggle={toggle}>
      <ModalHeader toggle={toggle}>Imprimir Etiquetas</ModalHeader>
      <ModalBody>
        <p>As seguintes etiquetas serão impressas. Verifique e clique em "Imprimir".</p>

        {/* Componente que será impresso */}
        <div ref={componentRef} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {(selectedVariations || []).map((variation) => (
              <div key={variation.id} style={labelStyle}>
                <p style={productNameStyle}>{variation.product_name}</p>
                <Barcode
                  fontSize={10}
                  height={25}
                  margin={2}
                  value={variation.barcode || 'P' + variation.product_id + 'V' + variation.id}
                />
                <p style={priceStyle}>R$ {parseFloat(variation.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
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
