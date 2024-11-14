$(document).ready(function() {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    let fetchedData = []; // Variable to store fetched data for CSV export

    // Fetch Onion-Garlic Customers
    $("#fetchOnionCustomers").click(function() {
        $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/api/oniongarliccustomers/', // Ensure the correct endpoint
            success: function (data) {
                // Clear any previous table data
                $(".o_g_cust-table_data").empty();
            
                // Create a table structure
                let table = `
                    <table border="1" cellpadding="10" cellspacing="0" id="og-cust-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>اسم العميل</th>
                                <th>الوزن القائم</th>
                                <th>الوزن الصافي</th>
                                <th>السعر</th>
                                <th>المبلغ</th>
                                <th>العهدة</th>
                                <th>رص</th>
                                <th>مبلغ العميل</th>
                                <th>المبلغ المدفوع:</th>
                                <th>وقت الدفع:</th>
                                <th colspan="2" style="text-align: center;">عمليات</th>
                            </tr>
                        </thead>
                        <tbody class="o_g_cust-table_body">
                        </tbody>
                    </table>
                `;
            
                // Append table to the container
                $(".o_g_cust-table_data").append(table);
            
                // Populate the table with data
                data.forEach(function(customer) {
                    let formattedDate2 = formatDate(customer.date);
                    let formattedDate3 = customer.Payment_date ? formatDate(customer.Payment_date) : '--/--/----'; // Check if Payment_date is available, else default

                    customer.farmers.forEach((farmer, index) => {
                        // For the first farmer of each customer, include customer-specific columns
                        if (index === 0) {
                            $(".o_g_cust-table_body").append(`
                                <tr data-id="${customer._id}">
                                    <td rowspan="${customer.farmers.length}">${formattedDate2}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.customer_name}</td>
                                    <td>${farmer.outstanding_amount}</td>
                                    <td>${farmer.net_amount}</td>
                                    <td>${farmer.price}</td>
                                    <td>${farmer.cash}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.Financial_commitment}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.ras}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.customer_cash}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.Amount_paid}</td>
                                    <td rowspan="${customer.farmers.length}">${formattedDate3}</td>
                                    <td rowspan="${customer.farmers.length}">
                                        <button class="og-cust-edit-btn">تعديل</button>
                                    </td>
                                    <td rowspan="${customer.farmers.length}">
                                        <button class="og-cust-delete-btn">مسح</button>
                                    </td>
                                </tr>
                            `);
                        } else {
                            // For additional rows, do not show farmer-specific data
                            $(".o_g_cust-table_body").append(`
                                <tr data-id="${farmer._id}">
                                    <td>${farmer.outstanding_amount}</td>
                                    <td>${farmer.net_amount}</td>
                                    <td>${farmer.price}</td>
                                    <td>${farmer.cash}</td>
                                </tr>
                            `);
                        }
                    });
                });
            
                // Edit and delete customer event handlers
                $(".og-cust-edit-btn").off("click").on("click", function() {
                    const customerId = $(this).closest("tr").attr("data-id");
                    editCustomer(customerId);
                });
            
                $(".og-cust-delete-btn").off("click").on("click", function() {
                    const customerId = $(this).closest("tr").attr("data-id");
                    deleteCustomer(customerId);
                });
            },
            error: function (error) {
                console.log('Error:', error);
            }
            
        });
    });

    // Attach event listeners for Edit and Delete buttons
    function attachEventListeners() {
        $(".og-cust-edit-btn").off("click").on("click", function() {
            const customerId = $(this).closest("tr").attr("data-id");
            editCustomer(customerId);
        });

        $(".og-cust-delete-btn").off("click").on("click", function() {
            const customerId = $(this).closest("tr").attr("data-id");
            deleteCustomer(customerId);
        });
    }

    // Function to handle customer deletion
    function deleteCustomer(customerId) {
        if (confirm("Are you sure you want to delete this Customer?")) {
            $.ajax({
                method: 'DELETE',
                url: `http://localhost:3000/api/oniongarliccustomers/${customerId}`,
                success: function(response) {
                    alert('Customer deleted successfully!');
                    $("#fetchOnionCustomers").click(); // Refresh the customer list
                },
                error: function(error) {
                    console.log('Error:', error);
                    alert('An error occurred while deleting the customer. Please try again.');
                }
            });
        };
    };

    // Placeholder for editCustomer function
    function editCustomer(customerId) {
        // Fetch the customer's existing data
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/oniongarliccustomers/${customerId}`,
            success: function(customer) {
                
                // Populate the form with the customer's existing data
                $("#oGCustNameEdit").val(customer.customer_name);
                $("#oGFinancialCommitmentEdit").val(customer.Financial_commitment);
                $("#oGrasEdit").val(customer.ras);
                $("#oGcustomerCashEdit").val(customer.customer_cash);
                $("#oGcustomerPaidAmountEdit").val(customer.Amount_paid);
    
                // Show the popup form for editing the customer
                $(".popup-overlay-o-g-cust-edit").fadeToggle();
                $(".popup-content-o-g-cust-edit").fadeToggle();
    
                // Handle the form submission for editing the customer
                $("#ogCustFormEdit").off("submit").on("submit", function(e) {
                    e.preventDefault();
    
                    // Capture the updated customer data
                    let updatedoGCustomerData = {
                        customer_name: $("#oGCustNameEdit").val().trim(),
                        financial_commitment: parseFloat($("#oGFinancialCommitmentEdit").val().trim()),
                        ras: parseFloat($("#oGrasEdit").val().trim()),
                        customer_cash: parseFloat($("#oGcustomerCashEdit").val().trim()),
                        Amount_paid: parseFloat($("#oGcustomerPaidAmountEdit").val().trim())
                    };
    
                    // Set Payment_date to the current date if Amount_paid changes
                    if (updatedoGCustomerData.Amount_paid !== customer.Amount_paid) {
                        updatedoGCustomerData.Payment_date = new Date();
                    }
    
                    console.log(updatedoGCustomerData);
                    
                    // Validate that numeric fields contain valid numbers
                    if (isNaN(updatedoGCustomerData.financial_commitment) || 
                        isNaN(updatedoGCustomerData.ras) || 
                        isNaN(updatedoGCustomerData.customer_cash) ||
                        isNaN(updatedoGCustomerData.Amount_paid)) {
                        alert("Please make sure all numeric fields are filled in correctly.");
                        return;
                    }
    
                    // Send the updated customer data via AJAX
                    $.ajax({
                        method: 'PATCH',
                        url: `http://localhost:3000/api/oniongarliccustomers/${customerId}`,
                        contentType: "application/json",
                        data: JSON.stringify(updatedoGCustomerData),
                        success: function(response) {
                            alert('Customer updated successfully!');
                            $(".popup-overlay-o-g-cust-edit").fadeToggle();
                            $(".popup-content-o-g-cust-edit").fadeToggle();
                            $("#ogCustFormEdit")[0].reset();
                            $("#fetchOnionCustomers").click(); // Optionally refresh the list of customers
                        },
                        error: function(error) {
                            console.error("Error updating customer:", error.responseText);
                            alert('Failed to update customer. Please check the details and try again.');
                        }
                    });
                });
            },
            error: function(error) {
                console.error("Error fetching customer data:", error);
                alert('Failed to fetch customer data. Please try again.');
            }
        });
    }
    
    // Handle Download CSV functionality
    function downloadExcel(filename) {
        const table = document.getElementById("og-cust-table");
        if (table) {
            const wb = XLSX.utils.book_new(); // Create a new workbook
            const ws = XLSX.utils.table_to_sheet(table); // Convert table to sheet
    
            // Append the sheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, "og customers Data");
    
            // Write the workbook and trigger the download
            XLSX.writeFile(wb, filename);
        } else {
            alert("Table not found. Make sure the data is loaded first.");
        }
    }

    // Trigger the Excel download when the button is clicked
    $("#downloadsaucecustomersDataBtn").click(function () {
        downloadExcel("og_customers_data.xlsx","og-cust-table"); // Specify the Excel file name
    });
});
