import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Breadcrumb from '../../components/Common/Breadcrumb';
import LeadsToolbar from './components/LeadsToolbar';
import LeadsTable from './components/LeadsTable';
import LeadFormModal from './components/LeadFormModal';
import useApi from '../hooks/useApi';

const LeadsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  const { data, isLoading, error, request: fetchLeads } = useApi('get');

  const reFetchLeads = useCallback(() => {
    fetchLeads('/api/leads', { params: filters });
  }, [fetchLeads, filters]);

  useEffect(() => {
    reFetchLeads();
  }, [reFetchLeads]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setSelectedLead(null);
    }
  };

  const handleCreate = () => {
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toggleModal();
    reFetchLeads();
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="CRM" breadcrumbItem="Leads" />
        <Row>
          <Col xs="12">
            <div className="card">
              <div className="card-body">
                <LeadsToolbar 
                  onFilterChange={handleFilterChange} 
                  onAddClick={handleCreate} 
                />
                <LeadsTable
                  leads={data?.leads || []}
                  isLoading={isLoading}
                  error={error}
                  onEdit={handleEdit}
                  onDeleteSuccess={reFetchLeads}
                  pagination={{
                    page: data?.page,
                    pages: data?.pages,
                    total: data?.total,
                  }}
                  onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {modalOpen && (
        <LeadFormModal
          isOpen={modalOpen}
          toggle={toggleModal}
          lead={selectedLead}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default LeadsPage;
