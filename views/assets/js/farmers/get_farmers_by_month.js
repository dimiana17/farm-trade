// $(document).ready(function() {
//     function formatDate(dateString) {
//         const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//         const date = new Date(dateString);
//         return date.toLocaleDateString(undefined, options);
//     }
//     // Fetch distinct dates from the API
//     $(document).ready(function() {
//       // Fetch distinct dates from the API
//       $.ajax({
//         url: 'http://localhost:3000/api/farmers/distinct-dates',
//         method: 'GET',
//         success: function(data) {
//           // Populate the drop-down list
//           data.forEach(function(date) {
//             const option = $('<option></option>')
//               .attr('value', `${date.year}-${date.month}`) // Set value as year-month
//               .text(`Year: ${date.year}, Month: ${date.month}`); // Display format

//             $('#farmersDates').append(option); // Append option to the select element
//           });
//         },
//         error: function(jqXHR, textStatus, errorThrown) {
//           console.error('Error fetching dates:', textStatus, errorThrown);
//         }
//       });

//       // Event listener for when the selected date changes
//       $('#farmersDates').on('change', function() {
//         const selectedValue = $(this).val(); // Get selected value (year-month)

//         if (selectedValue) {
//           const [year, month] = selectedValue.split('-'); // Split into year and month
          
//           // Fetch data for the selected month
//           $.ajax({
//             url: `http://localhost:3000/api/farmers/month?year=${year}&month=${month}`, // Replace with your API endpoint
//             method: 'GET',
//             success: function(data) {
//                 $(".table_data").empty();
//                 let table = `
//                     <table id="farmers-table" border="1" cellpadding="10" cellspacing="0" class="info-table">
//                         <thead>
//                             <tr>
//                                 <th>Select</th>
//                                 <th>التاريخ</th>
//                                 <th>اسم الفلاح</th>
//                                 <th>السلعة</th>
//                                 <th>الوزن القائم</th>
//                                 <th>العدد</th>
//                                 <th>الصافي</th>
//                                 <th>السعر</th>
//                                 <th>المبلغ</th>
//                                 <th>العمولة</th>
//                                 <th>المبلغ المستحق</th>
//                                 <th>تم بيعه</th>
//                                 <th colspan="2" style="text-align: center;">عمليات</th>
//                             </tr>
//                         </thead>
//                         <tbody class="farmer-table-body">
//                         </tbody>
//                     </table>
//                 `;

//                 $(".table_data").append(table);

//                 data.forEach(function(farmer) {
//                     let sellButtonDisabled = farmer.sold === 'yes' ? 'disabled' : '';
//                     let formattedDate = formatDate(farmer.date);
//                     let checkboxDisabled = farmer.sold === 'yes' ? 'disabled' : '';

//                     $(".farmer-table-body").append(`
//                         <tr data-id="${farmer._id}">
//                             <td><input type="checkbox" class="select-farmer" f-data-id="${farmer._id}" ${checkboxDisabled}></td>
//                             <td>${formattedDate}</td>
//                             <td>${farmer.farmer_name}</td>
//                             <td>${farmer.commodity_name}</td>
//                             <td>${farmer.outstanding_amount}</td>
//                             <td>${farmer.commodity_number}</td>
//                             <td>${farmer.net_amount}</td>
//                             <td>${farmer.price}</td>
//                             <td>${farmer.cash}</td>
//                             <td>${farmer.commission}</td>
//                             <td>${farmer.deserved_cash}</td>
//                             <td>${farmer.sold}</td>
//                             <td><button class="edit-btn">تعديل</button></td>
//                             <td><button class="delete-btn">مسح</button></td>
//                         </tr>
//                     `);
//                 });

//                 // Edit farmer
//                 $(".edit-btn").click(function () {
//                     const farmerId = $(this).closest("tr").attr("data-id");
//                     editFarmer(farmerId);
//                 });
    
//                 $(".delete-btn").click(function () {
//                     const farmerId = $(this).closest("tr").attr("data-id");
//                     deleteFarmer(farmerId);
//                 });
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//               console.error('Error fetching customer data:', textStatus, errorThrown);
//             }
//           });
//         } else {
//           $('#resultsContainer').empty(); // Clear results if no selection
//         }
//       });
//     });
//     function deleteFarmer(farmerId) {
//         if (confirm("Are you sure you want to delete this farmer?")) {
//             $.ajax({
//                 method: 'DELETE',
//                 url: `http://localhost:3000/api/farmers/${farmerId}`,
//                 success: function (response) {
//                     alert('Farmer deleted successfully!');
//                     $("#fetchFarmers").click(); // Refresh the farmer list
//                 },
//                 error: function (error) {
//                     console.log('Error:', error);
//                 }
//             });
//         }
//     }

