
import React from 'react';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const BulkActionsToolbar = ({ selectedCount, onAction, disabled }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <div className="d-flex align-items-center gap-3 p-3 border-bottom bg-light">
      <div className="fw-bold">{selectedCount} usuário(s) selecionado(s)</div>
      <Button color="success" size="sm" onClick={() => onAction('activate')} disabled={disabled}>
        Ativar
      </Button>
      <Button color="danger" size="sm" onClick={() => onAction('deactivate')} disabled={disabled}>
        Desativar
      </Button>
      <Dropdown isOpen={dropdownOpen} toggle={toggle} disabled={disabled}>
        <DropdownToggle caret size="sm">
          Mudar Permissão
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => onAction('setRole', { role: 'admin' })}>Admin</DropdownItem>
          <DropdownItem onClick={() => onAction('setRole', { role: 'technician' })}>Técnico</DropdownItem>
          <DropdownItem onClick={() => onAction('setRole', { role: 'user' })}>Usuário</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default BulkActionsToolbar;
