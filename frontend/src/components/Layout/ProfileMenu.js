import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useAuthStore } from '../../store/authStore'; // Import no topo do arquivo

// Import SCSS
import './ProfileMenu.scss';

// Import Images
import avatar from '../../assets/images/redecellrj.png';

const ProfileMenu = () => {
  const [menu, setMenu] = useState(false);
  const user = useAuthStore(state => state.user); // Pega o usuário do store

  // Define o nome de usuário a ser exibido, com um fallback
  const username = user ? user.name : "Usuário";

  return (
    <React.Fragment>
      <Dropdown isOpen={menu} toggle={() => setMenu(!menu)} className="d-inline-block profile-menu">
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user profile-avatar"
            src={avatar}
            alt="Header Avatar"
          />
          <span className="d-none d-xl-inline-block ms-1">{username}</span>
          <i className="bx bx-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag={Link} to="/user-profile">
            <i className="bx bx-user align-middle me-1" /> Perfil
          </DropdownItem>
          <div className="dropdown-divider" />
          <DropdownItem className="text-danger" tag={Link} to="/logout">
            <i className="bx bx-power-off align-middle me-1 text-danger" /> Sair
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default ProfileMenu;
