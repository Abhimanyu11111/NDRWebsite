import test from "node:test";
import assert from "node:assert/strict";
import { shouldBypassCors } from "../middleware/security.js";

test("bypasses CORS only for the CCAvenue payment callback POST", () => {
  assert.equal(
    shouldBypassCors({ method: "POST", path: "/api/payment/callback" }),
    true
  );
});

test("keeps CORS enabled for other methods and routes", () => {
  assert.equal(
    shouldBypassCors({ method: "GET", path: "/api/payment/callback" }),
    false
  );
  assert.equal(
    shouldBypassCors({ method: "POST", path: "/api/payment/create-order" }),
    false
  );
  assert.equal(
    shouldBypassCors({ method: "POST", path: "/api/payment/callback/extra" }),
    false
  );
});
