import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import './NotificationCenter.scss';

// Mock Data
const mockNotifications = [
  { icon: 'bx bx-cart', title: 'Novo pedido recebido', text: 'Um novo pedido #1234 foi criado.', color: 'text-primary' },
  { icon: 'bx bx-check-double', title: 'Reparo Concluído', text: 'O reparo de "Tela Quebrada" foi finalizado.', color: 'text-success' },
  { icon: 'bx bx-error-circle', title: 'Estoque Baixo', text: 'O produto "Película de Vidro" está acabando.', color: 'text-warning' },
];

const NotificationCenter = () => {
  const [menu, setMenu] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const toggle = () => {
    setMenu(!menu);
    if (hasNewNotifications) {
      // Optionally turn off notification badge after opening
      // setHasNewNotifications(false); 
    }
  };

  return (
    <React.Fragment>
      <Dropdown isOpen={menu} toggle={toggle} className="d-inline-block notification-center">
        <DropdownToggle
          tag="button"
          className="btn header-item noti-icon"
          id="page-header-notifications-dropdown"
          aria-label="Abrir notificações"
        >
          <i className="bx bx-bell notification-bell" />
          {hasNewNotifications && <span className="notification-badge"></span>}
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3 notification-header">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="m-0"> Notificações </h5>
              </div>
            </div>
          </div>

          <SimpleBar className="notification-list">
            {mockNotifications.map((notification, index) => (
              <Link to="#" className="text-reset notification-item" key={index}>
                <div className={`item-icon ${notification.color}`}>
                  <i className={notification.icon} />
                </div>
                <div className="flex-1">
                  <h6 className="mt-0 mb-1">{notification.title}</h6>
                  <div className="font-size-12 text-muted">
                    <p className="mb-0">{notification.text}</p>
                  </div>
                </div>
              </Link>
            ))}
          </SimpleBar>
          
          <div className="p-2 border-top">
            <Link to="#" className="notification-footer">
              Ver todas as notificações
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default NotificationCenter;
