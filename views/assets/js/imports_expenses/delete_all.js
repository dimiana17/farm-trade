$(document).ready(function() {
    $("#deleteAllFinances").click(function() {
        console.log('clicked');
        
        // Confirmation prompt before deleting
        if (confirm("Are you sure you want to delete all finance records? This action cannot be undone.")) {
            $.ajax({
                method: 'DELETE',
                url: 'http://localhost:3000/api/finances/',
                success: function(response) {
                    alert('Finances deleted successfully!');
                    $("#all").click(); // Refresh the finances list
                },
                error: function(error) {
                    console.log('Error:', error);
                }
            });
        }
    });
});
