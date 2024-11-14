const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Route to get all imports for today
router.get('/imports/today', financeController.getTodayImports);

// Route to get all Expensess for today
router.get('/Expensess/today', financeController.getTodayExpenses);

// Route to insert a new import
router.post('/imports', financeController.insertImport);

// Route to insert a new Expenses
router.post('/Expensess', financeController.insertExpense);

// Route to get the cash summary for today (imports, Expensess, and net result)
router.get('/summary/today', financeController.getCashSummaryForToday);

router.get('/imports', financeController.getAllImports);
router.get('/Expensess', financeController.getAllExpenses);
router.get('/today', financeController.getTodayTransactions);
router.route('/')
    .get(financeController.getAllTransactions)
    .delete(financeController.deleteAllFinances);
// Update an import by ID
router.put('/imports/:id', financeController.updateImportById);
router.get('/imports/:id', financeController.getImportById);

// Route to get an Expenses by ID
router.get('/Expensess/:id', financeController.getExpenseById);
// Update an Expenses by ID
router.put('/Expensess/:id', financeController.updateExpenseById);
module.exports = router;
