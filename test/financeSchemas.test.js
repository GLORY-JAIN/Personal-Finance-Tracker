const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const Expense = require("../models/expense");
const MonthlyBudget = require("../models/monthlyBudget");

const userId = new mongoose.Types.ObjectId();

test("expense schema validates required fields, category, and integer minor units", async () => {
  const validExpense = new Expense({
    userId,
    amountMinor: 1250,
    currency: "USD",
    category: "groceries",
    occurredAt: new Date("2026-03-15T12:00:00Z"),
  });
  await validExpense.validate();

  const invalidExpense = new Expense({
    userId,
    amountMinor: 12.5,
    currency: "USD",
    category: "not-a-category",
    occurredAt: new Date("2026-03-15T12:00:00Z"),
  });
  await assert.rejects(invalidExpense.validate(), (error) => {
    assert.ok(error.errors.amountMinor);
    assert.ok(error.errors.category);
    return true;
  });
});

test("monthly budget schema validates month and applies the default alert threshold", async () => {
  const budget = new MonthlyBudget({
    userId,
    year: 2026,
    month: 3,
    category: "groceries",
    currency: "USD",
    limitMinor: 50000,
  });
  await budget.validate();
  assert.equal(budget.alertThresholdPercent, 80);

  budget.month = 13;
  await assert.rejects(budget.validate(), (error) => {
    assert.ok(error.errors.month);
    return true;
  });
});

test("schemas declare the expense lookup and unique budget indexes", () => {
  assert.deepEqual(Expense.schema.indexes(), [
    [
      { userId: 1, category: 1, occurredAt: 1 },
      { name: "expense_user_category_date" },
    ],
  ]);
  assert.deepEqual(MonthlyBudget.schema.indexes(), [
    [
      { userId: 1, year: 1, month: 1, category: 1, currency: 1 },
      {
        unique: true,
        name: "budget_user_month_category_currency_unique",
      },
    ],
  ]);
});
