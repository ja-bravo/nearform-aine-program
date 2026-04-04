import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    read_todos: {
      executor: "constant-vus",
      vus: 10,
      duration: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"], // NFR1: < 500ms
    http_req_failed: ["rate<0.01"], // Fail if more than 1% errors
  },
};

const BASE_URL = __ENV.API_BASE_URL || "http://localhost:3001/api/v1";

export default function () {
  const res = http.get(`${BASE_URL}/todos`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "has todos array": (r) => {
      const body = r.json();
      return body && body.data && Array.isArray(body.data.todos);
    },
  });
  sleep(1);
}
