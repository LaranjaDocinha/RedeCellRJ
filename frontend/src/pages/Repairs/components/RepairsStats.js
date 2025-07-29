import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import axios from 'axios';

import config from '../../../config';

const RepairsStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${config.api.API_URL}/api/repairs/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch repair stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Col md={3}>
      <Card>
        <CardBody>
          <div className='d-flex'>
            <div className='flex-grow-1'>
              <p className='text-muted fw-medium'>{title}</p>
              <h4 className='mb-0'>{loading ? '...' : value}</h4>
            </div>
            <div className='flex-shrink-0 align-self-center'>
              <div className={`avatar-sm rounded-circle bg-${color}-subtle`}>
                <span className={`avatar-title rounded-circle bg-${color}`}>
                  <i className={`bx ${icon} font-size-24`}></i>
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );

  return (
    <Row>
      <StatCard
        color='secondary'
        icon='bx-timer'
        title='Pendente Orçamento'
        value={stats?.pending_budget || 0}
      />
      <StatCard
        color='info'
        icon='bx-user-voice'
        title='Aguardando Aprovação'
        value={stats?.pending_approval || 0}
      />
      <StatCard
        color='warning'
        icon='bx-wrench'
        title='Em Reparo'
        value={stats?.in_progress || 0}
      />
      <StatCard
        color='success'
        icon='bx-check-shield'
        title='Total Finalizados'
        value={stats?.completed_total || 0}
      />
    </Row>
  );
};

export default RepairsStats;
