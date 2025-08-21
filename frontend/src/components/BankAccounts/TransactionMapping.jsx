import React, { useState, useMemo } from 'react';
import { Table, Button, Input, FormGroup, Label, Row, Col } from 'reactstrap';
import { motion } from 'framer-motion';
import './TransactionMapping.scss'; // Assuming a SCSS file for styling

const TransactionMapping = ({ importedTransactions, existingTransactions, onSaveMapping, animationDelay = 0 }) => {
  const [mappings, setMappings] = useState(() =>
    importedTransactions.map(impTx => ({
      importedTx: impTx,
      mappedTo: null, // ID of existing transaction
      isNew: true, // Flag to indicate if it's a new transaction or mapped
    }))
  );

  const handleMapChange = (importedTxId, existingTxId) => {
    setMappings(prevMappings =>
      prevMappings.map(mapping =>
        mapping.importedTx.id === importedTxId
          ? { ...mapping, mappedTo: existingTxId, isNew: !existingTxId }
          : mapping
      )
    );
  };

  const handleToggleNew = (importedTxId) => {
    setMappings(prevMappings =>
      prevMappings.map(mapping =>
        mapping.importedTx.id === importedTxId
          ? { ...mapping, isNew: !mapping.isNew, mappedTo: null }
          : mapping
      )
    );
  };

  const availableExistingTransactions = useMemo(() => {
    const mappedExistingIds = mappings.filter(m => m.mappedTo).map(m => m.mappedTo);
    return existingTransactions.filter(extTx => !mappedExistingIds.includes(extTx.id));
  }, [existingTransactions, mappings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="transaction-mapping-container"
    >
      <h3>Mapeamento de Transações</h3>
      <p className="text-muted">Associe as transações importadas com lançamentos existentes ou marque como novas.</p>

      <Table responsive striped bordered className="mapping-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição Importada</th>
            <th>Valor</th>
            <th>Ação</th>
            <th>Lançamento Existente</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map(mapping => (
            <tr key={mapping.importedTx.id}>
              <td>{new Date(mapping.importedTx.date).toLocaleDateString()}</td>
              <td>{mapping.importedTx.description}</td>
              <td>{mapping.importedTx.amount.toFixed(2)}</td>
              <td>
                <FormGroup check inline>
                  <Label check>
                    <Input
                      type="radio"
                      name={`action-${mapping.importedTx.id}`}
                      checked={mapping.isNew}
                      onChange={() => handleToggleNew(mapping.importedTx.id)}
                    />{' '}
                    Nova
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Label check>
                    <Input
                      type="radio"
                      name={`action-${mapping.importedTx.id}`}
                      checked={!mapping.isNew}
                      onChange={() => handleToggleNew(mapping.importedTx.id)}
                    />{' '}
                    Mapear
                  </Label>
                </FormGroup>
              </td>
              <td>
                {!mapping.isNew && (
                  <Input
                    type="select"
                    value={mapping.mappedTo || ''}
                    onChange={(e) => handleMapChange(mapping.importedTx.id, parseInt(e.target.value))}
                  >
                    <option value="">Selecione um lançamento</option>
                    {availableExistingTransactions.map(extTx => (
                      <option key={extTx.id} value={extTx.id}>
                        {extTx.date} - {extTx.description} - {extTx.amount.toFixed(2)}
                      </option>
                    ))}
                  </Input>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-right mt-3">
        <Button color="primary" onClick={() => onSaveMapping(mappings)}>
          Salvar Mapeamento
        </Button>
      </div>
    </motion.div>
  );
};

export default TransactionMapping;