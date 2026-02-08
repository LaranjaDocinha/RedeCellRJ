import moment from 'moment';
import { cashFlowRepository } from '../repositories/cashFlow.repository.js';

export const getCashFlowData = async (
  branchId: number | undefined,
  startDate: string,
  endDate: string,
) => {
  const summary = await cashFlowRepository.getSummary(branchId, startDate, endDate);
  const breakdown = await cashFlowRepository.getDailyBreakdown(branchId, startDate, endDate);

  const cashFlowTrend: { date: string; inflow: number; outflow: number }[] = [];
  const allDates = new Set<string>();

  breakdown.inflows.forEach((row) => allDates.add(moment(row.date).format('YYYY-MM-DD')));
  breakdown.expenses.forEach((row) => allDates.add(moment(row.date).format('YYYY-MM-DD')));
  breakdown.purchases.forEach((row) => allDates.add(moment(row.date).format('YYYY-MM-DD')));

  Array.from(allDates)
    .sort()
    .forEach((date) => {
      const inflow =
        breakdown.inflows.find((r) => moment(r.date).format('YYYY-MM-DD') === date)?.amount || 0;
      const expense =
        breakdown.expenses.find((r) => moment(r.date).format('YYYY-MM-DD') === date)?.amount || 0;
      const poOutflow =
        breakdown.purchases.find((r) => moment(r.date).format('YYYY-MM-DD') === date)?.amount || 0;

      cashFlowTrend.push({
        date,
        inflow: parseFloat(inflow),
        outflow: parseFloat(expense) + parseFloat(poOutflow),
      });
    });

  return {
    totalInflow: summary.totalInflow,
    totalOutflow: summary.totalOutflow,
    netCashFlow: summary.netCashFlow,
    cashFlowTrend,
  };
};
