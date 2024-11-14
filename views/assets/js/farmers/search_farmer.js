$(document).ready(function () {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // SEARCH A CUSTOMER BY NAME AND/OR DATE
    $("#SearchFarmers").click(function () {
        let farmerName = $("#FarmerName").val().trim();
        let commodityName = $("#commodityName").val().trim();
        let farmerDate = $("#farmerDate").val();

        // Prepare the query parameters
        let queryParams = {};
        if (farmerName) queryParams.name = farmerName;
        if (commodityName) queryParams.commodityName = commodityName;
        if (farmerDate) queryParams.date = farmerDate;

        // Construct query string
        const queryString = $.param(queryParams);
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/farmers/search?${queryString}`,
            success: function (data) {
                $(".table_data").empty(); // Clear existing table data
                let table = `
                    <table id="farmers-table" border="1" cellpadding="10" cellspacing="0" class="info-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>التاريخ</th>
                                <th>اسم الفلاح</th>
                                <th>السلعة</th>
                                <th>الوزن القائم</th>
                                <th>العدد</th>
                                <th>الصافي</th>
                                <th>السعر</th>
                                <th>المبلغ</th>
                                <th>العمولة</th>
                                <th>المبلغ المستحق</th>
                                <th>تم بيعه</th>
                                <th colspan="3" style="text-align: center;">عمليات</th>
                            </tr>
                        </thead>
                        <tbody class="farmer-table-body">
                        </tbody>
                    </table>
                `;
                $(".table_data").append(table);

                // Loop through the data and populate the table
                data.forEach(function (farmer) {
                    let sellButtonDisabled = farmer.sold === 'yes' ? 'disabled' : '';
                    let formattedDate = formatDate(farmer.date);
                    let checkboxDisabled = farmer.sold === 'yes' ? 'disabled' : '';

                    $(".farmer-table-body").append(`
                        <tr data-id="${farmer._id}">
                            <td><input type="checkbox" class="select-farmer" f-data-id="${farmer._id}" ${checkboxDisabled}></td>
                            <td>${formattedDate}</td>
                            <td>${farmer.farmer_name}</td>
                            <td>${farmer.commodity_name}</td>
                            <td>${farmer.outstanding_amount}</td>
                            <td>${farmer.commodity_number}</td>
                            <td>${farmer.net_amount}</td>
                            <td>${farmer.price}</td>
                            <td>${farmer.cash}</td>
                            <td>${farmer.commission}</td>
                            <td>${farmer.deserved_cash}</td>
                            <td>${farmer.sold}</td>
                            <td><button class="edit-farmer-btn">تعديل</button></td>
                            <td><button class="delete-farmer-btn">مسح</button></td>
                            <td><button class="bill-farmer-btn">فاتورة</button></td>
                        </tr>
                    `);
                });

                // Edit farmer
                $(".edit-farmer-btn").click(function () {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    editFarmer(farmerId);
                });

                // Delete farmer
                $(".delete-farmer-btn").click(function () {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    deleteFarmer(farmerId);
                });
                $(".bill-farmer-btn").click(function () {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    generateBill(farmerId);
                });

                // Bill generation
                
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });

    // Function to generate and display the bill
    // Function to generate a bill for a farmer and display it in the modal
function generateBill(farmerId) {
    $.ajax({
        method: 'GET',
        url: `http://localhost:3000/api/farmers/${farmerId}`,
        success: function (farmerData) {
            let billContent = `
                <h3>التاريخ: ${formatDate(farmerData.date)}</h3>
                <h3>المطلوب من السيد: ${farmerData.farmer_name}</h3>
                <table>
                    <thead class="bill-table">
                        <tr>
                            <th class="bill-table">ملاحظات</th>
                            <th class="bill-table">السعر</th>
                            <th class="bill-table">الوزن الصافي</th>
                            <th class="bill-table">العدد</th>
                            <th class="bill-table">العمولة + الفاتورة</th>
                            <th class="bill-table" colspan="3">الجملة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td width = "250px"></td>
                            <td>${farmerData.price}</td>
                            <td>${farmerData.net_amount}</td>
                            <td>${farmerData.commodity_number}</td>
                            <td>${farmerData.commission} + 15</td>
                            <td>${farmerData.deserved_cash}</td>
                        </tr>
                    </tbody>
                </table>
            `;

            // Inject the bill content into the modal
            $("#bill-content").html(billContent);

            // Fade in the modal
            $(".popup-overlay-bill").fadeIn();

            // Save button click event to save the bill as an image
            $("#save-bill-btn").off('click').on('click', function () {
                saveBillAsImage();
            });

            // Close the bill modal when the close button is clicked
            $(".close-btn-bill").off('click').on('click', function () {
                $(".popup-overlay-bill").fadeOut(); // Fade out the modal
                $(document).off('click'); // Unbind the document click handler
            });

            // Click event listener for closing the bill when clicking outside
            $(document).off('click').on('click', function (event) {
                if (!$(event.target).closest('.popup-content').length && !$(event.target).hasClass('bill-farmer-btn')) {
                    $(".popup-overlay-bill").fadeOut(); // Hide the bill
                    $(document).off('click'); // Unbind the document click handler to avoid multiple bindings
                }
            });
        },
        error: function (error) {
            console.log('Error:', error);
        }
    });
};

function saveBillAsImage() {
    // Select the bill content area to capture
    html2canvas(document.querySelector("#bill-content")).then(canvas => {
        // Convert the canvas to an image
        let imgData = canvas.toDataURL("image/png");
        
        // Create a temporary link element to download the image
        let link = document.createElement("a");
        link.href = imgData;
        link.download = "bill.png"; // Filename for the downloaded image
        link.click();
    });
};

    

    // Fetch farmers for today when the page loads
    function deleteFarmer(farmerId) {
        if (confirm("Are you sure you want to delete this farmer?")) {
            $.ajax({
                method: 'DELETE',
                url: `http://localhost:3000/api/farmers/${farmerId}`,
                success: function (response) {
                    alert('Farmer deleted successfully!');
                    fetchFarmersForToday(); // Refresh the farmer list after deletion
                },
                error: function (error) {
                    console.log('Error:', error);
                }
            });
        };
    };

    // Edit farmer function
    function editFarmer(farmerId) {
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/farmers/${farmerId}`,
            success: function (farmer) {
                // Populate the edit form with the farmer's data
                $("#farmer_name_edit").val(farmer.farmer_name);
                $("#commodity_name_edit").val(farmer.commodity_name);
                $("#outstanding_amount_edit").val(farmer.outstanding_amount);
                $("#commodity_number_edit").val(farmer.commodity_number);
                $("#net_amount_edit").val(farmer.net_amount);
                $("#price_edit").val(farmer.price);
                $("#cash_edit").val(farmer.cash);
                $("#commission_edit").val(farmer.commission);
                $("#deserved_cash_edit").val(farmer.deserved_cash);
                $(".popup-overlay-edit").fadeToggle();
                $(".popup-content-edit").fadeToggle();
    
                // Save the old farmer cash value
                var oldfarmercash = parseFloat($("#cash_edit").val()) || 0;
                var newfarmercash = 0;
    
                // Handle form submission for updating the farmer's data
                $("#farmerFormEdit").off("submit").on("submit", function (e) {
                    e.preventDefault();
    
                    // Get the new farmer cash value
                    newfarmercash = parseFloat($("#cash_edit").val()) || 0;
    
                    // Calculate the difference in farmer cash
                    var farmercash = newfarmercash - oldfarmercash;
    
                    // Create updated farmer data
                    let updatedFarmerData = {
                        farmer_name: $("#farmer_name_edit").val(),
                        commodity_name: $("#commodity_name_edit").val(),
                        outstanding_amount: $("#outstanding_amount_edit").val(),
                        commodity_number: $("#commodity_number_edit").val(),
                        net_amount: $("#net_amount_edit").val(),
                        price: $("#price_edit").val(),
                        cash: $("#cash_edit").val(),
                        commission: $("#commission_edit").val(),
                        deserved_cash: $("#deserved_cash_edit").val()
                    };
    
                    // AJAX request to update the farmer data
                    $.ajax({
                        method: 'PATCH',
                        url: `http://localhost:3000/api/farmers/${farmerId}`,
                        contentType: "application/json",
                        data: JSON.stringify(updatedFarmerData),
                        success: function (response) {
                            alert('Farmer updated successfully!');
    
                            // Update the related customer cash
                            updateCustomerCash(farmerId, farmercash);
    
                            $(".popup-overlay-edit").fadeToggle();
                            $(".popup-content-edit").fadeToggle();
                            $("#farmerFormEdit")[0].reset(); // Reset the form after update
                            fetchFarmersForToday(); // Refresh the farmer list after update
                        },
                        error: function (error) {
                            console.log('Error updating farmer:', error);
                        }
                    });
                });
    
                // Functions to calculate values
                function calculateNetAmount() {
                    const outstandingAmount = parseFloat($('#outstanding_amount_edit').val()) || 0;
                    const commodityNumber = parseFloat($('#commodity_number_edit').val()) || 0;
                    const netValue = outstandingAmount - (0.5 * commodityNumber);
                    $('#net_amount_edit').val(netValue.toFixed(2));
                    calculateCash(); // Trigger cash calculation when net amount changes
                };
    
                function calculateCash() {
                    const netAmount = parseFloat($('#net_amount_edit').val()) || 0;
                    const price = parseFloat($('#price_edit').val()) || 0;
                    const cash = netAmount * price;
                    $('#cash_edit').val(cash.toFixed(2));
                    calculateCommission(); // Trigger commission calculation when cash changes
                };
    
                function calculateCommission() {
                    const cash = parseFloat($('#cash_edit').val()) || 0;
                    const commission = cash * 0.05;
                    $('#commission_edit').val(commission.toFixed(2));
                    calculateDeservedCash(); // Trigger deserved cash calculation when commission changes
                };
    
                function calculateDeservedCash() {
                    const cash = parseFloat($('#cash_edit').val()) || 0;
                    const commission = parseFloat($('#commission_edit').val()) || 0;
                    const deservedCash = cash - (commission + 15);
                    $('#deserved_cash_edit').val(deservedCash.toFixed(2));
                };
    
                // Trigger calculations on input changes
                $('#outstanding_amount_edit, #commodity_number_edit').on('input', calculateNetAmount);
                $('#net_amount_edit, #price_edit').on('input', calculateCash);
                $('#cash_edit').on('input', calculateCommission);
                $('#commission_edit').on('input', calculateDeservedCash);
            },
            error: function (error) {
                console.log('Error fetching farmer data:', error);
            }
        });
    };
    
    // Function to update the related customer's cash
    function updateCustomerCash(farmerId, farmercash) {
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/customers/byFarmer/${farmerId}`,
            success: function (customer) {
                if (customer) {
                    // Log customer outgoing and cash
                    console.log('Customer Outgoing:', customer.outgoing);
                    console.log('Farmer Cash Difference:', farmercash);
    
                    // Update the customer's cash value by adding the farmer cash difference
                    const updatedCustomerCash = parseFloat(customer.customer_cash) + farmercash;
    
                    // Update the customer's cash, name, and outgoing
                    $.ajax({
                        method: 'PATCH',
                        url: `http://localhost:3000/api/customers/${customer._id}`,
                        contentType: "application/json",
                        data: JSON.stringify({
                            customer_cash: updatedCustomerCash,
                            customer_name: customer.customer_name, // Send old customer_name
                            outgoing: customer.outgoing // Send old outgoing value
                        }),
                        success: function () {
                            console.log('Customer cash, name, and outgoing updated successfully!');
                        },
                        error: function (error) {
                            console.log('Error updating customer data:', error);
                        }
                    });
                } else {
                    console.log('No customer found for the given farmer.');
                }
            },
            error: function (error) {
                console.log('Error fetching customer data:', error);
            }
        });
    };
    
    
    // Download Excel functionality
    function downloadExcel(filename) {
        const table = document.getElementById("farmers-table");
        if (table) {
            const wb = XLSX.utils.book_new(); // Create a new workbook
            const ws = XLSX.utils.table_to_sheet(table); // Convert table to sheet
    
            // Append the sheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, "Farmers Data");
    
            // Write the workbook and trigger the download
            XLSX.writeFile(wb, filename);
        } else {
            alert("Table not found. Make sure the data is loaded first.");
        }
    }

    // Trigger the Excel download when the button is clicked
    $("#downloadFarmers").click(function () {
        downloadExcel("farmers_data.xlsx"); // Specify the Excel file name
    });

    
});
