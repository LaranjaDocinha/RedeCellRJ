import React from 'react';
import './Timeline.scss';

const Timeline = ({ items }) => {
  return (
    <div className="timeline-container">
      <ul className="timeline">
        {items.map(item => (
          <li key={item.id} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h5 className="timeline-title">{item.status_to}</h5>
              <p className="text-muted mb-1">
                {new Date(item.created_at).toLocaleString()} por <strong>{item.user_name || 'Sistema'}</strong>
              </p>
              {item.notes && <p className="text-muted fst-italic">"{item.notes}"</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timeline;
