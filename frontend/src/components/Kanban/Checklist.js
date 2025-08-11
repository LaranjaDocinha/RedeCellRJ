import React from 'react';
import styled from 'styled-components';
import { Progress } from 'reactstrap';

const ChecklistContainer = styled.div`
  margin-top: 1rem;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  input {
    margin-right: 0.5rem;
  }

  label {
    flex-grow: 1;
    text-decoration: ${(props) => (props.completed ? 'line-through' : 'none')};
    color: ${(props) => (props.completed ? '#6c757d' : 'inherit')};
  }
`;

const Checklist = ({ items, onToggle }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <ChecklistContainer>
      <h6>Checklist</h6>
      <Progress className='mb-2' style={{ height: '8px' }} value={progress} />
      {items.map((item) => (
        <ChecklistItem key={item.id} completed={item.completed}>
          <input checked={item.completed} type='checkbox' onChange={() => onToggle(item.id)} />
          <label>{item.text}</label>
        </ChecklistItem>
      ))}
    </ChecklistContainer>
  );
};

export default Checklist;
