import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:5109'
const JWT_TOKEN = '';

if (!JWT_TOKEN) {
    throw new Error('JWT_TOKEN is not set. Please set the JWT_TOKEN variable with a valid token.');
}

export const options = {
    stages: [ // ramping-vus
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 0 },
    ]
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