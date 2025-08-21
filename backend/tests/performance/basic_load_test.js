// This file contains basic load/performance tests using k6.
// For more advanced scenarios, refer to k6 documentation.

import http from 'k6/http';
import { sleep, check } from 'k6';

// Define test options
export const options = {
  vus: 10, // Number of virtual users
  duration: '30s', // Duration of the test
  // You can add more options here, e.g., thresholds for success rates, response times
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};

// Main function where the test logic resides
export default function () {
  // Example: Test a GET request to the users API
  const res = http.get('http://localhost:5000/api/users');

  // Check if the request was successful
  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  // Simulate user thinking time
  sleep(1);
}

/*
// Example using Artillery (YAML config usually):
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - get: /api/users
*/

// Instructions to run this test:
// 1. Install k6: https://k6.io/docs/getting-started/installation/
// 2. Make sure your backend server is running (e.g., on http://localhost:5000).
// 3. Open your terminal in the 'backend/tests/performance' directory.
// 4. Run the test: k6 run basic_load_test.js
// 5. Analyze the output in the terminal.