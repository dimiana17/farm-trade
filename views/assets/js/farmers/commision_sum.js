$("#toggleCommission").click(function() {
    $("#commission").fadeToggle(); // Use fadeToggle for smooth transition
});
$(document).ready(function() {
    $('#calculateSum').click(function() {
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();

        if (!startDate || !endDate) {
            $('#commissionSumOutput').text("Please select both start and end dates.");
            return;
        }
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Add one day
        const adjustedEndDate = endDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        // Debug: Log the dates to ensure they are correct
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

        $.ajax({
            url: `http://localhost:3000/api/farmers/commission-sum?startDate=${startDate}&endDate=${adjustedEndDate}`,
            method: 'GET',
            success: function(response) {
                // Check if the response has the correct data
                if (response && response.totalCommission !== undefined) {
                    $('#commissionSumOutput').text(`Total Commission: ${response.totalCommission}`);
                } else {
                    $('#commissionSumOutput').text("No commission data available for the specified period.");
                }
                console.log("Response:", response); // Debug log
            },
            error: function(error) {
                console.error("Error occurred:", error); // Debug log
                $('#commissionSumOutput').text("An error occurred. Please try again.");
            }
        });
    });
});