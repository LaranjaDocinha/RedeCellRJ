import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Alert,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Spinner,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import classnames from 'classnames';

import useRepairStore from '../../store/repairStore';
import useChecklistStore from '../../store/checklistStore';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import RepairChecklist from '../../components/checklists/RepairChecklist';

const RepairDetails = () => {
  const { id } = useParams();
  document.title = `Detalhes da O.S. #${id} | RedeCellRJ PDV`;

  // State from Zustand stores
  const { repairDetails, checklists, loading, error, fetchRepairData, assignChecklist, saveChecklistAnswers } = useRepairStore();
  const { templates, fetchTemplates } = useChecklistStore();

  // Local UI state
  const [activeTab, setActiveTab] = useState('1');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    if (id) {
      fetchRepairData(id);
      fetchTemplates(); // Fetch available templates for the dropdown
    }
  }, [id, fetchRepairData, fetchTemplates]);

  const handleAssignChecklist = (templateId, type) => {
    assignChecklist(id, templateId, type);
  };

  const handleSaveAnswers = (instanceId, answers) => {
    saveChecklistAnswers(id, instanceId, answers);
  };

  const preRepairChecklist = checklists.find(c => c.type === 'pre-repair');
  const postRepairChecklist = checklists.find(c => c.type === 'post-repair');

  if (loading && !repairDetails) return <div className="text-center p-5"><Spinner /></div>;
  if (error) return <Alert color="danger">{error}</Alert>;
  if (!repairDetails) return <Alert color="warning">Ordem de Serviço não encontrada.</Alert>;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            breadcrumbItem={`Detalhes da O.S. #${id}`}
            title="Ordens de Serviço"
          />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Nav tabs className="nav-tabs-custom nav-justified">
                    <NavItem>
                      <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => toggleTab('1')}>
                        Resumo
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => toggleTab('2')}>
                        Checklists
                      </NavLink>
                    </NavItem>
                    {/* Other tabs can be added here */}
                  </Nav>

                  <TabContent activeTab={activeTab} className="p-3 text-muted">
                    <TabPane tabId="1">
                      {/* Resumo Content Here - Simplified for brevity */}
                      <p><strong>Cliente:</strong> {repairDetails.customer_id}</p>
                      <p><strong>Aparelho:</strong> {repairDetails.device_type} {repairDetails.model}</p>
                      <p><strong>Status:</strong> {repairDetails.status}</p>
                    </TabPane>

                    <TabPane tabId="2">
                      <CardTitle className="d-flex justify-content-between align-items-center mb-4">
                        Checklists Associados
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                          <DropdownToggle caret color="primary">
                            Associar Novo Checklist
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Templates Disponíveis</DropdownItem>
                            {templates.map(template => (
                                <div key={template.id}>
                                    <DropdownItem onClick={() => handleAssignChecklist(template.id, 'pre-repair')}>
                                        {template.name} (Entrada)
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleAssignChecklist(template.id, 'post-repair')}>
                                        {template.name} (Saída)
                                    </DropdownItem>
                                </div>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </CardTitle>

                      {loading && <Spinner />}

                      {preRepairChecklist ? (
                        <RepairChecklist checklist={preRepairChecklist} onSave={handleSaveAnswers} />
                      ) : (
                        <Alert color="info">Nenhum checklist de entrada associado.</Alert>
                      )}

                      {postRepairChecklist ? (
                        <RepairChecklist checklist={postRepairChecklist} onSave={handleSaveAnswers} />
                      ) : (
                        <Alert color="info">Nenhum checklist de saída associado.</Alert>
                      )}

                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default RepairDetails;
