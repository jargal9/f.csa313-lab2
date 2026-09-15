import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 30,
  duration: "1m",
  
  thresholds: { // p(95) = 252.91ms * 1.5 = 379.365ms
    http_req_duration: ['p(95)<379.365'], 
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status 200 байна': (r) => r.status === 200 });
  sleep(1);
}