import React from 'react';
import moment from 'moment';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from 'reactstrap';
import { NumericFormat } from 'react-number-format';

import LoadingSpinner from '../../../../components/Common/LoadingSpinner';
import Timeline from '../../../../components/Common/Timeline';

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
    <Modal isOpen={detailsModal} size='lg' toggle={toggleDetails}>
      <ModalHeader toggle={toggleDetails}>Detalhes do Reparo</ModalHeader>
      <ModalBody>
        {selectedRepairDetails && (
          <div>
            <p>
              <strong>ID do Reparo:</strong> {selectedRepairDetails.id}
            </p>
            <p>
              <strong>Cliente:</strong> {selectedRepairDetails.customer_name} (
              <a href={`tel:${selectedRepairDetails.customer_phone}`}>
                {selectedRepairDetails.customer_phone}
              </a>
              )
            </p>
            {selectedRepairDetails.customer_email && (
              <p>
                <strong>Email do Cliente:</strong>{' '}
                <a href={`mailto:${selectedRepairDetails.customer_email}`}>
                  {selectedRepairDetails.customer_email}
                </a>
              </p>
            )}
            <p>
              <strong>Tipo de Dispositivo:</strong> {selectedRepairDetails.device_type}
            </p>
            <p>
              <strong>Marca:</strong> {selectedRepairDetails.brand}
            </p>
            <p>
              <strong>Modelo:</strong> {selectedRepairDetails.model}
            </p>
            {selectedRepairDetails.device_color && (
              <p>
                <strong>Cor do Aparelho:</strong> {selectedRepairDetails.device_color}
              </p>
            )}
            <p>
              <strong>IMEI/Número de Série:</strong> {selectedRepairDetails.imei_serial}
            </p>
            {selectedRepairDetails.visual_condition && (
              <p>
                <strong>Condição Visual:</strong> {selectedRepairDetails.visual_condition}
              </p>
            )}
            <p>
              <strong>Descrição do Problema:</strong> {selectedRepairDetails.problem_description}
            </p>
            {selectedRepairDetails.initial_quote && (
              <p>
                <strong>Orçamento Inicial:</strong>{' '}
                <NumericFormat
                  decimalScale={2}
                  decimalSeparator=','
                  displayType={'text'}
                  fixedDecimalScale={true}
                  prefix='R$ '
                  thousandSeparator='.'
                  value={selectedRepairDetails.initial_quote}
                />
              </p>
            )}
            {selectedRepairDetails.promised_date && (
              <p>
                <strong>Data Prometida:</strong>{' '}
                {moment(selectedRepairDetails.promised_date).format('DD/MM/YYYY')}
              </p>
            )}
            <p>
              <strong>Status:</strong>
              <Input
                className={`badge bg-${statusColors[selectedRepairDetails.status]}`}
                disabled={updatingStatusId === selectedRepairDetails.id}
                id={`detail-status-${selectedRepairDetails.id}`}
                name='status'
                style={{
                  width: 'auto',
                  display: 'inline-block',
                  marginLeft: '10px',
                  marginRight: updatingStatusId === selectedRepairDetails.id ? '5px' : '0',
                }}
                type='select'
                value={selectedRepairDetails.status}
                onChange={(e) => handleStatusChange(selectedRepairDetails.id, e.target.value)}
              >
                {Object.entries(statusTranslations).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Input>
              {updatingStatusId === selectedRepairDetails.id && (
                <LoadingSpinner className='ms-2' size='sm' />
              )}
            </p>
            <div className='progress-indicator mt-2 mb-3'>
              <div className={`step ${selectedRepairDetails.status === 'pending' ? 'active' : ''}`}>
                Pendente
              </div>
              <div
                className={`step ${selectedRepairDetails.status === 'in_progress' ? 'active' : ''}`}
              >
                Em Andamento
              </div>
              <div
                className={`step ${selectedRepairDetails.status === 'completed' ? 'active' : ''}`}
              >
                Concluído
              </div>
              <div
                className={`step ${selectedRepairDetails.status === 'delivered' ? 'active' : ''}`}
              >
                Entregue
              </div>
            </div>
            <p>
              <strong>Custo do Serviço:</strong>{' '}
              <NumericFormat
                decimalScale={2}
                decimalSeparator=','
                displayType={'text'}
                fixedDecimalScale={true}
                prefix='R$ '
                thousandSeparator='.'
                value={selectedRepairDetails.service_cost}
              />
            </p>
            <p>
              <strong>Custo das Peças:</strong>{' '}
              <NumericFormat
                decimalScale={2}
                decimalSeparator=','
                displayType={'text'}
                fixedDecimalScale={true}
                prefix='R$ '
                thousandSeparator='.'
                value={selectedRepairDetails.parts_cost}
              />
            </p>
            <p>
              <strong>Custo Total:</strong>{' '}
              <NumericFormat
                decimalScale={2}
                decimalSeparator=','
                displayType={'text'}
                fixedDecimalScale={true}
                prefix='R$ '
                thousandSeparator='.'
                value={
                  parseFloat(selectedRepairDetails.service_cost) +
                  parseFloat(selectedRepairDetails.parts_cost)
                }
              />
            </p>
            {selectedRepairDetails.warranty_period && (
              <p>
                <strong>Garantia do Serviço:</strong> {selectedRepairDetails.warranty_period}
              </p>
            )}
            {selectedRepairDetails.notes && (
              <p>
                <strong>Notas Internas:</strong> {selectedRepairDetails.notes}
              </p>
            )}
            <p>
              <strong>Criado em:</strong>{' '}
              {moment(selectedRepairDetails.created_at).format('DD/MM/YYYY HH:mm')}
            </p>
            <p>
              <strong>Última Atualização:</strong>{' '}
              {moment(selectedRepairDetails.updated_at).format('DD/MM/YYYY HH:mm')}
            </p>
            import Timeline from "../../../../components/Common/Timeline"; // ... (dentro do
            componente)
            <hr />
            <h5>Histórico de Atividades:</h5>
            {repairActivities.length === 0 ? (
              <p>Nenhuma atividade registrada para este reparo.</p>
            ) : (
              <Timeline
                items={repairActivities.map((activity) => ({
                  title: activity.activity_type,
                  description: activity.description,
                  timestamp: moment(activity.timestamp).format('DD/MM/YYYY HH:mm'),
                  icon: 'bx-history', // Ícone padrão, pode ser melhorado
                }))}
              />
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color='info'
          onClick={() => {
            const newWindow = window.open();
            newWindow.document.write(generateServiceOrderHtml(selectedRepairDetails));
            newWindow.document.close();
            newWindow.print();
          }}
        >
          Gerar OS
        </Button>
        <Button color='secondary' onClick={toggleDetails}>
          Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RepairDetailsModal;
