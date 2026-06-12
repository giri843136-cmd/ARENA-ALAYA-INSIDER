import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
  const res = http.get('https://alayainsider.com/api/v1/products?limit=24');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => r.json('data') !== undefined,
  });
  sleep(1);
}
