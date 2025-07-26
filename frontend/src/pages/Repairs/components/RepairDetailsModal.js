import React from "react";
import moment from 'moment';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner } from "reactstrap";
import { NumericFormat } from 'react-number-format';

const RepairDetailsModal = ({
  detailsModal,
  toggleDetails,
  selectedRepairDetails,
  repairActivities,
  handleStatusChange,
  updatingStatusId,
  statusColors,
  statusTranslations,
  generateServiceOrderHtml,
}) => {
  return (
    <Modal isOpen={detailsModal} toggle={toggleDetails} size="lg">
      <ModalHeader toggle={toggleDetails}>Detalhes do Reparo</ModalHeader>
      <ModalBody>
        {
          selectedRepairDetails && (
            <div>
              <p><strong>ID do Reparo:</strong> {selectedRepairDetails.id}</p>
              <p><strong>Cliente:</strong> {selectedRepairDetails.customer_name} (<a href={`tel:${selectedRepairDetails.customer_phone}`}>{selectedRepairDetails.customer_phone}</a>)</p>
              {selectedRepairDetails.customer_email && <p><strong>Email do Cliente:</strong> <a href={`mailto:${selectedRepairDetails.customer_email}`}>{selectedRepairDetails.customer_email}</a></p>}
              <p><strong>Tipo de Dispositivo:</strong> {selectedRepairDetails.device_type}</p>
              <p><strong>Marca:</strong> {selectedRepairDetails.brand}</p>
              <p><strong>Modelo:</strong> {selectedRepairDetails.model}</p>
              {selectedRepairDetails.device_color && <p><strong>Cor do Aparelho:</strong> {selectedRepairDetails.device_color}</p>}
              <p><strong>IMEI/Número de Série:</strong> {selectedRepairDetails.imei_serial}</p>
              {selectedRepairDetails.visual_condition && <p><strong>Condição Visual:</strong> {selectedRepairDetails.visual_condition}</p>}
              <p><strong>Descrição do Problema:</strong> {selectedRepairDetails.problem_description}</p>
              {selectedRepairDetails.initial_quote && <p><strong>Orçamento Inicial:</strong> <NumericFormat value={selectedRepairDetails.initial_quote} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale={true} /></p>}
              {selectedRepairDetails.promised_date && <p><strong>Data Prometida:</strong> {moment(selectedRepairDetails.promised_date).format('DD/MM/YYYY')}</p>}
              <p><strong>Status:</strong>
                <Input
                  type="select"
                  name="status"
                  id={`detail-status-${selectedRepairDetails.id}`}
                  value={selectedRepairDetails.status}
                  onChange={(e) => handleStatusChange(selectedRepairDetails.id, e.target.value)}
                  className={`badge bg-${statusColors[selectedRepairDetails.status]}`}
                  style={{ width: 'auto', display: 'inline-block', marginLeft: '10px', marginRight: updatingStatusId === selectedRepairDetails.id ? '5px' : '0' }}
                  disabled={updatingStatusId === selectedRepairDetails.id}
                >
                  {Object.entries(statusTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Input>
                {updatingStatusId === selectedRepairDetails.id && <Spinner size="sm" className="ms-2" />}
              </p>
              <div className="progress-indicator mt-2 mb-3">
                <div className={`step ${selectedRepairDetails.status === 'pending' ? 'active' : ''}`}>Pendente</div>
                <div className={`step ${selectedRepairDetails.status === 'in_progress' ? 'active' : ''}`}>Em Andamento</div>
                <div className={`step ${selectedRepairDetails.status === 'completed' ? 'active' : ''}`}>Concluído</div>
                <div className={`step ${selectedRepairDetails.status === 'delivered' ? 'active' : ''}`}>Entregue</div>
              </div>
              <p><strong>Custo do Serviço:</strong> <NumericFormat value={selectedRepairDetails.service_cost} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale={true} /></p>
              <p><strong>Custo das Peças:</strong> <NumericFormat value={selectedRepairDetails.parts_cost} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale={true} /></p>
              <p><strong>Custo Total:</strong> <NumericFormat value={parseFloat(selectedRepairDetails.service_cost) + parseFloat(selectedRepairDetails.parts_cost)} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale={true} /></p>
              {selectedRepairDetails.warranty_period && <p><strong>Garantia do Serviço:</strong> {selectedRepairDetails.warranty_period}</p>}
              {selectedRepairDetails.notes && <p><strong>Notas Internas:</strong> {selectedRepairDetails.notes}</p>}
              <p><strong>Criado em:</strong> {moment(selectedRepairDetails.created_at).format('DD/MM/YYYY HH:mm')}</p>
              <p><strong>Última Atualização:</strong> {moment(selectedRepairDetails.updated_at).format('DD/MM/YYYY HH:mm')}</p>
              <hr />
              <h5>Histórico de Atividades:</h5>
              {
                repairActivities.length === 0 ? (
                  <p>Nenhuma atividade registrada para este reparo.</p>
                ) : (
                  <ul className="list-unstyled activity-list">
                    {repairActivities.map((activity) => (
                      <li key={activity.id} className="activity-item mb-2">
                        <small className="text-muted">{moment(activity.timestamp).format('DD/MM/YYYY HH:mm')}</small><br />
                        <strong>{activity.activity_type}:</strong> {activity.description}
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>
          )
        }
      </ModalBody>
      <ModalFooter>
        <Button color="info" onClick={() => {
          const newWindow = window.open();
          newWindow.document.write(generateServiceOrderHtml(selectedRepairDetails));
          newWindow.document.close();
          newWindow.print();
        }}>Gerar OS</Button>
        <Button color="secondary" onClick={toggleDetails}>Fechar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default RepairDetailsModal;
