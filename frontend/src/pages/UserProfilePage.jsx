import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardBody,
  Spinner,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import classnames from 'classnames';
import useNotification from '../hooks/useNotification';
import useApi from '../hooks/useApi';
import { get } from '../helpers/api_helper';

// Import new components (will be created in subsequent steps)
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileOverviewTab from '../components/Profile/ProfileOverviewTab';
import ProfileSecurityTab from '../components/Profile/ProfileSecurityTab';
import ProfileActivityTab from '../components/Profile/ProfileActivityTab';

const UserProfilePage = () => {
  const { id } = useParams(); // ID do usuário cujo perfil está sendo visualizado
  const { showSuccess, showError } = useNotification();

  const [currentUser, setCurrentUser] = useState(null);
  const { request: fetchCurrentUser, loading: userLoading, error: userError } = useApi(get);

  const [activeTab, setActiveTab] = useState('overview');

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Fetch current logged-in user's profile for general info and 2FA status
  const loadCurrentUserProfile = useCallback(() => {
    fetchCurrentUser('/api/users/profile/me')
      .then((response) => {
        if (response) {
          setCurrentUser(response);
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

  if (userLoading) {
    return (
      <div className='page-content'>
        <Container fluid className="text-center mt-5">
          <Spinner color="primary" />
          <p className="mt-2">Carregando perfil...</p>
        </Container>
      </div>
    );
  }

  if (userError) {
    return (
      <div className='page-content'>
        <Container fluid className="mt-5">
          <Alert color="danger">{userError}</Alert>
        </Container>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className='page-content'>
        <Container fluid className="mt-5">
          <Alert color="warning">Perfil do usuário não encontrado.</Alert>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          {/* Profile Header Section */}
          <ProfileHeader user={currentUser} onProfileUpdate={loadCurrentUserProfile} />

          {/* Navigation Tabs */}
          <Nav tabs className="mt-4">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'overview' })}
                onClick={() => { toggleTab('overview'); }}
              >
                Visão Geral
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'security' })}
                onClick={() => { toggleTab('security'); }}
              >
                Segurança
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === 'activity' })}
                onClick={() => { toggleTab('activity'); }}
              >
                Atividade
              </NavLink>
            </NavItem>
            {/* Add more NavItems for other tabs as needed */}
          </Nav>

          {/* Tab Content */}
          <TabContent activeTab={activeTab} className="p-4 border border-top-0 rounded-bottom bg-white">
            <TabPane tabId="overview">
              <ProfileOverviewTab user={currentUser} onProfileUpdate={loadCurrentUserProfile} />
            </TabPane>
            <TabPane tabId="security">
              <ProfileSecurityTab user={currentUser} onProfileUpdate={loadCurrentUserProfile} />
            </TabPane>
            <TabPane tabId="activity">
              <ProfileActivityTab userId={id} />
            </TabPane>
            {/* Add more TabPanes for other tabs as needed */}
          </TabContent>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfilePage;