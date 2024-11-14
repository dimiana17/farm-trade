$(document).ready(function () {
    // Show the popup for adding a finance record
    $("#add").click(function () {
        $(".popup-overlay-finance").fadeToggle();  // Show overlay
        $(".popup-content-finance").fadeToggle();  // Show form
    });

    // Hide the form when clicking outside the form (on overlay)
    $(".popup-overlay-finance").click(function () {
        $(".popup-overlay-finance").fadeToggle();  // Hide overlay
        $(".popup-content-finance").fadeToggle();  // Hide form
    });

    // Function to handle form submission for both import and Expenses
    function handleFinanceSubmission(type) {
        // Capture form data
        let financeData = {
            cash: $("#f-cash").val(),
            statement: $("#statement").val(),
            date: new Date() // Add the current date
        };

        let url = type === "import" 
            ? "http://localhost:3000/api/finances/imports" 
            : "http://localhost:3000/api/finances/Expensess";

        // Send the form data via AJAX
        $.ajax({
            url: url,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(financeData),
            success: function (response) {
                alert(type === "import" ? 'Import added successfully!' : 'Expenses added successfully!');
                // Refresh today's data and hide the form after submission
                $("#today").click();
                $(".popup-overlay-finance").fadeToggle();
                $(".popup-content-finance").fadeToggle();
                $("#FinanceForm")[0].reset(); // Clear the form
            },
            error: function (error) {
                console.error(`Error adding ${type}:`, error);
            }
        });
    }

    // Handle import submission
    $("#import").click(function () {
        handleFinanceSubmission("import");
    });

    // Handle Expenses submission
    $("#Expenses").click(function () {
        handleFinanceSubmission("Expenses");
    });

    // Hide the form when clicking outside the overlay
    $(".popup-overlay-finance").click(function () {
        $(".popup-content-finance").fadeToggle(); // Hide the popup
        $(".popup-overlay-finance").fadeToggle(); // Hide the overlay (fixed typo here)
    });
});
