import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const listFetchLatency = new Trend("list_fetch_latency");

export const options = {
  scenarios: {
    bulk_load: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 10,
    },
  },
  thresholds: {
    list_fetch_latency: ["p(95)<2000"], // AC3: p95 < 2s for 500 items
  },
};

const BASE_URL = __ENV.API_BASE_URL || "http://localhost:3001/api/v1";

export function setup() {
  console.log("Seeding 500 todos for bulk load test...");
  const requests = [];
  for (let i = 0; i < 500; i++) {
    requests.push({
      method: "POST",
      url: `${BASE_URL}/todos`,
      body: JSON.stringify({
        title: `Bulk Todo ${i}`,
        description: "Bulk seed",
      }),
      params: {
        headers: { "Content-Type": "application/json" },
      },
    });
  }

  const responses = http.batch(requests);
  const todoIds = responses
    .filter((res) => res.status === 201)
    .map((res) => res.json().data.id);

  console.log(`Seeded ${todoIds.length} todos.`);
  return { todoIds };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/todos`);
  listFetchLatency.add(res.timings.duration);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has 500+ todos": (r) => {
      const body = r.json();
      return (
        body &&
        body.data &&
        Array.isArray(body.data.todos) &&
        body.data.todos.length >= 500
      );
    },
  });
  sleep(1);
}

export function teardown(data) {
  if (data.todoIds && data.todoIds.length > 0) {
    console.log(`Cleaning up ${data.todoIds.length} seeded todos...`);
    const requests = data.todoIds.map((id) => ({
      method: "DELETE",
      url: `${BASE_URL}/todos/${id}`,
    }));
    http.batch(requests);
    console.log("Cleanup complete.");
  }
}
