import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:5109'
const JWT_TOKEN = '';

if (!JWT_TOKEN) {
    throw new Error('JWT_TOKEN is not set. Please set the JWT_TOKEN variable with a valid token.');
}

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['avg < 200', 'med < 200', 'p(95) < 300', 'p(99) < 500'],
        checks: ['rate > 0.95'],
    },
    scenarios: {
        sharedIterations: {
            executor: 'shared-iterations',
            vus: 10,
            iterations: 50,
            maxDuration: '15s',
        },
        perVuIterations: {
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 10,
            maxDuration: '15s',
            startTime: '5s'
        },
        constantVUs: {
            executor: 'constant-vus',
            vus: 10,
            duration: '15s',
            startTime: '10s'
        },
        rampingVUs: {
            executor: 'ramping-vus',
            startTime: '20s',
            stages: [
                { duration: '15s', target: 100 },
                { duration: '30s', target: 100 },
                { duration: '15s', target: 0 },
            ],
        }
    }
};

export function setup() {
    return {
        token: JWT_TOKEN,
    }
}

export default (data) => {
    const params = {
        headers: {
            Authorization: `Bearer ${data.token}`,
        }
    };

    const res = http.get(`${BASE_URL}/api/v1/bookings`, params);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'result is not empty list:': (r) => r.body.length > 2,
        'response time is less than 200ms': (r) => r.timings.duration < 200,
    });
    sleep(1);
}

export function teardown(data) {
    console.log('Teardown function executed');
}