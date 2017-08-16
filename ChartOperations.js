$(document).ready(function() { 
    
//    $('div#nav').hide();
//    $('#toggleNav').click(function(){
//        $('div#nav').slideToggle("slow");
//    });
//
//    $('div#Data').hide();
//    $('button.toggleData').click(function() {
//        $('div#Data').toggle();
//    });
//alert('msg1');

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawPieChart);

    function drawPieChart() {
//    alert('msg2');
        var NumberOfSCRs = 1000;
        var NumberOfSCRsWithoutPlatformTC = 1500;
        var CoverageOfSCRs = 500;
    
        var data = google.visualization.arrayToDataTable([
            ['Method', 'Qty'],
            ['SCRs', NumberOfSCRs],
            ['TC', NumberOfSCRsWithoutPlatformTC],
            ['Coverage', CoverageOfSCRs]
        ]);
        
        var options = {
            title: 'Coverage'
        };
    
        var chart = new google.visualization.PieChart(document.getElementById('PieChart1'));
        chart.draw(data, options);
    }
    drawPieChart();

//    $( "select" ).change( displayVals );
//    displayVals();
});