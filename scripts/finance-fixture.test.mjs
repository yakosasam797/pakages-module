import assert from "node:assert/strict";
import { test } from "node:test";
import { OBLIGATIONS, TRANSACTIONS, remaining, bookingProjectedMargin } from "../finance-module/src/financeModel.ts";

test("the preserved INR 1,20,000 booking reconciles obligations and verified cash", () => {
  const booking = "BK-2026-000003";
  const obligations = OBLIGATIONS.filter((record) => record.booking === booking);
  const customer = obligations.filter((record) => record.kind === "customer");
  const suppliers = obligations.filter((record) => record.kind === "supplier");
  const cash = TRANSACTIONS.filter((record) => record.linked.includes(booking) && record.verification === "Verified");
  const sum = (records, value) => records.reduce((total, record) => total + value(record), 0);
  const receipts = sum(cash.filter((record) => record.direction === "in"), (record) => record.amount);
  const payments = sum(cash.filter((record) => record.direction === "out"), (record) => record.amount);
  for (const record of obligations) {
    assert.ok(Number.isSafeInteger(record.amount) && Number.isSafeInteger(record.applied));
    assert.equal(record.applied, sum(cash.filter((transaction) => transaction.linked.includes(record.document)), (transaction) => transaction.amount));
  }
  assert.equal(sum(customer, (record) => record.amount), 12_000_000);
  assert.equal(receipts, 4_000_000);
  assert.equal(sum(suppliers, (record) => record.amount), 9_500_000);
  assert.equal(payments, 3_000_000);
  assert.equal(sum(customer, remaining), 8_000_000);
  assert.equal(sum(suppliers, remaining), 6_500_000);
  assert.equal(bookingProjectedMargin, 2_500_000);
  assert.equal(receipts - payments, 1_000_000);
});

test("unverified receipt proof does not settle the preserved customer obligation", () => {
  const obligation = OBLIGATIONS.find((record) => record.id === "COL-00029");
  const receipt = TRANSACTIONS.find((record) => record.id === "RCPT-2026-0088");
  assert.equal(receipt.verification, "Awaiting verification");
  assert.equal(receipt.allocation, "Not applied");
  assert.equal(obligation.applied, 0);
  assert.equal(remaining(obligation), 1_200_000);
});
