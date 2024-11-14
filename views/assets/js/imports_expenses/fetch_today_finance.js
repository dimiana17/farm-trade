$(document).ready(function() {
    let currentEditId = null;  // To track the current item being edited
    let currentEditType = '';  // 'import' or 'Expenses'
    let imports = [];          // Array to hold import data
    let expenses = [];         // Array to hold Expenses data

    // Load today's finance data
    $("#today").click(function() {
        $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/api/finances/today/',
            success: function(data) {
                imports = data.imports;
                expenses = data.expenses;

                $(".import-finance-data").empty();

                const table = `
                    <table id="finance-table" border="1" cellpadding="10" cellspacing="0" class="info-table">
                        <thead>
                            <tr>
                                <th></th>
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
                $(".import-finance-data").append(table);

                let totalImports = 0;
                let totalExpenses = 0;
                const maxLength = Math.max(imports.length, expenses.length);

                for (let i = 0; i < maxLength; i++) {
                    const importData = imports[i] || {};
                    const expenseData = expenses[i] || {};

                    const importCash = importData.cash || 0;
                    const expenseCash = expenseData.cash || 0;

                    totalImports += importCash;
                    totalExpenses += expenseCash;

                    $(".import-finance-data-body").append(`
                        <tr>
                            <td></td>
                            <td>${importCash}</td>
                            <td>${importData.statement || ''}</td>
                            <td>
                                ${importData._id ? `<button class="edit-btn" data-id="${importData._id}" data-type="import">تعديل واردات</button>` : ''}
                            </td>
                            <td>${expenseCash}</td>
                            <td>${expenseData.statement || ''}</td>
                            <td>
                                ${expenseData._id ? `<button class="edit-btn" data-id="${expenseData._id}" data-type="expense">تعديل مصروفات</button>` : ''}
                            </td>
                        </tr>
                    `);
                }

                const netDifference = totalImports - totalExpenses;
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
                console.error('Error:', error);
            }
        });
    });

    // Edit button handler
    $(document).on("click", ".edit-btn", function() {
        currentEditId = $(this).data("id");
        currentEditType = $(this).data("type");

        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/finances/${currentEditType}s/${currentEditId}`,
            success: function(data) {
                $("#edit-cash").val(data.cash);
                $("#edit-statement").val(data.statement);
                $("#edit-modal").show();  // Show the modal
            },
            error: function(error) {
                console.error('Error fetching data for edit:', error);
            }
        });
    });

    // Cancel edit
    $("#cancel-edit").click(function() {
        $("#edit-modal").hide();  // Hide the modal
    });

    // Save edited import or expense
    $("#edit-form").submit(function(e) {
        e.preventDefault();
        const updatedData = {
            cash: parseFloat($("#edit-cash").val()),
            statement: $("#edit-statement").val()
        };

        const url = `http://localhost:3000/api/finances/${currentEditType}s/${currentEditId}`;
        $.ajax({
            method: 'PUT',
            url: url,
            data: JSON.stringify(updatedData),
            contentType: 'application/json',
            success: function() {
                $("#edit-modal").hide();
                $("#today").click();  // Refresh data
                $("#edit-feedback").text("تم حفظ التعديلات بنجاح").show().fadeOut(3000);
            },
            error: function(error) {
                console.error('Error updating record:', error);
                $("#edit-feedback").text("حدث خطأ أثناء حفظ التعديلات").show().fadeOut(3000);
            }
        });
    });

    // Function to download Excel
    function downloadExcel(filename) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(document.getElementById("finance-table"));
        XLSX.utils.book_append_sheet(wb, ws, "Finance Data");
        XLSX.writeFile(wb, filename);
    }

    // Download Excel button click
    $("#downloadFinance").click(function() {
        downloadExcel("finance_data.xlsx");
    });

    // Initial data fetch when the page loads
    $("#today").click();

    // Close modal when clicking outside of it
    $(window).on("click", function(event) {
        if ($(event.target).is("#edit-modal")) {
            $("#edit-modal").hide();
        }
    });
});
