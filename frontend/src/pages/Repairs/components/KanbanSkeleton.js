import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const KanbanSkeleton = () => {
  const columnCount = 4; // Simula 4 colunas no Kanban
  const cardsPerColumn = 3; // Simula 3 cards por coluna

  return (
    <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
      <Row style={{ width: '100%', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {[...Array(columnCount)].map((_, colIndex) => (
          <Col key={colIndex} xs={12} md={6} lg={3} className="mb-4">
            <Card className="h-100">
              <CardBody>
                <h5><Skeleton width={120} /></h5> {/* Título da Coluna */}
                {[...Array(cardsPerColumn)].map((_, cardIndex) => (
                  <Card key={cardIndex} className="mb-3">
                    <CardBody>
                      <h6><Skeleton width="80%" /></h6> {/* Título do Card */}
                      <p><Skeleton count={2} /></p> {/* Descrição do Card */}
                      <div className="d-flex justify-content-between">
                        <Skeleton width={60} />
                        <Skeleton width={80} />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </SkeletonTheme>
  );
};

export default KanbanSkeleton;