//     // Function to handle farmer edit
//     function editFarmer(farmerId) {
//         $.ajax({
//             method: 'GET',
//             url: `http://localhost:3000/api/farmers/${farmerId}`,
//             success: function (farmer) {
//                 // Populate the edit form with the farmer's data
//                 $("#farmer_name_edit").val(farmer.farmer_name);
//                 $("#commodity_name_edit").val(farmer.commodity_name);
//                 $("#outstanding_amount_edit").val(farmer.outstanding_amount);
//                 $("#commodity_number_edit").val(farmer.commodity_number);
//                 $("#net_amount_edit").val(farmer.net_amount);
//                 $("#price_edit").val(farmer.price);
//                 $("#cash_edit").val(farmer.cash);
//                 $("#commission_edit").val(farmer.commission);
//                 $("#deserved_cash_edit").val(farmer.deserved_cash);
//                 $(".popup-overlay-edit").fadeToggle();
//                 $(".popup-content-edit").fadeToggle();
    
//                 // Handle form submission for updating the farmer's data
//                 $("#farmerFormEdit").off("submit").on("submit", function (e) {
//                     e.preventDefault();
//                     let updatedFarmerData = {
//                         farmer_name: $("#farmer_name_edit").val(),
//                         commodity_name: $("#commodity_name_edit").val(),
//                         outstanding_amount: $("#outstanding_amount_edit").val(),
//                         commodity_number: $("#commodity_number_edit").val(),
//                         net_amount: $("#net_amount_edit").val(),
//                         price: $("#price_edit").val(),
//                         cash: $("#cash_edit").val(),
//                         commission: $("#commission_edit").val(),
//                         deserved_cash: $("#deserved_cash_edit").val()
//                     };
    
//                     // AJAX request to update the farmer data
//                     $.ajax({
//                         method: 'PATCH',
//                         url: `http://localhost:3000/api/farmers/${farmerId}`,
//                         contentType: "application/json",
//                         data: JSON.stringify(updatedFarmerData),
//                         success: function (response) {
//                             alert('Farmer updated successfully!');
//                             $(".popup-overlay-edit").fadeToggle();
//                             $(".popup-content-edit").fadeToggle();
//                             $("#farmerFormEdit")[0].reset(); // Reset the form after update
//                             fetchFarmersForToday(); // Refresh the farmer list after update
//                         },
//                         error: function (error) {
//                             console.log('Error updating farmer:', error);
//                         }
//                     });
//                 });
    
//                 // Function to calculate net amount
//                 function calculateNetAmount() {
//                     const outstandingAmount = parseFloat($('#outstanding_amount_edit').val()) || 0;
//                     const commodityNumber = parseFloat($('#commodity_number_edit').val()) || 0;
//                     const netValue = outstandingAmount - (0.5 * commodityNumber);
//                     $('#net_amount_edit').val(netValue.toFixed(2));
//                     calculateCash(); // Trigger cash calculation when net amount changes
//                 }
    
//                 // Function to calculate cash
//                 function calculateCash() {
//                     const netAmount = parseFloat($('#net_amount_edit').val()) || 0;
//                     const price = parseFloat($('#price_edit').val()) || 0;
//                     const cash = netAmount * price;
//                     $('#cash_edit').val(cash.toFixed(2));
//                     calculateCommission(); // Trigger commission calculation when cash changes
//                 }
    
//                 // Function to calculate commission
//                 function calculateCommission() {
//                     const cash = parseFloat($('#cash_edit').val()) || 0;
//                     const commission = cash * 0.05;
//                     $('#commission_edit').val(commission.toFixed(2));
//                     calculateDeservedCash(); // Trigger deserved cash calculation when commission changes
//                 }
    
//                 // Function to calculate deserved cash
//                 function calculateDeservedCash() {
//                     const cash = parseFloat($('#cash_edit').val()) || 0;
//                     const commission = parseFloat($('#commission_edit').val()) || 0;
//                     const deservedCash = cash - (commission + 15);
//                     $('#deserved_cash_edit').val(deservedCash.toFixed(2));
//                 }
    
//                 // Trigger calculations on input changes
//                 $('#outstanding_amount_edit, #commodity_number_edit').on('input', calculateNetAmount);
//                 $('#net_amount_edit, #price_edit').on('input', calculateCash);
//                 $('#cash_edit').on('input', calculateCommission);
//                 $('#commission_edit').on('input', calculateDeservedCash);
//             },
//             error: function (error) {
//                 console.log('Error fetching farmer data:', error);
//             }
//         });
//     }
    

//     // Download Excel functionality
//     function downloadExcel(filename) {
//         const wb = XLSX.utils.book_new(); // Create a new workbook
//         const ws = XLSX.utils.table_to_sheet(document.getElementById("farmers-table")); // Convert table to sheet

//         // Append the sheet to the workbook
//         XLSX.utils.book_append_sheet(wb, ws, "Farmers Data");

//         // Write the workbook and trigger the download
//         XLSX.writeFile(wb, filename);
//     }

//     // Trigger the Excel download when the button is clicked
//     $("#downloadFarmers").click(function () {
//         downloadExcel("farmers_data.xlsx"); // Specify the Excel file name
//     });

//   });