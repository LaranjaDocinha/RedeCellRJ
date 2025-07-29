import React, { useState, useEffect } from 'react';
import { Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

const DateRangePicker = ({ onDateChange, initialStartDate, initialEndDate }) => {
  const [dateRange, setDateRange] = useState([
    initialStartDate ? new Date(initialStartDate) : null,
    initialEndDate ? new Date(initialEndDate) : null,
  ]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      onDateChange(dateRange[0], dateRange[1]);
    }
  }, [dateRange, onDateChange]);

  return (
    <div className='mb-3'>
      <Label for='date-range'>Período:</Label>
      <Flatpickr
        className='form-control d-block'
        options={{
          mode: 'range',
          dateFormat: 'd/m/Y',
          altInput: true,
          altFormat: 'd/m/Y',
          locale: {
            weekdays: {
              shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
              longhand: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            },
            months: {
              shorthand: [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
              ],
              longhand: [
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro',
              ],
            },
            ordinal: function () {
              return '';
            },
            firstDayOfWeek: 0,
            rangeSeparator: ' até ',
            weekAbbreviation: 'Sem',
            scrollTitle: 'Role para aumentar',
            toggleTitle: 'Clique para alternar',
            amPM: ['AM', 'PM'],
            yearAriaLabel: 'Ano',
            time24hr: true,
          },
        }}
        placeholder='Selecione o período'
        value={dateRange}
        onChange={(updateDates) => {
          setDateRange(updateDates);
        }}
      />
    </div>
  );
};

export default DateRangePicker;
