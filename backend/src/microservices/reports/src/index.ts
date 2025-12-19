import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.REPORTS_MICROSERVICE_PORT || 5001;

app.use(cors());
app.use(express.json());

import pnlReportRoutes from './routes/pnlReportRoutes.js';

app.get('/health', (req, res) => {
  res.status(200).send('Reports microservice is healthy.');
});

app.use('/api', pnlReportRoutes);

app.listen(PORT, () => {
  console.log(`📈 Reports microservice running on port ${PORT}`);
});
