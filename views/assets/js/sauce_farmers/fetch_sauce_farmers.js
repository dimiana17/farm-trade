$(document).ready(function() {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // Fetch Sauce Farmers
    $("#fetchSauceFarmers").click(function() {
        $.ajax({
            method: 'GET',
            url: 'http://localhost:3000/api/saucefarmers/',
            success: function(data) {
                $(".sauce-table_data").empty();

                let table = `
                    <table border="1" cellpadding="10" cellspacing="0" class="info-table" id="sauce-farmers-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>التاريخ</th>
                                <th>اسم الفلاح</th>
                                <th>الوزن القائم</th>
                                <th>الوزن الصافي</th>
                                <th>السعر</th>
                                <th>العمولة</th>
                                <th>نولون</th>
                                <th>سلفة</th>
                                <th>المبلغ</th>
                                <th>المبلغ المستحق</th>
                                <th>تم بيعه</th>
                                <th colspan="3" style="text-align: center;">عمليات</th>
                            </tr>
                        </thead>
                        <tbody class="sauce-farmer-table-body">
                        </tbody>
                    </table>
                `;

                $(".sauce-table_data").append(table);

                data.forEach(function(sauceFarmer) {
                    let sellButtonDisabled = sauceFarmer.sold === 'yes' ? 'disabled' : '';
                    let formattedDate = formatDate(sauceFarmer.date);
                    let checkboxDisabled = sauceFarmer.sold === 'yes' ? 'disabled' : '';

                    $(".sauce-farmer-table-body").append(`
                        <tr data-id="${sauceFarmer._id}">
                            <td><input type="checkbox" class="select-sauce-farmer" data-id="${sauceFarmer._id}" ${checkboxDisabled}></td>
                            <td>${formattedDate}</td>
                            <td>${sauceFarmer.farmer_name}</td>
                            <td>${sauceFarmer.outstanding_amount}</td>
                            <td>${sauceFarmer.net_amount}</td>
                            <td>${sauceFarmer.price}</td>
                            <td>${sauceFarmer.commission}</td>
                            <td>${sauceFarmer.nolon}</td>
                            <td>${sauceFarmer.advance}</td>
                            <td>${sauceFarmer.cash}</td>
                            <td>${sauceFarmer.deserved_cash}</td>
                            <td>${sauceFarmer.sold}</td>
                            <td><button class="edit-sauce-f-btn">تعديل</button></td>
                            <td><button class="delete-sauce-f-btn">مسح</button></td>
                            <td><button class="og-bill-farmer-btn">فاتورة</button></td>

                        </tr>
                    `);
                });

                // Edit farmer
                $(".edit-sauce-f-btn").click(function() {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    editFarmer(farmerId);
                });

                // Delete farmer
                $(".delete-sauce-f-btn").click(function() {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    deleteFarmer(farmerId);
                });
                $(".sauce-bill-farmer-btn").click(function () {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    generateBill(farmerId);
                });

                // Attach download functionality to the button
                $("#downloadSauceFarmers").click(function() {
                    downloadExcel("sauce_farmers_data.xlsx", "sauce-farmers-table");
                });
            },
            error: function(error) {
                console.log('Error:', error);
            }
        });
    });
    function generateBill(farmerId) {
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/saucefarmers/${farmerId}`,
            success: function (farmerData) {
                const {
                    date,
                    farmer_name,
                    price,
                    net_amount,
                    commission,
                    nolon,
                    advance,
                    deserved_cash
                } = farmerData;
    
                // Format the bill content
                let billContent = `
                    <h3>التاريخ: ${formatDate(date)}</h3>
                    <h3>المطلوب من السيد: ${farmer_name}</h3>
                    <table class="bill-table">
                        <thead>
                            <tr>
                                <th>ملاحظات</th>
                                <th>السعر</th>
                                <th>الوزن الصافي</th>
                                <th>العمولة</th>
                                <th>نولون</th>
                                <th>سلفة</th>
                                <th>فاتورة</th>
                                <th colspan="3">الجملة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td width="150px"></td>
                                <td>${price}</td>
                                <td>${net_amount}</td>
                                <td>${commission}</td>
                                <td>${nolon}</td>
                                <td>${advance}</td>
                                <td>15</td>
                                <td>${deserved_cash}</td>
                            </tr>
                        </tbody>
                    </table>
                `;
    
                // Display the bill content in the modal
                $("#sauce-bill-content").html(billContent);
                $(".sauce-popup-overlay-bill").fadeIn();
    
                // Attach event for saving the bill as an image
                $("#sauce-save-bill-btn").off('click').on('click', function () {
                    saveBillAsImage();
                });
    
                // Attach close event for the modal
                $(".sauce-close-btn-bill").off('click').on('click', function () {
                    closeBillModal();
                });
    
                // Click outside modal to close
                $(document).off('click').on('click', function (event) {
                    if (!$(event.target).closest('.sauce-popup-content-bill').length && !$(event.target).hasClass('bill-farmer-btn')) {
                        closeBillModal();
                    }
                });
            },
            error: function (error) {
                console.error('Error:', error);
                alert("Error loading bill details. Please try again.");
            }
        });
    };
    
    // Helper function to close the bill modal and remove click events
    function closeBillModal() {
        $(".sauce-popup-overlay-bill").fadeOut();
        $(document).off('click');
    };
    
    

function saveBillAsImage() {
    // Select the bill content area to capture
    html2canvas(document.querySelector("#sauce-bill-content")).then(canvas => {
        // Convert the canvas to an image
        let imgData = canvas.toDataURL("image/png");
        
        // Create a temporary link element to download the image
        let link = document.createElement("a");
        link.href = imgData;
        link.download = "bill.png"; // Filename for the downloaded image
        link.click();
    });
};
    // Function to delete farmer
    function deleteFarmer(farmerId) {
        if (confirm("Are you sure you want to delete this farmer?")) {
            $.ajax({
                method: 'DELETE',
                url: `http://localhost:3000/api/saucefarmers/${farmerId}`,
                success: function(response) {
                    alert('Farmer deleted successfully!');
                    $("#fetchSauceFarmers").click();
                },
                error: function(error) {
                    console.log('Error:', error);
                }
            });
        };
    };

    // Function to edit farmer
    function editFarmer(farmerId) {
        // Fetch the farmer's existing data
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/saucefarmers/${farmerId}`,
            success: function(farmer) {
                // Populate the form with the farmer's existing data
                $("#sauce_farmer_name_edit").val(farmer.farmer_name);
                $("#outstandingamount_edit").val(farmer.outstanding_amount);
                $("#ne_amount_edit").val(farmer.net_amount); // New field for net amount
                $("#sauce_price_edit").val(farmer.price);
                $("#commissio_edit").val(farmer.commission);
                $("#nolon_edit").val(farmer.nolon);
                $("#advance_edit").val(farmer.advance);
                $("#cas_edit").val(farmer.cash); // New field for cash
                $("#deserve_cash_edit").val(farmer.deserved_cash); // New field for deserved cash
    
                // Show the popup form for editing the farmer
                $(".popup-overlay-sauce-farmer-edit").fadeToggle();
                $(".popup-content-sauce-farmer-edit").fadeToggle();
    
                // Function to update the calculated fields
                function updateCalculatedFields() {
                    const outstandingAmount = parseFloat($("#outstandingamount_edit").val()) || 0;
                    const price = parseFloat($("#sauce_price_edit").val()) || 0;
                    const nolon = parseFloat($("#nolon_edit").val()) || 0;
                    const advance = parseFloat($("#advance_edit").val()) || 0;
    
                    // Calculations
                    const netAmount = outstandingAmount * 0.95; // net_amount = outstanding_amount * 95%
                    const cash = netAmount * price; // cash = net_amount * price
                    const commission = cash* .05;
                    const deservedCash = cash - (commission + nolon + advance + 15); // deserved_cash = cash - (commission + nolon + advance)
    
                    // Update the input fields with the calculated values
                    $("#ne_amount_edit").val(netAmount.toFixed(2));
                    $("#cas_edit").val(cash.toFixed(2));
                    $("#deserve_cash_edit").val(deservedCash.toFixed(2));
                };
    
                // Attach input event listeners to fields that affect calculations
                $("#outstandingamount_edit, #sauce_price_edit, #commissio_edit, #nolon_edit, #advance_edit").on("input", function() {
                    updateCalculatedFields();
                });
    
                // Initially calculate values when the form is loaded
                updateCalculatedFields();
    
                // Handle the form submission for editing the farmer
                $("#sauceFarmerFormEdit").off("submit").on("submit", function(e) {
                    e.preventDefault();
    
                    // Capture the updated farmer data
                    let updatedFarmerData = {
                        farmer_name: $("#sauce_farmer_name_edit").val().trim(),
                        outstanding_amount: parseFloat($("#outstandingamount_edit").val().trim()),
                        net_amount: parseFloat($("#ne_amount_edit").val().trim()),
                        price: parseFloat($("#sauce_price_edit").val().trim()),
                        commission: parseFloat($("#commissio_edit").val().trim()),
                        nolon: parseFloat($("#nolon_edit").val().trim()),
                        advance: parseFloat($("#advance_edit").val().trim()),
                        cash: parseFloat($("#cas_edit").val().trim()),
                        deserved_cash: parseFloat($("#deserve_cash_edit").val().trim())
                    };
    
                    // Validate that numeric fields contain valid numbers
                    if (isNaN(updatedFarmerData.outstanding_amount) || isNaN(updatedFarmerData.net_amount) || 
                        isNaN(updatedFarmerData.price) || isNaN(updatedFarmerData.commission) || 
                        isNaN(updatedFarmerData.nolon) || isNaN(updatedFarmerData.advance) || 
                        isNaN(updatedFarmerData.cash) || isNaN(updatedFarmerData.deserved_cash)) {
                        alert("Please make sure all numeric fields are filled in correctly.");
                        return;
                    }
    
                    // Send the updated farmer data via AJAX
                    $.ajax({
                        method: 'PATCH',
                        url: `http://localhost:3000/api/saucefarmers/${farmerId}`,
                        contentType: "application/json",
                        data: JSON.stringify(updatedFarmerData),
                        success: function(response) {
                            alert('Farmer updated successfully!');
                            $(".popup-overlay-sauce-farmer-edit").fadeToggle();
                            $(".popup-content-sauce-farmer-edit").fadeToggle();
                            $("#sauceFarmerFormEdit")[0].reset();
                            $("#fetchSauceFarmers").click();
                        },
                        error: function(error) {
                            console.error("Error updating farmer:", error.responseText);
                            alert('Failed to update farmer. Please check the details and try again.');
                        }
                    });
                });
            },
            error: function(error) {
                console.error("Error fetching farmer data:", error);
                alert('Failed to fetch farmer data. Please try again.');
            }
        });
    };
    // Function to download Excel
    function downloadExcel(filename) {
        const table = document.getElementById("sauce-farmers-table");
        if (table) {
            const wb = XLSX.utils.book_new(); // Create a new workbook
            const ws = XLSX.utils.table_to_sheet(table); // Convert table to sheet
    
            // Append the sheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, "sauce farmers Data");
    
            // Write the workbook and trigger the download
            XLSX.writeFile(wb, filename);
        } else {
            alert("Table not found. Make sure the data is loaded first.");
        }
    };

    // Trigger the Excel download when the button is clicked
    $("#downloadSauceFarmers").click(function () {
        downloadExcel("farmers_data.xlsx","sauce-farmers-table"); // Specify the Excel file name
    });
});
