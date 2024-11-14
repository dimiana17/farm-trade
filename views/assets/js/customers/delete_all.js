$(document).ready(function(){
    $("#deleteAllCusts").click(function(){
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/api/customers',
            success: function (response) {
                alert('customers deleted successfully!');
            },
            error: function (error) {
                console.log('Error:', error);
            }
        })
    });
});