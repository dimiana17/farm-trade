$("#OGtoggleCommission").click(function() {
    $("#OGcommission").fadeToggle(); // Use fadeToggle for smooth transition
});
$(document).ready(function() {
    $('#OGcalculateSum').click(function() {
        console.log('clicked')
        const startDate = $('#OGstartDate').val();
        const endDate = $('#OGendDate').val();

        if (!startDate || !endDate) {
            $('#OGcommissionSumOutput').text("Please select both start and end dates.");
            return;
        }
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Add one day
        const adjustedEndDate = endDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        // Debug: Log the dates to ensure they are correct

        $.ajax({
            url: `http://localhost:3000/api/oniongarlicfarmers/commission-sum?startDate=${startDate}&endDate=${adjustedEndDate}`,
            method: 'GET',
            success: function(response) {
                // Check if the response has the correct data
                if (response && response.totalCommission !== undefined) {
                    $('#OGcommissionSumOutput').text(`Total Commission: ${response.totalCommission}`);
                } else {
                    $('#OGcommissionSumOutput').text("No commission data available for the specified period.");
                }
            },
            error: function(error) {
                console.error("Error occurred:", error); // Debug log
                $('#OGcommissionSumOutput').text("An error occurred. Please try again.");
            }
        });
    });
});