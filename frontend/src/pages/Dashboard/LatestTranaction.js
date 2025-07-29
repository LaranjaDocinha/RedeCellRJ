import React from 'react';
import { Card, CardBody } from 'reactstrap';

const LatestTranaction = () => {
  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <div className='mb-4 h4 card-title'>Últimas Transações</div>
          <p>
            O componente para exibir as últimas vendas será implementado aqui, conectado à nossa
            nova API de vendas.
          </p>
          {/* No futuro, usaremos o TableContainer aqui com os dados de /api/sales */}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default LatestTranaction;
