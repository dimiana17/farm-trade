$(document).ready(function(){
    $("#deleteAllOGFarmers").click(function(){
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/api/oniongarlicfarmers',
            success: function (response) {
                alert('onion garlic farmers deleted successfully!');
                $("#fetchFarmers").click(); // Refresh the farmer list
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });
});