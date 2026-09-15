import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 30,
  duration: "1m",
  
  thresholds: { // p(95) = 227.4ms * 1.5 = 341.1ms
    http_req_duration: ['p(95)<341.1'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status 200 байна': (r) => r.status === 200 });
  sleep(1);
}