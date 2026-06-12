import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 0 },
  ],
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
  const res = http.get('https://alayainsider.com/api/search?q=linen');
  check(res, { 'search responds fast': (r) => r.timings.duration < 150 });
}
