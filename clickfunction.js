$(document).ready(function() {
    $('.clickable-tr').on('click', function(){
        var myLink = $(this).attr('href');
        if(myLink){
            window.location.href = myLink;
            console.log("click");
        }
    });
});
