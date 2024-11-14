$(document).ready(function() {
  // Show the form to add a sauce farmer
  $("#addSauceFarmer").click(function() {
      $(".popup-overlay-sauce-farmer").fadeToggle();  // Show overlay
      $(".popup-content-sauce-farmer").fadeToggle();  // Show form
  });

  // Hide the form when clicking outside the form (on overlay)
  $(".popup-overlay-sauce-farmer").click(function() {
      $(".popup-overlay-sauce-farmer").fadeToggle();  // Hide overlay
      $(".popup-content-sauce-farmer").fadeToggle();  // Hide form
  });

  // Handle form submission
  $("#sauceFarmerForm").submit(function(e) {
      e.preventDefault(); // Prevent default form submission

      let S_commission_percentage = parseFloat($("#S_commission_percentage").val());
        let price = parseFloat($("#sauce_price").val());
        let outstanding_amount = parseFloat($("#outstandingamount").val());
        let nolon = parseFloat($("#nolon").val());
        let advance = parseFloat($("#advance").val());


        let net_amount = 0.95 * outstanding_amount;
        let cash = net_amount * price;
        let commission = parseFloat((cash * (S_commission_percentage / 100)).toFixed(2));
        let deserved_cash = parseFloat((cash - commission - nolon - advance - 15).toFixed(2));
        
      // Capture form data
      let farmerData = {
          date: new Date(), // Use current date
          farmer_name: $("#sauce_farmer_name").val(), // Get the value of farmer name
          outstanding_amount, // Ensure it's a number
          price, // Get the price as a number
          nolon, // Get the nolon as a number
          advance,
          commission,
          deserved_cash, // Get the advance as a number
          sold: "no" // Initialize sold status as 'no'
      };

      // Log the farmer data for debugging
      
      // Check for NaN values and alert the user
      if (isNaN(farmerData.outstanding_amount) || isNaN(farmerData.price)|| 
          isNaN(farmerData.nolon) || isNaN(farmerData.advance)) {
          alert("Please make sure all numeric fields are filled in correctly.");
          return;
      }

      // Send the form data via AJAX
      $.ajax({
          url: "http://localhost:3000/api/saucefarmers/",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(farmerData),
          success: function(response) {
              alert('Farmer added successfully!');
              // Hide the form after submission
              $(".popup-overlay-sauce-farmer").fadeToggle();
              $(".popup-content-sauce-farmer").fadeToggle();
              $("#sauceFarmerForm")[0].reset(); // Clear the form
              $("#fetchTodaySauceFarmers").click();
          },
          error: function(error) {
              console.error("Error adding farmer:", error.responseText); // Show detailed error
          }
      });
  });
});
