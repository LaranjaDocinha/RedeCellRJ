import { reportRepository } from '../repositories/report.repository.js';

export const reportService = {
  async generateReport(dimension: string, measure: string, startDate: string, endDate: string) {
    return reportRepository.runDynamicQuery(dimension, measure, { startDate, endDate }, dimension);
  },
};
