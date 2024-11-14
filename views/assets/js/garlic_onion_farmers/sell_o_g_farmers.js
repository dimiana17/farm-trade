$(document).ready(function(){
    $("#sellSelectedOGFarmers").click(function() {
        let selectedFarmers = [];
        
        // Collect selected farmers
        $(".select-og-farmer:checked").each(function() {
            selectedFarmers.push($(this).attr("dataa-id"));
        });
    
        if (selectedFarmers.length === 0) {
            alert("No farmers selected!");
            return;
        }
    
        // Show customer form popup
        $(".popup-overlay-o-g-cust").fadeToggle();
        $(".popup-content-o-g-cust").fadeToggle();
                
        // Reset form just in case
        $("#ogCustForm")[0].reset();

        // Ensure previous event handler is removed to prevent multiple bindings
        $("#ogCustForm").off('submit').on('submit', function(e) {
            e.preventDefault();

            // Capture form data
            let customerData = {
                date: new Date(),
                customer_name: $("#cust").val().trim(),
                Financial_commitment: parseFloat($("#fina").val().trim()), // Lowercase 'f'
                ras: parseFloat($("#rasa").val().trim()),
                farmers: selectedFarmers // Match the field name with your schema
            };


            // Validate customer data
            if (!customerData.customer_name) {
                alert('Customer name is required!');
                return;
            }

            // AJAX request to add customer
            $.ajax({
                url: "http://localhost:3000/api/oniongarliccustomers/",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(customerData),
                success: function(response) {
                    // Hide the form and reset it after submission
                    $(".popup-overlay-o-g-cust").fadeToggle();
                    $(".popup-content-o-g-cust").fadeToggle();
                    $("#ogCustForm")[0].reset();

                    // Update each selected farmer to mark them as 'sold'
                    selectedFarmers.forEach(function(farmerId) {
                        console.log('hi')
                        $.ajax({
                            url: `http://localhost:3000/api/oniongarlicfarmers/${farmerId}/sold`,
                            method: 'PUT',
                            contentType: 'application/json',
                            data: JSON.stringify({ sold: 'yes' }),
                            success: function(updateResponse) {
                                if (updateResponse.success) {
                                    // Disable the checkbox for sold farmers
                                    $(`tr[data-id="${farmerId}"] .select-og-farmer`).prop('disabled', true);
                                }
                            },
                            error: function(error) {
                                console.error('Error updating sold status:', error);
                            }
                        });
                    });

                    // Optionally refresh farmers list after selling
                    $("#fetchTodayOnionFarmers").click();
                },
                error: function(xhr) {
                    console.error("Error adding customer:", xhr);
                    alert('An error occurred while adding the customer.');
                }
            });
        });
    });
});
