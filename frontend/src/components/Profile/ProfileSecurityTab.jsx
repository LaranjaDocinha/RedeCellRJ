
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardTitle, FormGroup, Label, Input, Button, Spinner, Alert, ListGroup, ListGroupItem } from 'reactstrap';
import useNotification from '../../hooks/useNotification';
import useApi from '../../hooks/useApi';
import { get, post, del } from '../../helpers/api_helper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProfileSecurityTab = ({ user, onProfileUpdate }) => {
  const { showSuccess, showError } = useNotification();

  // 2FA State and Handlers
  const [twoFASecret, setTwoFASecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.two_factor_enabled);

  const { request: generateSecretApi, loading: generatingSecret } = useApi('post');
  const { request: verifyTokenApi, loading: verifyingToken } = useApi('post');
  const { request: enable2FAApi, loading: enabling2FA } = useApi('post');
  const { request: disable2FAApi, loading: disabling2FA } = useApi('post');

  useEffect(() => {
    setIs2FAEnabled(user.two_factor_enabled);
    if (user.two_factor_enabled) {
      setTwoFASecret('');
      setQrCodeUrl('');
    }
  }, [user]);

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
      onProfileUpdate(); // Refresh user data
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
      onProfileUpdate(); // Refresh user data
    } catch (err) {
      console.error('Erro ao desativar 2FA:', err);
      showError('Falha ao desativar 2FA. Verifique o token.');
    }
  };

  // Password Change State and Handlers
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const { request: changePasswordApi, loading: changingPassword } = useApi('post');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      showError('A nova senha e a confirmação não coincidem.');
      return;
    }
    try {
      await changePasswordApi('/api/users/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      showSuccess('Senha alterada com sucesso!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      showError(err.response?.data?.message || 'Falha ao alterar senha.');
    }
  };

  // Active Sessions State and Handlers
  const [sessions, setSessions] = useState([]);
  const { request: fetchSessions, loading: sessionsLoading, error: sessionsError } = useApi('get');
  const { request: revokeSessionApi, loading: revokingSession } = useApi('delete');

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetchSessions('/api/users/sessions');
      setSessions(response);
    } catch (err) {
      console.error('Erro ao carregar sessões ativas:', err);
      showError('Falha ao carregar sessões ativas.');
    }
  }, [fetchSessions, showError]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSessionApi(`/api/users/sessions/${sessionId}`);
      showSuccess('Sessão revogada com sucesso!');
      loadSessions(); // Recarregar sessões
    } catch (err) {
      console.error('Erro ao revogar sessão:', err);
      showError('Falha ao revogar sessão.');
    }
  };

  return (
    <>
      {/* Seção de Autenticação de Dois Fatores (2FA) */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle className="mb-3">Autenticação de Dois Fatores (2FA)</CardTitle>
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
        </CardBody>
      </Card>

      {/* Seção de Alteração de Senha */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle className="mb-3">Alterar Senha</CardTitle>
          <form onSubmit={handleSubmitPasswordChange}>
            <FormGroup>
              <Label for="oldPassword">Senha Antiga</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="confirmNewPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
              />
            </FormGroup>
            <Button color="primary" type="submit" disabled={changingPassword}>
              {changingPassword ? <Spinner size="sm" /> : 'Alterar Senha'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Seção de Sessões Ativas */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle className="mb-3">Sessões Ativas</CardTitle>
          {sessionsLoading ? (
            <div className="text-center"><Spinner color="primary" /></div>
          ) : sessionsError ? (
            <Alert color="danger">Erro ao carregar sessões ativas.</Alert>
          ) : sessions.length === 0 ? (
            <p>Nenhuma sessão ativa encontrada.</p>
          ) : (
            <ListGroup>
              {sessions.map(session => (
                <ListGroupItem key={session.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    IP: {session.ip_address} | Agente: {session.user_agent}
                    <br />
                    <small className="text-muted">Login em: {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</small>
                    <br />
                    <small className="text-muted">Última Atividade: {format(new Date(session.last_seen_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</small>
                  </div>
                  <Button color="danger" size="sm" onClick={() => handleRevokeSession(session.id)} disabled={revokingSession}>
                    Revogar
                  </Button>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default ProfileSecurityTab;
