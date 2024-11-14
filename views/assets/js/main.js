$(document).ready(function() {
  $(".nav-link").click(function(event) {
      event.preventDefault();
      const page = $(this).data("page");
      $(".container").removeClass("active");
      $("#" + page).addClass("active");
  });
});