import React from 'react';
import './RecentActivityFeed.scss';

const activityData = [
  { id: 1, type: 'sale', description: 'Venda #1024', value: '+ R$ 150,00', time: 'agora' },
  { id: 2, type: 'repair', description: 'Reparo #205 - Troca de Tela', value: '+ R$ 350,00', time: '2 min atrás' },
  { id: 3, type: 'customer', description: 'Novo cliente: Ana Silva', value: '', time: '5 min atrás' },
  { id: 4, type: 'sale', description: 'Venda #1023', value: '+ R$ 89,90', time: '10 min atrás' },
  { id: 5, type: 'stock', description: 'Produto "Cabo USB-C" em estoque baixo', value: '', time: '12 min atrás' },
];

const ICONS = {
  sale: { icon: 'bx-cart', color: '#34c38f' },
  repair: { icon: 'bx-wrench', color: '#556ee6' },
  customer: { icon: 'bx-user', color: '#50a5f1' },
  stock: { icon: 'bx-archive-in', color: '#f1b44c' },
};

const RecentActivityFeed = () => {
  return (
    <div className="activity-feed-container">
      <ul className="activity-list">
        {activityData.map(item => (
          <li key={item.id} className="activity-item">
            <div className="activity-icon" style={{ backgroundColor: ICONS[item.type].color }}>
              <i className={`bx ${ICONS[item.type].icon}`}></i>
            </div>
            <div className="activity-details">
              <p className="activity-description">{item.description}</p>
              <span className="activity-time">{item.time}</span>
            </div>
            <span className="activity-value">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivityFeed;
