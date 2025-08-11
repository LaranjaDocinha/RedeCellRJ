import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardTitle, Button } from 'reactstrap';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import toast from 'react-hot-toast';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';

// Exemplo de Widgets (você pode criar componentes separados para cada um)
const SalesWidget = () => (
  <Card className='h-100'>
    <CardBody>
      <CardTitle className='h5'>Vendas do Dia</CardTitle>
      <p>R$ 1.234,56</p>
    </CardBody>
  </Card>
);

const TopProductsWidget = () => (
  <Card className='h-100'>
    <CardBody>
      <CardTitle className='h5'>Produtos Mais Vendidos</CardTitle>
      <ul>
        <li>Produto X</li>
        <li>Produto Y</li>
        <li>Produto Z</li>
      </ul>
    </CardBody>
  </Card>
);

const DefaultWidgets = {
  sales: { component: SalesWidget, title: 'Vendas do Dia' },
  topProducts: { component: TopProductsWidget, title: 'Produtos Mais Vendidos' },
};

const CustomDashboard = () => {
  document.title = 'Dashboard Personalizável | PDV Web';
  const { showSuccess, showError, showInfo } = useNotification();

  const initialLayout = JSON.parse(localStorage.getItem('dashboardLayout')) || [
    { i: 'sales', x: 0, y: 0, w: 4, h: 2 },
    { i: 'topProducts', x: 4, y: 0, w: 4, h: 2 },
  ];

  const [layout, setLayout] = useState(initialLayout);
  const [availableWidgets, setAvailableWidgets] = useState(Object.keys(DefaultWidgets));

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const saveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    showSuccess('Layout do dashboard salvo com sucesso!');
  };

  const resetLayout = () => {
    localStorage.removeItem('dashboardLayout');
    setLayout(initialLayout);
    showInfo('Layout do dashboard resetado para o padrão.');
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Dashboard Personalizável' title='Sistema' />

          <div className='d-flex justify-content-end mb-3'>
            <Button className='me-2' color='primary' onClick={saveLayout}>
              Salvar Layout
            </Button>
            <Button color='secondary' onClick={resetLayout}>
              Resetar Layout
            </Button>
          </div>

          <GridLayout
            className='layout'
            cols={12}
            isDraggable={true}
            isResizable={true}
            layout={layout}
            rowHeight={100}
            width={1200} // Ajuste conforme a largura do seu container
            onLayoutChange={onLayoutChange}
          >
            {layout.map((item) => {
              const WidgetComponent = DefaultWidgets[item.i]?.component;
              return (
                <div key={item.i} data-grid={item}>
                  {WidgetComponent ? (
                    <WidgetComponent />
                  ) : (
                    <Card>
                      <CardBody>Widget não encontrado</CardBody>
                    </Card>
                  )}
                </div>
              );
            })}
          </GridLayout>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CustomDashboard;
