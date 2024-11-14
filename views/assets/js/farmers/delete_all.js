$(document).ready(function(){
    $("#deleteAllFarmers").click(function(){
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/api/farmers',
            success: function (response) {
                alert('Farmers deleted successfully!');
            },
            error: function (error) {
                console.log('Error:', error);
            }
        })
    });
});