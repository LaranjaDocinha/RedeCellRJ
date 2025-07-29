import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { useAuthStore } from '../../store/authStore'; // Import no topo do arquivo

// Import SCSS
import './ProfileMenu.scss';

// Import Images

const ProfileMenu = () => {
  const [menu, setMenu] = useState(false);
  const user = useAuthStore((state) => state.user); // Pega o usuário do store

  // Define o nome de usuário a ser exibido, com um fallback
  const username = user ? user.name : 'Usuário';

  return (
    <React.Fragment>
      <Dropdown className='d-inline-block profile-menu' isOpen={menu} toggle={() => setMenu(!menu)}>
        <DropdownToggle className='btn header-item' id='page-header-user-dropdown' tag='button'>
          <div className='profile-avatar-container'>
            <img
              alt='Header Avatar'
              className='rounded-circle header-profile-user profile-avatar'
              src={user?.profile_image_url || '/redecellrj.png'}
            />
          </div>
        </DropdownToggle>
        <DropdownMenu className='dropdown-menu-end'>
          <DropdownItem tag={Link} to='/user-profile'>
            <i className='bx bx-user align-middle me-1' /> Perfil
          </DropdownItem>
          <div className='dropdown-divider' />
          <DropdownItem className='text-danger' tag={Link} to='/logout'>
            <i className='bx bx-power-off align-middle me-1 text-danger' /> Sair
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default ProfileMenu;
