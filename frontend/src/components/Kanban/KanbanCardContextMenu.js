import React from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

const KanbanCardContextMenu = ({ id, onAction }) => {
  return (
    <Menu id={id}>
      <Item onClick={() => onAction('viewDetails')}>Ver Detalhes</Item>
      <Item onClick={() => onAction('assignToMe')}>Atribuir a Mim</Item>
      <Submenu label='Mover para...'>
        <Item onClick={() => onAction('moveToTodo')}>A Fazer</Item>
        <Item onClick={() => onAction('moveToInProgress')}>Em Progresso</Item>
        <Item onClick={() => onAction('moveToDone')}>Concluído</Item>
      </Submenu>
      <Separator />
      <Item className='text-danger' onClick={() => onAction('deleteCard')}>
        Excluir Card
      </Item>
    </Menu>
  );
};

export default KanbanCardContextMenu;
