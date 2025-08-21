
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ToggleSwitch from './ToggleSwitch';

describe('ToggleSwitch', () => {
  it('should render correctly', () => {
    const { getByLabelText } = render(
      <ToggleSwitch
        name="test-switch"
        label="Test Switch"
        checked={false}
        onChange={() => {}}
      />
    );
    expect(getByLabelText('Test Switch')).toBeInTheDocument();
  });

  it('should call onChange when clicked', () => {
    const handleChange = jest.fn();
    const { getByLabelText } = render(
      <ToggleSwitch
        name="test-switch"
        label="Test Switch"
        checked={false}
        onChange={handleChange}
      />
    );
    fireEvent.click(getByLabelText('Test Switch'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
