$(document).ready(function() {
    // Show the form to add a sauce farmer
    $("#addOGFarmer").click(function() {
        $(".popup-overlay-o-g-farmer").fadeToggle();  // Show overlay
        $(".popup-content-o-g-farmer").fadeToggle();  // Show form
    });
  
    // Hide the form when clicking outside the form (on overlay)
    $(".popup-overlay-o-g-farmer").click(function() {
        $(".popup-overlay-o-g-farmer").fadeToggle();  // Hide overlay
        $(".popup-content-o-g-farmer").fadeToggle();  // Hide form
    });
  
    // Handle form submission
    $("#ogFarmerForm").submit(function(e) {

        e.preventDefault(); // Prevent default form submission
  
        let O_G_commission_percentage = parseFloat($("#O_G_commission_percentage").val());
        let price = parseFloat($("#pri").val());
        let outstanding_amount = parseFloat($("#out").val());
        let nolon = parseFloat($("#nol").val());
        let advance = parseFloat($("#adv").val());


        let net_amount = 0.95 * outstanding_amount;
        let cash = net_amount * price;
        let commission = parseFloat((cash * (O_G_commission_percentage / 100)).toFixed(2));
        let deserved_cash = parseFloat((cash - commission - nolon - advance - 15).toFixed(2));
        // Capture form data
        let farmerData = {
            date: new Date(), // Use current date
            farmer_name: $("#far").val(), // Get the value of farmer name
            price,
            outstanding_amount,
            nolon,
            advance,
            net_amount,
            cash,
            commission,
            deserved_cash, // Ensure it's a number
             // Get the nolon as a number // Get the advance as a number
            sold: "no" // Initialize sold status as 'no'
        };
  
        // Log the farmer data for debugging
        
        // Check for NaN values and alert the user
        if (isNaN(farmerData.outstanding_amount) || isNaN(farmerData.price) || 
            isNaN(farmerData.nolon) || isNaN(farmerData.advance)) {
            alert("Please make sure all numeric fields are filled in correctly.");
            return;
        }
  
        // Send the form data via AJAX
        $.ajax({
            url: "http://localhost:3000/api/oniongarlicfarmers/",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(farmerData),
            success: function(response) {
                alert('Farmer added successfully!');
                $("#fetchTodayOnionFarmers").click();
                // Hide the form after submission
                $(".popup-overlay-o-g-farmer").fadeToggle();
                $(".popup-content-o-g-farmer").fadeToggle();
                $("#ogFarmerForm")[0].reset(); // Clear the form
            },
            error: function(error) {
                console.error("Error adding farmer:", error.responseText); // Show detailed error
            }
        });
    });
});
