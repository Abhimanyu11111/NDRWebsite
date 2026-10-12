import test from "node:test";
import assert from "node:assert/strict";
import { ensureUserLocationSchema, userLocationSchema } from "../src/config/userLocationSchema.js";
import User from "../models/User.js";

// Minimal stand-in for sequelize: records schema calls against an in-memory table.
const fakeSequelize = (columns, { failAlter = false } = {}) => {
  const calls = [];
  const qi = {
    describeTable: async () => ({ ...columns }),
    addColumn: async (table, name, def) => {
      if (failAlter) throw new Error("ALTER command denied");
      calls.push(["addColumn", name]);
      columns[name] = { type: `VARCHAR(${def.type.options.length})` };
    },
    changeColumn: async (table, name, def) => {
      if (failAlter) throw new Error("ALTER command denied");
      calls.push(["changeColumn", name]);
      columns[name] = { type: `VARCHAR(${def.type.options.length})` };
    },
  };
  return {
    calls,
    getQueryInterface: () => qi,
    query: async (sql) => { calls.push(["query", sql]); },
  };
};

test("adds country (backfilled to India) and widens pincode on an old schema", async () => {
  const db = fakeSequelize({ id: { type: "INT" }, pincode: { type: "VARCHAR(6)" } });
  const result = await ensureUserLocationSchema(db);
  assert.deepEqual(db.calls, [
    ["addColumn", "country"],
    ["query", "UPDATE users SET country = 'India' WHERE country IS NULL"],
    ["changeColumn", "pincode"],
  ]);
  assert.equal(result.countrySupported, true);
  assert.equal(result.postalCodeMaxLength, 12);
  assert.ok(User.getAttributes().country, "country attribute kept on the model");
});

test("is a no-op once the schema is up to date", async () => {
  const db = fakeSequelize({ pincode: { type: "VARCHAR(12)" }, country: { type: "VARCHAR(100)" } });
  const result = await ensureUserLocationSchema(db);
  assert.deepEqual(db.calls, []);
  assert.equal(result.countrySupported, true);
});

test("falls back safely when the schema cannot be changed", async () => {
  userLocationSchema.countrySupported = false;
  userLocationSchema.postalCodeMaxLength = 6;
  const db = fakeSequelize({ pincode: { type: "VARCHAR(6)" } }, { failAlter: true });
  const result = await ensureUserLocationSchema(db);
  assert.equal(result.countrySupported, false);
  assert.equal(result.postalCodeMaxLength, 6);
  assert.equal(User.getAttributes().country, undefined, "country removed so User queries keep working");
});
