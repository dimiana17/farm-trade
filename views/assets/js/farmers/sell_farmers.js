$(document).ready(function() {
    $("#sellFarmers").click(function() {
        let selectedFarmers = [];

        // Collect selected farmers using the `f-data-id` attribute
        $(".select-farmer:checked").each(function() {
            selectedFarmers.push($(this).attr("f-data-id")); // Use `f-data-id` for farmer selection
        });

        if (selectedFarmers.length === 0) {
            alert("No farmers selected!");
            return;
        }
        // Show customer form popup
        $(".popup-overlay-costomer").fadeToggle();
        $(".popup-content-costomer").fadeToggle();

        // Reset the form just in case
        $("#customerForm")[0].reset();

        // Ensure the form doesn't submit multiple times by removing previous event handlers
        $("#customerForm").off('submit').on('submit', function(e) {
            e.preventDefault();

            // Capture form data
            let customerData = {
                date: new Date(),
                customer_name: $("#customer_name").val().trim(),
                outgoing: parseFloat($("#outgoing").val().trim()), // Capture financial commitment
                farmerId: selectedFarmers // Match farmers field with your schema
            };

            // Debugging output to check captured values

            // Validate customer data
            if (!customerData.customer_name) {
                alert('Customer name is required!');
                return;
            }

            // AJAX request to add customer
            $.ajax({
                url: "http://localhost:3000/api/customers/", // Ensure this matches your backend route
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(customerData),
                success: function(response) {
                    // Hide the form and reset it after submission
                    $(".popup-overlay-costomer").fadeToggle();
                    $(".popup-content-costomer").fadeToggle();
                    $("#customerForm")[0].reset();

                    // Update each selected farmer to mark them as 'sold'
                    selectedFarmers.forEach(function(farmerId) {
                        $.ajax({
                            url: `http://localhost:3000/api/farmers/${farmerId}/sold`, // Use your PUT route to update farmer
                            method: 'PUT',
                            contentType: 'application/json',
                            data: JSON.stringify({ sold: 'yes' }), // Set the farmer as sold
                            success: function(updateResponse) {
                                if (updateResponse.success) {
                                    // Disable the checkbox for sold farmers using `f-data-id`
                                    $(`tr[f-data-id="${farmerId}"] .select-farmer`).prop('disabled', true);
                                    $("#fetchTodayFarmers").click();
                                    $("#fetchTodayCustomers").click();
                                }
                            },
                            error: function(error) {
                                console.error('Error updating sold status:', error);
                            }
                        });
                    });

                    // Optionally refresh farmers list after selling
                    $("#fetchTodayFarmers").click();
                },
                error: function(xhr) {
                    console.error("Error adding customer:", xhr);
                    alert('An error occurred while adding the customer.');
                }
            });
        });
    });
});
