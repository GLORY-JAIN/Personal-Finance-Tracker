const mongoose = require("mongoose");

const expenseCategories = [
  "housing",
  "utilities",
  "groceries",
  "transportation",
  "healthcare",
  "entertainment",
  "dining",
  "other",
];

const monthlyBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 9999,
      validate: {
        validator: Number.isInteger,
        message: "year must be an integer",
      },
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      validate: {
        validator: Number.isInteger,
        message: "month must be an integer from 1 to 12",
      },
    },
    category: {
      type: String,
      required: true,
      enum: expenseCategories,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      match: /^[A-Z]{3}$/,
    },
    limitMinor: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "limitMinor must be a positive safe integer",
      },
    },
    alertThresholdPercent: {
      type: Number,
      required: true,
      default: 80,
      min: 1,
      max: 100,
      validate: {
        validator: Number.isInteger,
        message: "alertThresholdPercent must be an integer from 1 to 100",
      },
    },
  },
  { timestamps: true }
);

monthlyBudgetSchema.index(
  { userId: 1, year: 1, month: 1, category: 1, currency: 1 },
  {
    unique: true,
    name: "budget_user_month_category_currency_unique",
  }
);

module.exports =
  mongoose.models.MonthlyBudget ||
  mongoose.model("MonthlyBudget", monthlyBudgetSchema);
