$(document).ready(function(){
    $("#deleteAllSauceCusts").click(function(){
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/api/saucecustomers',
            success: function (response) {
                alert('sauce customers deleted successfully!');
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });
});