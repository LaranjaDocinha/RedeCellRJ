import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Spinner,
  Alert,
  Button,
  Input,
  FormGroup,
  Label,
} from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useNotification from '../hooks/useNotification';
import useApi from '../hooks/useApi';
import { get, post } from '../helpers/api_helper';

const UserProfilePage = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();

  const [activityLogs, setActivityLogs] = useState([]);
  const { request: fetchActivityLogs, loading: logsLoading, error: logsError } = useApi(get);

  const [loginHistory, setLoginHistory] = useState([]);
  const { request: fetchLoginHistory, loading: loginHistoryLoading, error: loginHistoryError } = useApi(get);

  const [currentUser, setCurrentUser] = useState(null);
  const { request: fetchCurrentUser, loading: userLoading, error: userError } = useApi(get);

  const [twoFASecret, setTwoFASecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const { request: generateSecretApi, loading: generatingSecret } = useApi(post);
  const { request: verifyTokenApi, loading: verifyingToken } = useApi(post);
  const { request: enable2FAApi, loading: enabling2FA } = useApi(post);
  const { request: disable2FAApi, loading: disabling2FA } = useApi(post);

  // Fetch activity logs for the user whose profile is being viewed
  useEffect(() => {
    if (id) {
      fetchActivityLogs(`/api/users/${id}/activity-logs`)
        .then((response) => {
          if (response.logs) {
            setActivityLogs(response.logs);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar logs de atividade:', err);
          showError('Erro ao carregar logs de atividade.');
        });

      fetchLoginHistory(`/api/users/${id}/login-history`)
        .then((response) => {
          if (response.history) {
            setLoginHistory(response.history);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar histórico de login:', err);
          showError('Erro ao carregar histórico de login.');
        });
    }
  }, [id, fetchActivityLogs, showError, fetchLoginHistory]);

  // Fetch current logged-in user's profile for 2FA status
  const loadCurrentUserProfile = useCallback(() => {
    fetchCurrentUser('/api/users/profile/me')
      .then((response) => {
        if (response) {
          setCurrentUser(response);
          setIs2FAEnabled(response.two_factor_enabled);
          // If 2FA is enabled, we might not need to show the secret/QR unless re-enabling
          // For now, we'll clear them if 2FA is already enabled
          if (response.two_factor_enabled) {
            setTwoFASecret('');
            setQrCodeUrl('');
          }
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar perfil do usuário logado:', err);
        showError('Erro ao carregar informações do seu perfil.');
      });
  }, [fetchCurrentUser, showError]);

  useEffect(() => {
    loadCurrentUserProfile();
  }, [loadCurrentUserProfile]);

  const handleGenerateSecret = async () => {
    try {
      const response = await generateSecretApi('/api/users/2fa/generate', {});
      setTwoFASecret(response.secret);
      setQrCodeUrl(response.qrcode);
      showSuccess('Segredo 2FA gerado. Escaneie o QR Code.');
    } catch (err) {
      console.error('Erro ao gerar segredo 2FA:', err);
      showError('Falha ao gerar segredo 2FA.');
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFASecret || !twoFAToken) {
      showError('Por favor, gere um segredo e insira o token.');
      return;
    }
    try {
      await enable2FAApi('/api/users/2fa/enable', { token: twoFAToken, secret: twoFASecret });
      showSuccess('2FA ativado com sucesso!');
      setIs2FAEnabled(true);
      setTwoFASecret('');
      setQrCodeUrl('');
      setTwoFAToken('');
      loadCurrentUserProfile(); // Refresh user data
    } catch (err) {
      console.error('Erro ao ativar 2FA:', err);
      showError('Falha ao ativar 2FA. Verifique o token.');
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFAToken) {
      showError('Por favor, insira o token para desativar o 2FA.');
      return;
    }
    try {
      await disable2FAApi('/api/users/2fa/disable', { token: twoFAToken });
      showSuccess('2FA desativado com sucesso!');
      setIs2FAEnabled(false);
      setTwoFAToken('');
      loadCurrentUserProfile(); // Refresh user data
    } catch (err) {
      console.error('Erro ao desativar 2FA:', err);
      showError('Falha ao desativar 2FA. Verifique o token.');
    }
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <h1>Perfil do Usuário {currentUser ? `(${currentUser.name})` : ''}</h1>

          {/* Seção de Logs de Atividade */}
          <Card className="mb-4">
            <CardBody>
              <CardTitle className="mb-3">Logs de Atividade</CardTitle>
              {logsLoading ? (
                <div className="text-center"><Spinner color="primary" /></div>
              ) : logsError ? (
                <Alert color="danger">Erro ao carregar logs de atividade.</Alert>
              ) : activityLogs.length === 0 ? (
                <p>Nenhum log de atividade encontrado para este usuário.</p>
              ) : (
                <ul className="list-group">
                  {activityLogs.map(log => (
                    <li key={log.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{log.description}</span>
                      <span className="text-muted">{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Seção de Histórico de Login */}
          <Card className="mb-4">
            <CardBody>
              <CardTitle className="mb-3">Histórico de Login</CardTitle>
              {loginHistoryLoading ? (
                <div className="text-center"><Spinner color="primary" /></div>
              ) : loginHistoryError ? (
                <Alert color="danger">Erro ao carregar histórico de login.</Alert>
              ) : loginHistory.length === 0 ? (
                <p>Nenhum histórico de login encontrado para este usuário.</p>
              ) : (
                <ul className="list-group">
                  {loginHistory.map(entry => (
                    <li key={entry.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          {entry.success ? 'Login bem-sucedido' : 'Login falhou'} em {' '}
                          {format(new Date(entry.login_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </span>
                        <span className={`badge bg-${entry.success ? 'success' : 'danger'}`}>
                          {entry.success ? 'Sucesso' : 'Falha'}
                        </span>
                      </div>
                      <small className="text-muted">IP: {entry.ip_address} | Agente: {entry.user_agent}</small>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Seção de Autenticação de Dois Fatores (2FA) */}
          <Card>
            <CardBody>
              <CardTitle className="mb-3">Autenticação de Dois Fatores (2FA)</CardTitle>
              {userLoading ? (
                <div className="text-center"><Spinner color="primary" /></div>
              ) : userError ? (
                <Alert color="danger">Erro ao carregar status do 2FA.</Alert>
              ) : (
                <div>
                  <p>
                    Status do 2FA: {' '}
                    <span className={`badge bg-${is2FAEnabled ? 'success' : 'danger'}`}>
                      {is2FAEnabled ? 'Ativado' : 'Desativado'}
                    </span>
                  </p>

                  {!is2FAEnabled ? (
                    <div>
                      <Button color="primary" onClick={handleGenerateSecret} disabled={generatingSecret || twoFASecret !== ''}>
                        {generatingSecret ? <Spinner size="sm" /> : 'Gerar Segredo'}
                      </Button>

                      {qrCodeUrl && (
                        <div className="mt-3 text-center">
                          <p>Escaneie o QR Code com seu aplicativo autenticador:</p>
                          <img src={qrCodeUrl} alt="QR Code" className="img-fluid" style={{ maxWidth: '200px' }} />
                          <p className="mt-2">Ou insira o código manualmente: <strong>{twoFASecret}</strong></p>
                        </div>
                      )}

                      {twoFASecret && (
                        <FormGroup className="mt-3">
                          <Label for="twoFAToken">Token de Verificação</Label>
                          <Input
                            type="text"
                            id="twoFAToken"
                            placeholder="Insira o token do seu aplicativo"
                            value={twoFAToken}
                            onChange={(e) => setTwoFAToken(e.target.value)}
                          />
                          <Button color="success" onClick={handleEnable2FA} className="mt-2" disabled={enabling2FA || !twoFAToken}>
                            {enabling2FA ? <Spinner size="sm" /> : 'Ativar 2FA'}
                          </Button>
                        </FormGroup>
                      )}
                    </div>
                  ) : (
                    <div>
                      <FormGroup>
                        <Label for="twoFATokenDisable">Token de Verificação</Label>
                        <Input
                          type="text"
                          id="twoFATokenDisable"
                          placeholder="Insira o token para desativar"
                          value={twoFAToken}
                          onChange={(e) => setTwoFAToken(e.target.value)}
                        />
                        <Button color="danger" onClick={handleDisable2FA} className="mt-2" disabled={disabling2FA || !twoFAToken}>
                          {disabling2FA ? <Spinner size="sm" /> : 'Desativar 2FA'}
                        </Button>
                      </FormGroup>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfilePage;
