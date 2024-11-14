$(document).ready(function () {
    $("#sellSelectedFarmers").click(function () {
        let selectedFarmers = [];

        // Collect selected farmers
        $(".select-sauce-farmer:checked").each(function () {
            selectedFarmers.push($(this).attr("data-id"));
        });

        if (selectedFarmers.length === 0) {
            alert("No farmers selected!");
            return;
        }

        // Show customer form popup
        $(".popup-overlay-sauce-customers").fadeToggle();
        $(".popup-content-sauce-customers").fadeToggle();

        // Declare the customer name field
        let customerNameField = $("#sauce_customer_name");
        
        // Check customer name field existence
        if (customerNameField.length === 0) {
            console.error("Customer Name field does not exist in the DOM");
        } else {
            console.log("Customer Name Field (before reset): ", customerNameField.val());
        }

        // Reset form just in case
        $("#sauceCustomerForm")[0].reset();

        // Ensure previous event handler is removed to prevent multiple bindings
        $("#sauceCustomerForm").off('submit').on('submit', function (e) {
            e.preventDefault();

            // Capture form data
            let customerData = {
                date: new Date(),
                customer_name: customerNameField.val().trim(),
                Financial_commitment: parseFloat($("#sauce_Financial_commitment").val().trim()),
                ras: parseFloat($("#sauce_ras").val().trim()),
                farmers: selectedFarmers // Match the field name with your schema
            };


            // Validate customer data
            if (!customerData.customer_name) {
                alert('Customer name is required!');
                return;
            }

            // AJAX request to add customer
            $.ajax({
                url: "http://localhost:3000/api/saucecustomers/",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(customerData),
                success: function (response) {
                    console.log('Customer added successfully:', response);
                    // Hide the form and reset it after submission
                    $(".popup-overlay-sauce-customers").fadeToggle();
                    $(".popup-content-sauce-customers").fadeToggle();
                    $("#sauceCustomerForm")[0].reset();

                    // Update each selected farmer to mark them as 'sold'
                    selectedFarmers.forEach(function (farmerId) {
                        $.ajax({
                            url: `http://localhost:3000/api/saucefarmers/${farmerId}/sold`,
                            method: 'PUT',
                            contentType: 'application/json',
                            data: JSON.stringify({ sold: 'yes' }),
                            success: function (updateResponse) {
                                if (updateResponse.success) {
                                    // Disable the checkbox for sold farmers
                                    $(`tr[data-id="${farmerId}"] .select-sauce-farmer`).prop('disabled', true);
                                }
                            },
                            error: function (error) {
                                console.error('Error updating sold status:', error);
                            }
                        });
                    });

                    // Optionally refresh farmers list after selling
                },
                error: function (xhr) {
                    console.error("Error adding customer:", xhr);
                    alert('An error occurred while adding the customer.');
                }
            });
        });
    });
});
