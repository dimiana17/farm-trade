$(document).ready(function(){
    $("#deleteAllSauceFarmers").click(function(){
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:3000/api/saucefarmers',
            success: function (response) {
                alert('sauce farmers deleted successfully!');
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });
});