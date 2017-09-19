$(document).ready(function() {
    $('.clickable-tr').on('click', function(){
        var myLink = $(this).attr('href');
        window.location.href = myLink;
    });
});
