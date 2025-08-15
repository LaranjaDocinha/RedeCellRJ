import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Spinner, Alert, FormGroup, Label, Input } from 'reactstrap';
import Breadcrumb from '../../components/Common/Breadcrumb';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

const BankReconciliation = () => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [internalTransactions, setInternalTransactions] = useState([]);
  const [selectedBankTxn, setSelectedBankTxn] = useState(null);
  const [selectedInternalTxn, setSelectedInternalTxn] = useState(null);

  const { data: accounts, isLoading: loadingAccounts, error: accountsError } = useApi('/api/bank-accounts');
  const { request: uploadRequest, isLoading: uploading } = useApi('post');
  const { request: fetchUnreconciled, isLoading: loadingUnreconciled } = useApi('get');
  const { request: reconcileRequest, isLoading: reconciling } = useApi('post');

  const loadUnreconciledData = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const response = await fetchUnreconciled(`/api/bank-reconciliation/${selectedAccountId}/unreconciled`);
      setBankTransactions(response.bankTransactions);
      setInternalTransactions(response.internalTransactions);
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar transações não conciliadas.');
    }
  }, [selectedAccountId, fetchUnreconciled]);

  useEffect(() => {
    loadUnreconciledData();
  }, [loadUnreconciledData]);

  const handleFileUpload = async () => {
    if (!selectedAccountId) {
      toast.error('Por favor, selecione uma conta bancária primeiro.');
      return;
    }
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo para upload.');
      return;
    }

    const formData = new FormData();
    formData.append('statement', selectedFile);

    try {
      await uploadRequest(`/api/bank-reconciliation/${selectedAccountId}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Extrato enviado e transações importadas com sucesso!');
      setSelectedFile(null);
      loadUnreconciledData(); // Recarrega os dados após o upload
    } catch (err) {
      toast.error(err.message || 'Falha ao importar extrato.');
    }
  };

  const handleReconcile = async () => {
    if (!selectedBankTxn || !selectedInternalTxn) {
      toast.error('Selecione uma transação bancária e uma transação interna para conciliar.');
      return;
    }

    if (selectedBankTxn.amount !== selectedInternalTxn.amount) {
      if (!window.confirm('Os valores das transações não correspondem. Deseja conciliar mesmo assim?')) {
        return;
      }
    }

    try {
      await reconcileRequest('/api/bank-reconciliation/reconcile', {
        bankTransactionId: selectedBankTxn.id,
        internalTransactionId: selectedInternalTxn.internal_id,
        internalTransactionType: selectedInternalTxn.internal_type,
      });
      toast.success('Transações conciliadas com sucesso!');
      setSelectedBankTxn(null);
      setSelectedInternalTxn(null);
      loadUnreconciledData(); // Recarrega os dados após a conciliação
    } catch (err) {
      toast.error(err.message || 'Falha ao conciliar transações.');
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="Finanças" breadcrumbItem="Conciliação Bancária" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <CardTitle className="h4">Upload de Extrato Bancário</CardTitle>
              </CardHeader>
              <CardBody>
                <Row className="align-items-end">
                  <Col md={4}>
                    <FormGroup>
                      <Label for="bankAccountSelect">Selecionar Conta Bancária</Label>
                      <Input
                        type="select"
                        name="bankAccount"
                        id="bankAccountSelect"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        disabled={loadingAccounts}
                      >
                        <option value="">Selecione...</option>
                        {accounts?.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.account_number})
                          </option>
                        ))}
                      </Input>
                      {accountsError && <Alert color="danger" className="mt-2">Erro ao carregar contas.</Alert>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="statementFile">Upload de Arquivo CSV</Label>
                      <Input
                        type="file"
                        name="statementFile"
                        id="statementFile"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <Button color="primary" onClick={handleFileUpload} disabled={uploading || !selectedAccountId || !selectedFile}>
                      {uploading ? <Spinner size="sm" /> : 'Importar Extrato'}
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={6}>
            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <CardTitle className="h4">Transações do Extrato Bancário</CardTitle>
              </CardHeader>
              <CardBody>
                {loadingUnreconciled ? (
                  <div className="text-center"><Spinner size="sm" /> Carregando...</div>
                ) : bankTransactions.length === 0 ? (
                  <Alert color="info">Nenhuma transação bancária não conciliada.</Alert>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table className="table-hover table-sm">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrição</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankTransactions.map(txn => (
                          <tr 
                            key={txn.id} 
                            onClick={() => setSelectedBankTxn(txn)}
                            className={selectedBankTxn?.id === txn.id ? 'table-primary' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{formatDate(txn.transaction_date)}</td>
                            <td>{txn.description}</td>
                            <td className={txn.type === 'credit' ? 'text-success' : 'text-danger'}>
                              {txn.type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <CardTitle className="h4">Transações Internas Não Conciliadas</CardTitle>
              </CardHeader>
              <CardBody>
                {loadingUnreconciled ? (
                  <div className="text-center"><Spinner size="sm" /> Carregando...</div>
                ) : internalTransactions.length === 0 ? (
                  <Alert color="info">Nenhuma transação interna não conciliada.</Alert>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table className="table-hover table-sm">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrição</th>
                          <th>Valor</th>
                          <th>Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {internalTransactions.map(txn => (
                          <tr 
                            key={txn.internal_id + txn.internal_type} 
                            onClick={() => setSelectedInternalTxn(txn)}
                            className={selectedInternalTxn?.internal_id === txn.internal_id && selectedInternalTxn?.internal_type === txn.internal_type ? 'table-primary' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{formatDate(txn.date)}</td>
                            <td>{txn.description}</td>
                            <td className={txn.type === 'inflow' ? 'text-success' : 'text-danger'}>
                              {txn.type === 'inflow' ? '+' : '-'} {formatCurrency(txn.amount)}
                            </td>
                            <td>
                              <Badge color={txn.internal_type === 'sale' ? 'success' : 'warning'} pill>
                                {txn.internal_type === 'sale' ? 'Venda' : 'Despesa'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col lg={12} className="text-center">
            <Button 
              color="success" 
              onClick={handleReconcile} 
              disabled={reconciling || !selectedBankTxn || !selectedInternalTxn}
            >
              {reconciling ? <Spinner size="sm" /> : 'Conciliar Transações'}
            </Button>
          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default BankReconciliation;
