# Personal finance tracker: MongoDB schema

This example models expenses and monthly category budgets with Mongoose. It is
intended as a schema and indexing starting point, not a complete application.

## Entities and relationship

- **Expense** (`models/expense.js`): one user's categorized spending entry,
  recorded as a positive integer number of minor currency units, such as cents.
- **MonthlyBudget** (`models/monthlyBudget.js`): one user's spending limit for
  one category, currency, and calendar month. The alert threshold defaults to
  80 percent of that limit.

The relationship is logical rather than a stored `budgetId`: expenses belong
to the budget with the same `userId`, `category`, currency, and UTC calendar
month derived from `occurredAt`. This avoids a stale reference if an expense is
recategorized or moved to another month. An expense can exist without a budget;
budget alerts are calculated by summing matching expenses and comparing the
result with the budget limit and threshold.

## Validation and indexes

Both schemas require an owner, an allowed expense category, and a three-letter
currency code. Amounts and budget limits must be positive safe integers in
minor units to avoid floating-point currency arithmetic. Budgets validate the
year, month, and alert threshold ranges. Mongoose timestamps are enabled.

1. `Expense` index `{ userId: 1, category: 1, occurredAt: 1 }` improves the
   monthly category-spend query used to calculate budget utilization:
   filter by owner and category, then by a UTC `[monthStart, nextMonthStart)`
   date range. The trade-off is extra storage and write cost, and it does not
   optimally serve queries that filter by owner and date but omit category.
2. `MonthlyBudget` unique index
   `{ userId: 1, year: 1, month: 1, category: 1, currency: 1 }` improves the
   lookup for a user's budget for a month/category/currency and prevents
   duplicate budget records for that key. The trade-off is index storage and
   write overhead; changing a budget key can also conflict with an existing
   record. MongoDB must have built this index for uniqueness to be enforced.

## Assumptions and failure case

- A user/account collection exists elsewhere; `userId` is its ObjectId. These
  schemas do not enforce that the referenced user still exists.
- Categories are a fixed starter list and can be extended in both schemas
  together. Currency validation checks three uppercase letters, not whether a
  code is currently assigned by ISO 4217.
- `occurredAt` is grouped by UTC month. If the product uses user-local budget
  months, store/use the user's time zone when deriving the date range.
- Example failure: an expense with `amountMinor: 12.5` or an unsupported
  category fails Mongoose validation and must not be persisted. Validation is
  checked in the tests; database connectivity and server-side unique-index
  enforcement are not exercised by this database-free suite.

## Test

Run `node --test` from the repository root. Tests construct documents and run
Mongoose validation without connecting to MongoDB, and check the declared
index definitions. The suite passes with the installed Node.js and Mongoose
dependencies.
