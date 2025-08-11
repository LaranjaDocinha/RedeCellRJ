import React, { /* memo */ } from 'react';
import { Card, CardBody, CardTitle, CardText, Row, Col, Button, Badge, Spinner } from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import './UserCardView.scss';

const UserCardView = ({ users, onEditClick, onStatusToggle, onSendResetEmail, onImpersonate, loggedInUser, impersonatingUser }) => {
  const navigate = useNavigate();

  const roleColors = {
    admin: 'danger',
    technician: 'info',
    user: 'primary',
    seller: 'success',
  };

  return (
    <Row>
      {users.map(user => (
        <Col key={user.id} md={4} sm={6} xs={12} className="mb-4">
          <Card className="h-100 user-card">
            <CardBody className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <img src={user.profile_image_url || 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg'} alt={user.name} className="avatar-md rounded-circle me-3" />
                <div>
                  <CardTitle tag="h5" className="mb-1">{user.name}</CardTitle>
                  <CardText className="text-muted mb-0">{user.email}</CardText>
                </div>
              </div>
              <div className="mb-3">
                <Badge pill className={`badge-soft-${user.is_active ? 'success' : 'danger'} me-2`}>
                  {user.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge pill className={`badge-soft-${roleColors[user.role] || 'secondary'} text-capitalize`}>
                  {user.role}
                </Badge>
              </div>
              <CardText className="text-muted mb-3">
                Último Login: {user.last_login_at ? format(new Date(user.last_login_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Nunca'}
              </CardText>
              <div className="mt-auto d-flex flex-wrap gap-2">
                <Button color='primary' size='sm' onClick={() => onEditClick(user)}><i className='bx bx-pencil me-1'></i> Editar</Button>
                <Button color='info' size='sm' onClick={() => navigate(`/user-profile/${user.id}`)}><i className='bx bx-user me-1'></i> Ver Perfil</Button>
                {loggedInUser.role === 'admin' && (
                  <Button color='warning' size='sm' onClick={() => onImpersonate(user)} disabled={impersonatingUser}>
                    {impersonatingUser ? <Spinner size="sm" /> : <><i className='bx bx-mask me-1'></i> Personificar</>}
                  </Button>
                )}
                <Button color={user.is_active ? 'danger' : 'success'} size='sm' onClick={() => onStatusToggle(user)}>{user.is_active ? 'Desativar' : 'Ativar'}</Button>
                <Button color='info' size='sm' onClick={() => onSendResetEmail(user)}><i className='bx bx-mail-send'></i></Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default UserCardView;