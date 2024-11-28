import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getPokeApiDuration = new Trend('get_contacts', true);
export const statusCodeRate = new Rate('status_code_200');

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<5700'],

    http_req_failed: ['rate<0.12']
  },
  stages: [
    { duration: '15s', target: 10 },
    { duration: '15s', target: 30 },
    { duration: '25s', target: 50 },
    { duration: '35s', target: 100 },
    { duration: '35s', target: 150 },
    { duration: '45s', target: 200 },
    { duration: '45s', target: 200 },
    { duration: '55s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://pokeapi.co/api/v2/pokemon/incineroar';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getPokeApiDuration.add(res.timings.duration);
  statusCodeRate.add(res.status === OK);

  check(res, {
    'GET PokeApi - status 200': () => res.status === OK
  });
}
