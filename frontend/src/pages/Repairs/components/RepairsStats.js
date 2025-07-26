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
        console.error("Failed to fetch repair stats", error);
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
          <div className="d-flex">
            <div className="flex-grow-1">
              <p className="text-muted fw-medium">{title}</p>
              <h4 className="mb-0">{loading ? '...' : value}</h4>
            </div>
            <div className="flex-shrink-0 align-self-center">
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
      <StatCard title="Pendente Orçamento" value={stats?.pending_budget || 0} icon="bx-timer" color="secondary" />
      <StatCard title="Aguardando Aprovação" value={stats?.pending_approval || 0} icon="bx-user-voice" color="info" />
      <StatCard title="Em Reparo" value={stats?.in_progress || 0} icon="bx-wrench" color="warning" />
      <StatCard title="Total Finalizados" value={stats?.completed_total || 0} icon="bx-check-shield" color="success" />
    </Row>
  );
};

export default RepairsStats;
