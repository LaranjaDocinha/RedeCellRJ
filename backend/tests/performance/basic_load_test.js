// This file is a placeholder for basic load/performance tests.
// You can use tools like k6 or Artillery here.

// Example using k6:
/*
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('http://localhost:5000/api/users');
  sleep(1);
};
*/

// Example using Artillery (YAML config usually):
/*
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - get: /api/users
*/