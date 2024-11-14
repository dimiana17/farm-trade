$(document).ready(function() {
    $("#all").click(function() {
        
        $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/api/finances/', // Ensure this URL is correct
            success: function(data) {
                $(".import-finance-data").empty();

                // Create the table structure with an ID
                let table = `
                    <table id="finance-table" border="1" cellpadding="10" cellspacing="0" class="info-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الواردات</th>
                                <th>بيان الواردات</th>
                                <th>عمليات</th>
                                <th>المصروفات</th>
                                <th>بيان المصروفات</th>
                                <th>عمليات</th>
                            </tr>
                        </thead>
                        <tbody class="import-finance-data-body">
                        </tbody>
                    </table>
                `;

                // Append the table to the container
                $(".import-finance-data").append(table);

                let imports = data.imports;
                let expenses = data.expenses;

                // Sort imports and expenses by date (_id)
                imports.sort((a, b) => new Date(a._id) - new Date(b._id));
                expenses.sort((a, b) => new Date(a._id) - new Date(b._id));

                // Variables to store totals
                let totalImports = 0;
                let totalExpenses = 0;

                // Iterate through imports and expenses grouped by date
                imports.forEach((importGroup) => {
                    const matchingExpensesGroup = expenses.find(expenseGroup => expenseGroup._id === importGroup._id) || { expenses: [] };

                    const maxLength = Math.max(importGroup.imports.length, matchingExpensesGroup.expenses.length);

                    // Show date only once for the first row of each group
                    let isDateShown = false;

                    for (let i = 0; i < maxLength; i++) {
                        let importData = importGroup.imports[i] || {}; // Default to empty object if undefined
                        let expenseData = matchingExpensesGroup.expenses[i] || {}; // Default to empty object if undefined

                        let importCash = importData.cash ? importData.cash : 0; // Default to 0 if undefined
                        let expenseCash = expenseData.cash ? expenseData.cash : 0; // Default to 0 if undefined

                        // Sum up imports and expenses
                        totalImports += importCash;
                        totalExpenses += expenseCash;

                        // Edit buttons will only show if data is present
                        let importEditButton = importData._id ? `<button class="edit-btn" data-id="${importData._id}" data-type="import">تعديل واردات</button>` : '';
                        let expenseEditButton = expenseData._id ? `<button class="edit-btn" data-id="${expenseData._id}" data-type="expense">تعديل مصروفات</button>` : '';

                        $(".import-finance-data-body").append(`
                            <tr>
                                <td>${!isDateShown ? importGroup._id : ''}</td> <!-- Display date only for the first row -->
                                <td>${importCash}</td>
                                <td>${importData.statement || ''}</td>
                                <td>${importEditButton}</td>
                                <td>${expenseCash}</td>
                                <td>${expenseData.statement || ''}</td>
                                <td> ${expenseEditButton}</td> <!-- Buttons here -->
                            </tr>
                        `);

                        // Mark date as shown after the first row
                        isDateShown = true;
                    }
                });

                // Calculate the net difference (totalImports - totalExpenses)
                let netDifference = totalImports - totalExpenses;

                // Append the final row with sums
                $(".import-finance-data-body").append(`
                    <tr>
                        <td><strong>المجموع</strong></td>
                        <td><strong>${totalImports}</strong></td>
                        <td></td>
                        <td></td>
                        <td><strong>${totalExpenses}</strong></td>
                        <td></td>
                        <td><strong>الفرق: ${netDifference}</strong></td>
                    </tr>
                `);
            },
            error: function(error) {
                console.log('Error:', error);
            }
        });
    });

    function downloadExcel(filename) {
        const wb = XLSX.utils.book_new(); // Create a new workbook
        const ws = XLSX.utils.table_to_sheet(document.getElementById("finance-table")); // Convert table to sheet

        // Append the sheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Finance Data");

        // Write the workbook and trigger the download
        XLSX.writeFile(wb, filename);
    }

    // Trigger the Excel download when the button is clicked
    $("#downloadFinance").click(function () {
        downloadExcel("finance_data.xlsx"); // Specify the Excel file name
    });
    $("#all").click();
});
