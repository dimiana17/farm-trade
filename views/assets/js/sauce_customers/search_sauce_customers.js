$(document).ready(function () {
    let fetchedData = []; 

    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // SEARCH A CUSTOMER BY NAME AND/OR DATE
    $("#searchSauceCustomers").click(function () {
        let customerName = $("#sauceCustomerName").val().trim();
        let customerDate = $("#sauceCustomerDate").val();
    
        // Prepare the query parameters
        let queryParams = {};
        if (customerName) {
            queryParams.name = customerName;
        }
        if (customerDate) {
            queryParams.date = customerDate;
        }
    
        // Construct query string
        const queryString = $.param(queryParams);
    
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/saucecustomers/search?${queryString}`,
            success: function (data) {
                // Store data for export
                fetchedData = data;
    
                // Clear any previous table data
                $(".sauce_cust-table_data").empty();
    
                // Create a table structure
                let table = `
                    <table border="1" cellpadding="10" cellspacing="0" id="sauce-customer-table">
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
                        <tbody class="sauce_cust-table_body">
                        </tbody>
                    </table>
                `;
    
                // Append table to the container
                $(".sauce_cust-table_data").append(table);
    
                // Loop through the data and append each customer’s information into the table
                data.forEach(function (customer) {
                    let formattedDate2 = formatDate(customer.date);
                    let formattedDate3 = customer.Payment_date ? formatDate(customer.Payment_date) : '--/--/----'; // Check if Payment_date is available, else default
    
                    // Create a single row for each customer and include their specific columns
                    $(".sauce_cust-table_body").append(`
                        <tr data-id="${customer._id}">
                            <td rowspan="${customer.farmers.length}">${formattedDate2}</td>
                            <td rowspan="${customer.farmers.length}">${customer.customer_name}</td>
                            <td>${customer.farmers.length > 0 ? customer.farmers[0].outstanding_amount : 'غير متوفر'}</td>
                            <td>${customer.farmers.length > 0 ? customer.farmers[0].net_amount : 'غير متوفر'}</td>
                            <td>${customer.farmers.length > 0 ? customer.farmers[0].price : 'غير متوفر'}</td>
                            <td>${customer.farmers.length > 0 ? customer.farmers[0].cash : 'غير متوفر'}</td>
                            <td rowspan="${customer.farmers.length}">${customer.Financial_commitment}</td>
                            <td rowspan="${customer.farmers.length}">${customer.ras}</td>
                            <td rowspan="${customer.farmers.length}">${customer.customer_cash}</td>
                            <td rowspan="${customer.farmers.length}">${customer.Amount_paid}</td>
                            <td rowspan="${customer.farmers.length}">${formattedDate3}</td>
                            <td rowspan="${customer.farmers.length}"><button class="edit-s-customer-btn">تعديل</button></td>
                            <td rowspan="${customer.farmers.length}"><button class="delete-s-customer-btn">مسح</button></td>
                        </tr>
                    `);
    
                    // Additional rows for each farmer
                    for (let i = 1; i < customer.farmers.length; i++) {
                        $(".sauce_cust-table_body").append(`
                            <tr data-id="${customer.farmers[i]._id}">
                                <td>${customer.farmers[i].outstanding_amount}</td>
                                <td>${customer.farmers[i].net_amount}</td>
                                <td>${customer.farmers[i].price}</td>
                                <td>${customer.farmers[i].cash}</td>
                            </tr>
                        `);
                    }
                });
    
                // Attach event listeners for Edit and Delete buttons
                attachEventListeners();
            },
            error: function (error) {
                console.log('Error:', error);
                alert('An error occurred while fetching customers. Please try again.');
            }
        });
    
        // Fetching sums if customerName is present
        if (customerName) {
            $.ajax({
                method: 'GET',
                url: `http://localhost:3000/api/saucecustomers/sums/name/${customerName}`,  // Ensure this URL is correct
                success: function (sums) {

                    // Access the first item in the array
                    let totalCustomerCash = sums[0].total_customer_cash || 0;
                    let totalAmountPaid = sums[0].total_amount_paid || 0;
                    let difference = sums[0].total_balance || 0;
    
                    // Now you can use these values to update the table with the summed data
                    $(".sauce_cust-table_body").append(`
                        <tr>
                            <td colspan="8" style="text-align: right; font-weight: bold;">الإجمالي</td>
                            <td>${totalCustomerCash}</td>
                            <td>${totalAmountPaid}</td>
                            <td>${difference}</td>
                            <td colspan="3"></td>
                        </tr>
                    `);
                },
                error: function (error) {
                    console.log('Error fetching sums:', error);
                }
            });
        };
    
        // Use event delegation to handle the download button click
        $(document).on("click", "#downloadsaucecustomersDataBtn", function () {
            // Check if fetchedData is not empty
            if (fetchedData.length === 0) {
                alert("No data available to download. Please perform a search first.");
                return;
            }
    
            let csvContent = "data:text/csv;charset=utf-8,";
    
            // Add the header row
            csvContent += "التاريخ,اسم العميل,اسم الفلاح,العهدة,رص,مبلغ العميل\n";
    
            // Add the rows from the fetched data
            fetchedData.forEach(function (customer) {
                let formattedDate = formatDate(customer.date);
                let farmerNames = customer.farmers.length > 0
                    ? customer.farmers.map(farmer => farmer.farmer_name).join(', ')
                    : 'غير متوفر';
    
                let row = [
                    formattedDate,
                    customer.customer_name,
                    farmerNames,
                    customer.Financial_commitment,
                    customer.ras,
                    customer.customer_cash
                ].join(",");
    
                csvContent += row + "\n";
            });
    
            // Create a link element to trigger the download
            let encodedUri = encodeURI(csvContent);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "sauce_customers_data.csv");
            document.body.appendChild(link);
    
            // Trigger the download
            link.click();
        });
    
        // Function to attach Edit and Delete button event listeners
        function attachEventListeners() {
            $(".edit-s-customer-btn").off("click").on("click", function () {
                const customerId = $(this).closest("tr").attr("data-id");
                editCustomer(customerId);
            });
    
            $(".delete-s-customer-btn").off("click").on("click", function () {
                const customerId = $(this).closest("tr").attr("data-id");
                deleteCustomer(customerId);
            });
        };
    });
    

    // Function to handle customer deletion
    function deleteCustomer(customerId) {
        if (confirm("Are you sure you want to delete this Customer?")) {
            $.ajax({
                method: 'DELETE',
                url: `http://localhost:3000/api/saucecustomers/${customerId}`,
                success: function(response) {
                    alert('Customer deleted successfully!');
                    $("#fetchSauceCustomers").click(); // Refresh the customer list
                },
                error: function(error) {
                    console.log('Error:', error);
                    alert('An error occurred while deleting the customer. Please try again.');
                }
            });
        };
    };

    // Function to handle customer editing
    function editCustomer(customerId) {
        // Fetch the customer's existing data
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/saucecustomers/${customerId}`,
            success: function(customer) {
                
                // Populate the form with the customer's existing data
                $("#sauce_customer_name_edit").val(customer.customer_name);
                $("#sauce_Financial_commitment_edit").val(customer.Financial_commitment);
                $("#sauce_ras_edit").val(customer.ras);
                $("#sauce_customer_cash_edit").val(customer.customer_cash);
                $("#sauce_customer_paid_amount_edit").val(customer.Amount_paid);
    
                // Show the popup form for editing the customer
                $(".popup-overlay-sauce-customers-edit").fadeToggle();
                $(".popup-content-sauce-customers-edit").fadeToggle();
    
                // Handle the form submission for editing the customer
                $("#sauceCustomerFormEdit").off("submit").on("submit", function(e) {
                    e.preventDefault();
    
                    // Capture the updated customer data
                    let updatedSCustomerData = {
                        customer_name: $("#sauce_customer_name_edit").val().trim(),
                        financial_commitment: parseFloat($("#sauce_Financial_commitment_edit").val().trim()),
                        ras: parseFloat($("#sauce_ras_edit").val().trim()),
                        customer_cash: parseFloat($("#sauce_customer_cash_edit").val().trim()),
                        Amount_paid: parseFloat($("#sauce_customer_paid_amount_edit").val().trim())
                    };
    
                    // Set Payment_date to the current date if Amount_paid changes
                    if (updatedSCustomerData.Amount_paid !== customer.Amount_paid) {
                        updatedSCustomerData.Payment_date = new Date();
                    }
    
                    
                    // Validate that numeric fields contain valid numbers
                    if (isNaN(updatedSCustomerData.financial_commitment) || 
                        isNaN(updatedSCustomerData.ras) || 
                        isNaN(updatedSCustomerData.customer_cash) ||
                        isNaN(updatedSCustomerData.Amount_paid)) {
                        alert("Please make sure all numeric fields are filled in correctly.");
                        return;
                    }
    
                    // Send the updated customer data via AJAX
                    $.ajax({
                        method: 'PATCH',
                        url: `http://localhost:3000/api/saucecustomers/${customerId}`,
                        contentType: "application/json",
                        data: JSON.stringify(updatedSCustomerData),
                        success: function(response) {
                            alert('Customer updated successfully!');
                            $(".popup-overlay-sauce-customers-edit").fadeToggle();
                            $(".popup-content-sauce-customers-edit").fadeToggle();
                            $("#sauceCustomerFormEdit")[0].reset();
                            $("#searchSauceCustomers").click(); // Optionally refresh the list of customers
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
    };
    
    // Download Excel functionality
    function downloadExcel(filename) {
        const table = document.getElementById("sauce-customer-table");
        if (table) {
            const wb = XLSX.utils.book_new(); // Create a new workbook
            const ws = XLSX.utils.table_to_sheet(table); // Convert table to sheet
    
            // Append the sheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, "sauce customers Data");
    
            // Write the workbook and trigger the download
            XLSX.writeFile(wb, filename);
        } else {
            alert("Table not found. Make sure the data is loaded first.");
        }
    }

    // Trigger the Excel download when the button is clicked
    $("#downloadsaucecustomersDataBtn").click(function () {
        downloadExcel("sauce_cust_data.xlsx","sauce-customer-table"); // Specify the Excel file name
    });
    
});
