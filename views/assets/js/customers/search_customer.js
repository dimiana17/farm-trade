$(document).ready(function () {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    }

    // Global variable to store customer data
    let customerData = []; 

    // SEARCH A CUSTOMER BY NAME, DATE, AND COMMODITY NAME
    $("#searchCustomers").click(function () {
        let customerName = $("#customerName").val().trim();
        let customerDate = $("#customerDate").val();
        let commodityName = $("#commodityName").val();
    
        let queryParams = {};
        if (customerName) {
            queryParams.customer_name = customerName;
        }
        if (commodityName) {
            queryParams.commodity_name = commodityName;
        }
        if (customerDate) {
            queryParams.date = customerDate;
        }
    
        const queryString = $.param(queryParams);
    
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/customers/search?${queryString}`,
            success: function (data) {
                $(".customer-table_data").empty();
                
                // Create table structure with reordered columns
                let table = `
                    <table border="1" cellpadding="10" cellspacing="0" id="cust-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>اسم العميل</th>
                                <th>الوزن القائم</th>
                                <th>العدد</th>
                                <th>الوزن الصافي</th>
                                <th>السعر</th>
                                <th>مبلغ الفلاح</th>
                                <th>المصروف</th>
                                <th>مبلغ العميل</th>
                                <th>المبلغ المدفوع:</th>
                                <th>وقت الدفع:</th>
                                <th colspan="2" style="text-align: center;">عمليات</th>
                            </tr>
                        </thead>
                        <tbody class="customer-table-body">
                        </tbody>
                    </table>
                `;
    
                $(".customer-table_data").append(table);
    
                data.forEach(function (customer) {
                    let formattedDate2 = formatDate(customer.date);
                    let formattedDate3 = customer.Payment_date ? formatDate(customer.Payment_date) : '--/--/----'; 
    
                    customer.farmers.forEach((farmer, index) => {
                        if (index === 0) {
                            $(".customer-table-body").append(`
                                <tr data-id="${customer._id}">
                                    <td rowspan="${customer.farmers.length}">${formattedDate2}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.customer_name}</td>
                                    <td>${farmer.outstanding_amount}</td>
                                    <td>${farmer.commodity_number}</td>
                                    <td>${farmer.net_amount}</td>
                                    <td>${farmer.price}</td>
                                    <td>${farmer.cash}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.outgoing}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.customer_cash}</td>
                                    <td rowspan="${customer.farmers.length}">${customer.Amount_paid}</td>
                                    <td rowspan="${customer.farmers.length}">${formattedDate3}</td>
                                    <td rowspan="${customer.farmers.length}"><button class="edit-customer-btn">تعديل</button></td>
                                    <td rowspan="${customer.farmers.length}"><button class="delete-customer-btn">مسح</button></td>
                                </tr>
                            `);
                        } else {
                            $(".customer-table-body").append(`
                                <tr data-id="${farmer._id}">
                                    <td>${farmer.outstanding_amount}</td>
                                    <td>${farmer.commodity_number}</td>
                                    <td>${farmer.net_amount}</td>
                                    <td>${farmer.price}</td>
                                    <td>${farmer.cash}</td>
                                </tr>
                            `);
                        }
                    });
                });
    
                // Fetch sums for the given customer name
                if (customerName) {
                    $.ajax({
                        method: 'GET',
                        url: `http://localhost:3000/api/customers/sums/name/${customerName}`,  // Ensure this URL is correct
                        success: function (sums) {
                            
                            // Access the first item in the array
                            let totalCustomerCash = sums[0].total_customer_cash || 0;
                            let totalAmountPaid = sums[0].total_amount_paid || 0;
                            let difference = sums[0].total_balance || 0;
                            
                            
                            // Now you can use these values to update the table with the summed data
                        
                            $(".customer-table-body").append(`
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
                }
    
                // Edit customer
                $(".edit-customer-btn").off("click").on("click", function () {
                    const customerId = $(this).closest("tr").attr("data-id");
                    editCustomer(customerId);
                });
    
                // Delete customer
                $(".delete-customer-btn").off("click").on("click", function () {
                    const customerId = $(this).closest("tr").attr("data-id");
                    deleteCustomer(customerId);
                });
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });
    function attachEventListeners() {
        $(".edit-customer-btn").off("click").on("click", function () {
            const customerId = $(this).closest("tr").attr("data-id");
            editCustomer(customerId);
        });

        $(".delete-customer-btn").off("click").on("click", function () {
            const customerId = $(this).closest("tr").attr("data-id");
            deleteCustomer(customerId);
        });
    }

    // Function to handle customer deletion
    function deleteCustomer(customerId) {
        if (confirm("Are you sure you want to delete this Customer?")) {
            $.ajax({
                method: 'DELETE',
                url: `http://localhost:3000/api/saucecustomers/${customerId}`,
                success: function (response) {
                    alert('Customer deleted successfully!');
                    $("#fetchCustomers").click(); // Refresh the customer list
                },
                error: function (error) {
                    console.log('Error:', error);
                    alert('An error occurred while deleting the customer. Please try again.');
                }
            });
        };
    };

    function editCustomer(customerId) {
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/customers/${customerId}`,
            success: function (customer) {
                // Populate the form with customer data
                $("#customer_name_edit").val(customer.customer_name);
                $("#outgoing_edit").val(customer.outgoing);
                $("#customer_cash_edit").val(customer.customer_cash);
                $("#paid_amount_edit").val(customer.Amount_paid);
    
                // Display Payment_date or a message if it's missing
                if (customer.Payment_date) {
                    $("#payment_date_display").text(new Date(customer.Payment_date).toLocaleDateString());
                } else {
                    $("#payment_date_display").text("No payment date set.");
                }
    
                // Fetch farmers and populate the dropdown
                $.ajax({
                    method: 'GET',
                    url: `http://localhost:3000/api/farmers`,
                    success: function (farmers) {
                        $("#farmerDropdown").empty();
                        $("#farmerDropdown").append('<option value="">اختر الفلاح</option>'); // Default option
    
                        // Populate dropdown with farmers
                        farmers.forEach(function (farmer) {
                            let selected = customer.farmers && customer.farmers.includes(farmer._id) ? 'selected' : '';
                            $("#farmerDropdown").append(`<option value="${farmer._id}" ${selected}>${farmer.farmer_name}</option>`);
                        });
    
                        // Show the form
                        $(".popup-overlay-costomer-edit").fadeToggle();
                        $(".popup-content-costomer-edit").fadeToggle();
    
                        // Automatically update customer_cash when outgoing changes
                        $("#outgoing_edit").on("input", function () {
                            const outgoing = parseFloat($(this).val()) || 0;
                            const initialCash = parseFloat(customer.customer_cash) || 0;
                            const updatedCash = initialCash - outgoing;
                            $("#customer_cash_edit").val(updatedCash.toFixed(2));
                        });
    
                        // Set Payment_date to the current date if Amount_paid changes
                        $("#paid_amount_edit").on("input", function () {
                            const amountPaid = parseFloat($(this).val()) || 0;
                            if (amountPaid !== customer.Amount_paid) {
                                $("#payment_date_display").text(new Date().toLocaleDateString());
                            }
                        });
    
                        // Handle form submission for updating
                        $("#customerFormEdit").off("submit").on("submit", function (e) {
                            e.preventDefault();
    
                            // Capture updated customer data
                            let updatedCustomerData = {
                                customer_name: $("#customer_name_edit").val(),
                                outgoing: parseFloat($("#outgoing_edit").val()) || 0,
                                customer_cash: parseFloat($("#customer_cash_edit").val()) || 0,
                                Amount_paid: parseFloat($("#paid_amount_edit").val()) || 0,
                                Payment_date: new Date() // Set to current date on update
                            };
    
                            // Send the updated data via PATCH request
                            $.ajax({
                                method: 'PATCH',
                                url: `http://localhost:3000/api/customers/${customerId}`,
                                contentType: "application/json",
                                data: JSON.stringify(updatedCustomerData),
                                success: function () {
                                    alert('Customer updated successfully!');
                                    $(".popup-overlay-costomer-edit").fadeToggle();
                                    $(".popup-content-costomer-edit").fadeToggle();
                                    $("#customerFormEdit")[0].reset();
                                    $("#fetchCustomers").click();
                                },
                                error: function (error) {
                                    console.log('Error:', error);
                                    alert('An error occurred while updating the customer. Please try again.');
                                }
                            });
                        });
                    },
                    error: function (error) {
                        console.log('Error fetching farmers:', error);
                    }
                });
            },
            error: function (error) {
                console.log('Error fetching customer data:', error);
                alert('An error occurred while fetching the customer data. Please try again.');
            }
        });
    }
    
    
    
    
    // Function to download the customer data as an Excel file
    // Function to download the customer data as an Excel file
function downloadExcel(filename) {
    const table = document.getElementById("cust-table");
    if (table) {
        const wb = XLSX.utils.book_new(); // Create a new workbook
        const ws = XLSX.utils.table_to_sheet(table); // Convert table to sheet

        // Append the sheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "customers Data");

        // Write the workbook and trigger the download
        XLSX.writeFile(wb, filename);
    } else {
        alert("Table not found. Make sure the data is loaded first.");
    }
};

// Event handler for download button
$("#downloadcustomers").click(function () {
    downloadExcel("customer_data.xlsx"); // Pass the filename as a string
});

});
