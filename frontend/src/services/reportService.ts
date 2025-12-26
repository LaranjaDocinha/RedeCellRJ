import api from './api';

export async function getContributionMarginByCategory(token: string) {
  const response = await api.get('/reports/contribution-margin-by-category', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getBreakEvenPoint(token: string) {
  const response = await api.get('/reports/break-even', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getCustomerLTV(token: string) {
  const response = await api.get('/reports/customer-ltv', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getCustomerAcquisitionCost(token: string) {
  const response = await api.get('/reports/customer-acquisition-cost', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}