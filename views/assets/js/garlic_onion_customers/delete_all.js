$(document).ready(function(){
    $("#deleteAllOGCusts").click(function(){
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/api/oniongarliccustomers',
            success: function (response) {
                alert('oniongarliccustomers deleted successfully!');
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });
});