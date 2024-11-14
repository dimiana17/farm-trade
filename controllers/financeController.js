// controllers/financeController.js
const Import = require('../models/imports.js');
const Expense = require('../models/expenses.js');

const getAllImports = async (req, res) => {
  try {
    const imports = await Import.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalCash: { $sum: "$cash" },
          imports: {
            $push: {
              _id: "$_id",
              date: "$date",
              cash: "$cash",
              statement: "$statement",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt"
            }
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json(imports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grouped imports', error });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalExpense: { $sum: "$cash" },
          expenses: {
            $push: {
              _id: "$_id",
              date: "$date",
              cash: "$cash",
              statement: "$statement",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt"
            }
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grouped expenses', error });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const imports = await Import.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalImports: { $sum: "$cash" },
          imports: { $push: "$$ROOT" }
        }
      }
    ]);

    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalExpenses: { $sum: "$cash" },
          expenses: { $push: "$$ROOT" }
        }
      }
    ]);

    res.status(200).json({ imports, expenses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all transactions', error });
  }
};

const getTodayTransactions = async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const expenses = await Expense.find({ date: { $gte: today, $lt: tomorrow } });
    const imports = await Import.find({ date: { $gte: today, $lt: tomorrow } });

    res.status(200).json({ imports, expenses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s transactions', error });
  }
};

const getTodayExpenses = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getCurrentDayRange();

    const expenses = await Expense.find({ date: { $gte: startOfDay, $lt: endOfDay } });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s expenses', error });
  }
};

const getTodayImports = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getCurrentDayRange();

    const imports = await Import.find({ date: { $gte: startOfDay, $lt: endOfDay } });
    res.status(200).json(imports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s imports', error });
  }
};

const insertImport = async (req, res) => {
  try {
    const { date, cash, statement } = req.body;
    const newImport = new Import({ date, cash, statement });
    await newImport.save();
    res.status(201).json(newImport);
  } catch (error) {
    res.status(500).json({ message: 'Error adding import', error });
  }
};

const insertExpense = async (req, res) => {
  try {
    const { date, cash, statement } = req.body;
    const newExpense = new Expense({ date, cash, statement });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error });
  }
};

const getCurrentDayRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

const getCashSummaryForToday = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getCurrentDayRange();

    const totalImports = await Import.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalCashImports: { $sum: "$cash" } } }
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalCashExpenses: { $sum: "$cash" } } }
    ]);

    const importsSum = totalImports[0]?.totalCashImports || 0;
    const expensesSum = totalExpenses[0]?.totalCashExpenses || 0;
    const result = importsSum - expensesSum;

    res.status(200).json({
      totalCashImports: importsSum,
      totalCashExpenses: expensesSum,
      netResult: result
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating cash summary for today', error });
  }
};

const deleteAllFinances = async (req, res) => {
  try {
    const result1 = await Expense.deleteMany({});
    const result2 = await Import.deleteMany({});

    res.json({
      message: `Deleted ${result1.deletedCount} expenses and ${result2.deletedCount} imports.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, cash, statement } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { date, cash, statement },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense', error });
  }
};

const updateImportById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, cash, statement } = req.body;

    const updatedImport = await Import.findByIdAndUpdate(
      id,
      { date, cash, statement },
      { new: true, runValidators: true }
    );

    if (!updatedImport) {
      return res.status(404).json({ message: 'Import not found' });
    }

    res.status(200).json(updatedImport);
  } catch (error) {
    res.status(500).json({ message: 'Error updating import', error });
  }
};

const getImportById = async (req, res) => {
  try {
    const importData = await Import.findById(req.params.id);

    if (!importData) {
      return res.status(404).json({ message: 'Import not found' });
    }

    res.status(200).json(importData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching import by ID', error });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expenseData = await Expense.findById(req.params.id);

    if (!expenseData) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(expenseData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense by ID', error });
  }
};

module.exports = {
  getAllImports,
  getAllExpenses,
  getAllTransactions,
  getTodayTransactions,
  getTodayExpenses,
  getTodayImports,
  insertImport,
  insertExpense,
  getCashSummaryForToday,
  deleteAllFinances,
  updateExpenseById,
  updateImportById,
  getImportById,
  getExpenseById,
};
