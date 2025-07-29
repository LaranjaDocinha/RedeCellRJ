import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Container, Button } from 'reactstrap';

import Label from './components/Label';
import './components/PrintLabels.css';

const PrintLabels = () => {
  document.title = 'Imprimir Etiquetas | RedeCellRJ PDV';
  const location = useLocation();
  const navigate = useNavigate();
  const componentRef = useRef();

  const { variationsToPrint } = location.state || {};

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  if (!variationsToPrint || variationsToPrint.length === 0) {
    return (
      <div className='page-content'>
        <Container>
          <h4>Nenhum produto selecionado para impressão.</h4>
          <Button color='primary' onClick={() => navigate('/products')}>
            Voltar para Produtos
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <h4>Pré-visualização de Impressão de Etiquetas</h4>
            <div>
              <Button className='me-2' color='secondary' onClick={() => navigate('/products')}>
                Cancelar
              </Button>
              <Button color='primary' onClick={handlePrint}>
                <i className='bx bx-printer me-1'></i> Imprimir
              </Button>
            </div>
          </div>

          <div ref={componentRef} className='print-area'>
            <div className='label-grid'>
              {variationsToPrint.map((v, index) => (
                <Label
                  key={index}
                  product={{
                    name: v.product_name,
                    color: v.color,
                    price: v.price,
                    barcode: v.barcode,
                  }}
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PrintLabels;
