import React from 'react';

import { DashboardProvider } from '../../context/DashboardContext';

import DashboardV2 from './DashboardV2'; // Importa o novo DashboardV2

import './_dashboard-v2.scss'; // Importa os estilos do novo dashboard

const Dashboard = () => {
  document.title = 'Dashboard | PDV-Web';
  return (
    <DashboardProvider>
      <DashboardV2 /> {/* Renderiza o novo DashboardV2 */}
    </DashboardProvider>
  );
};

export default Dashboard;
