import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    write_todo: {
      executor: "constant-vus",
      vus: 10,
      duration: "30s",
    },
  },
  thresholds: {
    "http_req_duration{type:post}": ["p(95)<500"],
    "http_req_duration{type:patch}": ["p(95)<500"],
    "http_req_duration{type:delete}": ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.API_BASE_URL || "http://localhost:3001/api/v1";

export default function () {
  const payload = JSON.stringify({
    title: `Todo ${Math.random()}`,
    description: "Performance test todo",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const postRes = http.post(
    `${BASE_URL}/todos`,
    payload,
    Object.assign({}, params, { tags: { type: "post" } })
  );

  check(postRes, {
    "POST status is 201": (r) => r.status === 201,
    "has id": (r) => r.json() && r.json().data && !!r.json().data.id,
  });

  if (postRes.status === 201) {
    const body = postRes.json();
    const todoId = body.data.id;

    // Patch
    const patchPayload = JSON.stringify({
      isCompleted: true,
    });
    const patchRes = http.patch(
      `${BASE_URL}/todos/${todoId}`,
      patchPayload,
      Object.assign({}, params, { tags: { type: "patch" } })
    );
    check(patchRes, {
      "PATCH status is 200": (r) => r.status === 200,
    });

    // Delete
    const deleteRes = http.del(`${BASE_URL}/todos/${todoId}`, null, {
      tags: { type: "delete" },
    });
    check(deleteRes, {
      "DELETE status is 204": (r) => r.status === 204,
    });
  }

  sleep(1);
}
