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

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "amountMinor must be a positive safe integer",
      },
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      match: /^[A-Z]{3}$/,
    },
    category: {
      type: String,
      required: true,
      enum: expenseCategories,
    },
    occurredAt: {
      type: Date,
      required: true,
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

expenseSchema.index(
  { userId: 1, category: 1, occurredAt: 1 },
  { name: "expense_user_category_date" }
);

module.exports =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
