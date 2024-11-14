$(document).ready(function() {
    // Show the popup form
    $("#insertFarmer").click(function() {
        $(".popup-overlay").fadeToggle();  // Show overlay
        $(".popup-content").fadeToggle();  // Show form
    });

    // Hide the form when clicking outside the form (on overlay)
    $(".popup-overlay").click(function() {
        $(".popup-overlay").fadeToggle();  // Hide overlay
        $(".popup-content").fadeToggle();  // Hide form
    });

    // Handle form submission
    $("#farmerForm").submit(function(e) {
        e.preventDefault(); // Prevent default form submission

        // Get values and parse them as floats
        let commission_percentage = parseFloat($("#commission_percentage").val());
        let price = parseFloat($("#price").val());
        let outstanding_amount = parseFloat($("#outstanding_amount").val());
        let commodity_number = parseFloat($("#commodity_number").val());

        // Validate numeric inputs
        if (isNaN(commission_percentage) || isNaN(price) || isNaN(outstanding_amount) || isNaN(commodity_number)) {
            alert("Please enter valid numeric values for all fields.");
            return;
        }

        // Calculate net_amount
        let net_amount = outstanding_amount - (0.5 * commodity_number);

        // Calculate cash
        let cash = net_amount * price;

        // Calculate commission
        let commission = parseFloat((cash * (commission_percentage / 100)).toFixed(2));

        // Calculate deserved_cash
        let deserved_cash = parseFloat((cash - commission - 15).toFixed(2));

        // Prepare form data to send
        let farmerData = {
            farmer_name: $("#farmer_name").val(),
            commodity_name: $("#commodity_name").val(),
            outstanding_amount: outstanding_amount,
            commodity_number: commodity_number,
            price: price,
            commission: commission,
            cash: cash,
            deserved_cash: deserved_cash,
            net_amount: net_amount, // Include net_amount in data
            date: new Date().toISOString() // Current date in ISO format
        };

        // Send data via AJAX
        $.ajax({
            url: "http://localhost:3000/api/farmers",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(farmerData),
            success: function(response) {
                alert('Farmer added successfully!');
                $("#fetchTodayFarmers").click();
                $(".popup-overlay").fadeOut();
                $(".popup-content").fadeOut();
                $("#farmerForm")[0].reset(); // Reset form after submission
            },
            error: function(error) {
                console.error("Error adding farmer:", error);
                alert("Failed to add farmer. Please try again.");
            }
        });
    });
});
