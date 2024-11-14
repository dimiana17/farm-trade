$(document).ready(function () {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // SEARCH A CUSTOMER BY NAME AND/OR DATE
    $("#searchOGFarmers").click(function () {
        
        let farmerName = $("#OGFarmerName").val().trim();
        let farmerDate = $("#OGFarmerDate").val();
    
        // Prepare the query parameters
        let queryParams = {};
        if (farmerName) {
            queryParams.name = farmerName;
        }
        if (farmerDate) {
            queryParams.date = farmerDate;
        }
    
        // Construct query string
        const queryString = $.param(queryParams);
        
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/oniongarlicfarmers/search?${queryString}`,
            success: function(data) {
                $(".onion-garlic-table_data").empty();
                let table = `
                    <table border="1" cellpadding="10" cellspacing="0" class="info-table" id="ogFarmers">
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
                                <th colspan="2" style="text-align: center;">عمليات</th>
                            </tr>
                        </thead>
                        <tbody class="onion-garlic-table-body">
                        </tbody>
                    </table>
                `;

                $(".onion-garlic-table_data").append(table);

                data.forEach(function(OnionGarlicFarmer) {
                    let sellButtonDisabled = OnionGarlicFarmer.sold === 'yes' ? 'disabled' : '';
                    let formattedDate = formatDate(OnionGarlicFarmer.date);
                    let checkboxDisabled = OnionGarlicFarmer.sold === 'yes' ? 'disabled' : '';

                    $(".onion-garlic-table-body").append(`
                        <tr data-id="${OnionGarlicFarmer._id}">
                            <td><input type="checkbox" class="select-og-farmer" dataa-id="${OnionGarlicFarmer._id}" ${checkboxDisabled}></td>
                            <td>${formattedDate}</td>
                            <td>${OnionGarlicFarmer.farmer_name}</td>
                            <td>${OnionGarlicFarmer.outstanding_amount}</td>
                            <td>${OnionGarlicFarmer.net_amount}</td>
                            <td>${OnionGarlicFarmer.price}</td>
                            <td>${OnionGarlicFarmer.commission}</td>
                            <td>${OnionGarlicFarmer.nolon}</td>
                            <td>${OnionGarlicFarmer.advance}</td>
                            <td>${OnionGarlicFarmer.cash}</td>
                            <td>${OnionGarlicFarmer.deserved_cash}</td>
                            <td>${OnionGarlicFarmer.sold}</td>
                            <td><button class="edit-og-farmer-btn">تعديل</button></td>
                            <td><button class="delete-og-farmer-btn">مسح</button></td>
                            <td><button class="og-bill-farmer-btn">فاتورة</button></td>

                        </tr>
                    `);
                });

                // Edit farmer
                $(".edit-og-farmer-btn").off("click").on("click", function() {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    editFarmer(farmerId);
                });

                // Delete farmer
                $(".delete-og-farmer-btn").off("click").on("click", function() {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    deleteFarmer(farmerId);
                });
                $(".og-bill-farmer-btn").click(function () {
                    const farmerId = $(this).closest("tr").attr("data-id");
                    generateBill(farmerId);
                });
                // Download data as CSV
                $("#downloadOGFarmers").off("click").on("click", function() {
                    let csvContent = "data:text/csv;charset=utf-8,"; // CSV file format

                    // Add table headers
                    csvContent += "التاريخ,اسم الفلاح,الوزن القائم,الوزن الصافي,السعر,العمولة,نولون,سلفة,المبلغ,المبلغ المستحق,تم بيعه\r\n";

                    // Get table rows and add to CSV content
                    $(".onion-garlic-table-body tr").each(function() {
                        let rowData = $(this).find('td').map(function() {
                            return $(this).text();
                        }).get().join(","); // Join data with comma
                        csvContent += rowData + "\r\n"; // New line for each row
                    });

                    // Create a download link
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "onion_farmers_data.csv");
                    document.body.appendChild(link);
                    link.click(); // Trigger download
                    document.body.removeChild(link); // Remove link after download
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
            url: `http://localhost:3000/api/oniongarlicfarmers/${farmerId}`,
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
                $("#og-bill-content").html(billContent);
                $(".og-popup-overlay-bill").fadeIn();
    
                // Attach event for saving the bill as an image
                $("#og-save-bill-btn").off('click').on('click', function () {
                    saveBillAsImage();
                });
    
                // Attach close event for the modal
                $(".og-close-btn-bill").off('click').on('click', function () {
                    closeBillModal();
                });
    
                // Click outside modal to close
                $(document).off('click').on('click', function (event) {
                    if (!$(event.target).closest('.og-popup-content-bill').length && !$(event.target).hasClass('bill-farmer-btn')) {
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
        $(".og-popup-overlay-bill").fadeOut();
        $(document).off('click');
    };
    
    

function saveBillAsImage() {
    // Select the bill content area to capture
    html2canvas(document.querySelector("#og-bill-content")).then(canvas => {
        // Convert the canvas to an image
        let imgData = canvas.toDataURL("image/png");
        
        // Create a temporary link element to download the image
        let link = document.createElement("a");
        link.href = imgData;
        link.download = "bill.png"; // Filename for the downloaded image
        link.click();
    });
};

    // Delete farmer
    function deleteFarmer(farmerId) {
        if (confirm("Are you sure you want to delete this farmer?")) {
            $.ajax({
                method: 'DELETE',
                url: `http://localhost:3000/api/oniongarlicfarmers/${farmerId}`,
                success: function(response) {
                    alert('Farmer deleted successfully!');
                    $("#fetchOnionFarmers").click(); // Refresh farmer list
                },
                error: function(error) {
                    console.log('Error:', error);
                }
            });
        };
    };

    // Edit farmer
    function editFarmer(farmerId) {
        // Fetch the farmer's existing data
        $.ajax({
            method: 'GET',
            url: `http://localhost:3000/api/oniongarlicfarmers/${farmerId}`,
            success: function(farmer) {
                // Populate the form with the farmer's existing data
                $("#oGFarmerName").val(farmer.farmer_name);
                $("#oGOutstandingAmount").val(farmer.outstanding_amount);
                $("#oGNetAmount").val(farmer.net_amount); // New field for net amount
                $("#oGPrice").val(farmer.price);
                $("#oGCommission").val(farmer.commission);
                $("#oGNolon").val(farmer.nolon);
                $("#oGAdvance").val(farmer.advance);
                $("#oGCash").val(farmer.cash); // New field for cash
                $("#oGDeservedCash").val(farmer.deserved_cash); // New field for deserved cash
    
                // Show the popup form for editing the farmer
                $(".popup-overlay-o-g-farmer-edit").fadeToggle();
                $(".popup-content-o-g-farmer-edit").fadeToggle();
    
                // Function to update the calculated fields
                function updateCalculatedFields() {
                    const outstandingAmount = parseFloat($("#oGOutstandingAmount").val()) || 0;
                    const price = parseFloat($("#oGPrice").val()) || 0;
                    const nolon = parseFloat($("#oGNolon").val()) || 0;
                    const advance = parseFloat($("#oGAdvance").val()) || 0;
    
                    // Calculations
                    const netAmount = outstandingAmount * 0.95; // net_amount = outstanding_amount * 95%
                    const cash = netAmount * price;
                    const commission =  cash * .05;// cash = net_amount * price
                    const deservedCash = cash - (commission + nolon + advance +15); // deserved_cash = cash - (commission + nolon + advance)
    
                    // Update the input fields with the calculated values
                    $("#oGNetAmount").val(netAmount.toFixed(2));
                    $("#oGCash").val(cash.toFixed(2));
                    $("#oGDeservedCash").val(deservedCash.toFixed(2));
                }
    
                // Attach input event listeners to fields that affect calculations
                $("#oGOutstandingAmount, #oGPrice, #oGCommission, #oGNolon, #oGAdvance").on("input", function() {
                    updateCalculatedFields();
                });
    
                // Initially calculate values when the form is loaded
                updateCalculatedFields();
    
                // Handle the form submission for editing the farmer
                $("#ogFarmerFormEdit").off("submit").on("submit", function(e) {
                    e.preventDefault();
    
                    // Capture the updated farmer data
                    let updatedFarmerData = {
                        farmer_name: $("#oGFarmerName").val().trim(),
                        outstanding_amount: parseFloat($("#oGOutstandingAmount").val().trim()),
                        net_amount: parseFloat($("#oGNetAmount").val().trim()),
                        price: parseFloat($("#oGPrice").val().trim()),
                        commission: parseFloat($("#oGCommission").val().trim()),
                        nolon: parseFloat($("#oGNolon").val().trim()),
                        advance: parseFloat($("#oGAdvance").val().trim()),
                        cash: parseFloat($("#oGCash").val().trim()),
                        deserved_cash: parseFloat($("#oGDeservedCash").val().trim())
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
                        url: `http://localhost:3000/api/oniongarlicfarmers/${farmerId}`,
                        contentType: "application/json",
                        data: JSON.stringify(updatedFarmerData),
                        success: function(response) {
                            alert('Farmer updated successfully!');
                            $(".popup-overlay-o-g-farmer-edit").fadeToggle();
                            $(".popup-content-o-g-farmer-edit").fadeToggle();
                            $("#ogFarmerFormEdit")[0].reset();
                            $("#fetchTodayOnionFarmers").click();
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
    }
    function downloadExcel(filename) {
        const table = document.getElementById("ogFarmers");
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
    $("#downloadOGFarmers").click(function () {
        downloadExcel("farmers_data.xlsx","ogFarmers"); // Specify the Excel file name
    });
});
