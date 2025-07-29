import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductPageSkeleton = () => {
  return (
    <div className='page-content'>
      <div className='container-fluid'>
        <Row>
          <Col lg='12'>
            <Card>
              <CardBody>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <Skeleton height={30} width={250} />
                  <div className='d-flex'>
                    <Skeleton className='me-2' height={38} width={180} />
                    <Skeleton className='me-2' height={38} width={80} />
                    <Skeleton className='me-1' height={38} width={40} />
                    <Skeleton height={38} width={40} />
                  </div>
                </div>
                <div className='mb-3'>
                  <Skeleton height={38} />
                </div>

                {/* Skeleton for Table */}
                <div>
                  <Skeleton className='mb-2' height={40} />
                  <Skeleton count={10} height={50} />
                </div>

                {/* Skeleton for Footer */}
                <div className='d-flex justify-content-between align-items-center mt-3'>
                  <Skeleton height={20} width={200} />
                  <Skeleton height={32} width={250} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
