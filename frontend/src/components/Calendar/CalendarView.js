import React from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

const CalendarView = ({ events }) => {
  const handleEventClick = (clickInfo) => {
    // Implement event click logic (e.g., open a modal to view/edit event)
    alert(`Event: ${clickInfo.event.title}\nStart: ${clickInfo.event.startStr}`);
  };

  const handleDateSelect = (selectInfo) => {
    // Implement date selection logic (e.g., open a modal to create new event)
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: String(Date.now()), // Unique ID
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };

  const handleEventDrop = (changeInfo) => {
    // Implement event drag-and-drop update logic (e.g., update event in backend)
    alert(`Event moved: ${changeInfo.event.title} to ${changeInfo.event.startStr}`);
  };

  const handleEventResize = (changeInfo) => {
    // Implement event resize update logic (e.g., update event in backend)
    alert(`Event resized: ${changeInfo.event.title} to ${changeInfo.event.endStr}`);
  };

  return (
    <div className="calendar-view-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events} // Pass events data
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        locale="pt-br" // Set locale to Portuguese
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          list: 'Lista',
        }}
        // Styling for dark mode
        // You might need to import a custom CSS file for FullCalendar to apply dark mode
        // or override its styles in your main SCSS.
        // For now, rely on global CSS variables if applied to FullCalendar elements.
      />
    </div>
  );
};

CalendarView.propTypes = {
  events: PropTypes.array.isRequired,
};

export default CalendarView;
