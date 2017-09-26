$(document).ready(function() {
    main();

});

// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(){
    var ReqStateSum = {all:0, accepted:0, acceptedwithrestrictions:0, acceptedna:0, na:0, notaccepted:0, open:0, reconciliation:0, empty:0};
    var ReqStateCustomerSum = {all:0, Ratingopen:0, Ratingaccepted:0, Ratingnotaccepted:0, empty:0};
    var hasLink = 0;


    function handleReqState(ReqState, ReqStateCustomer){
    //accepted, accepted with restrictions, accepted n/a, n/a, not accepted, open, reconciliation
        trimedReqState = ReqState.trim();
        switch (trimedReqState)
        {
            case 'accepted':
                ReqStateSum.accepted++;
                ReqStateSum.all++;
            break;
            case 'accepted with restrictions':
                ReqStateSum.acceptedwithrestrictions++;
                ReqStateSum.all++;
                handleReqStateCustomer(ReqStateCustomer);
            break;
            case 'accepted n/a':
                ReqStateSum.acceptedna++;
                ReqStateSum.all++;
            break;
            case 'n/a':
                ReqStateSum.na++;
                ReqStateSum.all++;
                handleReqStateCustomer(ReqStateCustomer);
            break;
            case 'not accepted':
                ReqStateSum.notaccepted++;
                ReqStateSum.all++;
                handleReqStateCustomer(ReqStateCustomer);
            break;
            case 'open':
                ReqStateSum.open++;
                ReqStateSum.all++;
            break;
            case 'reconciliation':
                ReqStateSum.reconciliation++;
                ReqStateSum.all++;
                handleReqStateCustomer(ReqStateCustomer);
            break;
            case '':
                ReqStateSum.empty++;
                ReqStateSum.all++;
            break;
            default:
            break;
        }
    }

    function handleReqStateCustomer(ReqStateCustomer){
    //Rating open, Rating accepted, Rating not accepted

        switch(ReqStateCustomer)
        {
            case 'Rating open':
                ReqStateCustomerSum.Ratingopen++;

            break;
            case 'Rating accepted':
                ReqStateCustomerSum.Ratingaccepted++;

            break;
            case 'Rating not accepted':
                ReqStateCustomerSum.Ratingnotaccepted++;

            break;
            case '\xa0':
                ReqStateCustomerSum.empty++;
            break;
            default:
            break;
        }
    }


    function handleLinkage(ReqState, detailedWith){
        if (detailedWith !== '' && ReqState !== 'n/a'){
            hasLink++;
        }
    }




// ---------------------------------------------------------------------//
// Main Routine: parse HTML trou tbody > tr
// ---------------------------------------------------------------------//

    $('tbody tr').each(function() {
        var Type = $(this).find('td.Type').text();
        var detailedWith = $(this).find('td.Detailed').text();


        switch($(this).attr('class'))
        {
            case 'scr_header':

            break;

            case 'scr':
                var ReqState = this.getElementsByClassName('State')[1].childNodes[0].nodeValue;
                var ReqStateCustomer = this.getElementsByClassName('State')[2].childNodes[0].nodeValue;
                var SORState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                handleReqState(ReqState,ReqStateCustomer);
                //handleReqStateCustomer(ReqStateCustomer,ReqState);
                handleLinkage(ReqState,detailedWith);
            break;

            case 'platform_test_case':

            break;
            default:
            break;
        }
    });

// ---------------------------------------------------------------------//
// general Calculations
// ---------------------------------------------------------------------//
    var ReqStateemptyopen = ReqStateSum.empty + ReqStateSum.open;
    var ReqStateSumforCustomerRating = ReqStateSum.acceptedwithrestrictions+ ReqStateSum.na + ReqStateSum.notaccepted + ReqStateSum.reconciliation;
    console.log(ReqStateSum);
    console.log(ReqStateCustomerSum);
    console.log(hasLink);

// ---------------------------------------------------------------------//
// Print google Charts
// ---------------------------------------------------------------------//

// ---------------------------------------------------------------------//
// Pie Charts
// ---------------------------------------------------------------------//
// Reqest State Magna Status Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawReqStateChart);
    function drawReqStateChart(){

        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['All other states', ReqStateSum.all-ReqStateemptyopen],
            ['Empty or Open', ReqStateemptyopen]
        ]);

        var options = {
            title: 'SOR internal analysis',
            width: 400,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:10, bottom:20, width:"80%", height:"70%"},
            colors: ['#109618', '#B82E2E']
        };

        var chart = new google.visualization.PieChart(document.getElementById('ReqStatusChart'));
        chart.draw(data, options);
    }

// ---------------------------------------------------------------------//
// Reqest State Customer Status Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawReqStateCustomerChart);
    function drawReqStateCustomerChart(){

        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['Rating accepted', ReqStateCustomerSum.Ratingaccepted],
            ['All other states', ReqStateSumforCustomerRating-ReqStateCustomerSum.Ratingaccepted]
        ]);

        var options = {
            title: 'SOR analysis with customer',
            width: 400,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:10, bottom:20, width:"80%", height:"70%"},
            colors: ['#109618', '#B82E2E']
        };

        var chart = new google.visualization.PieChart(document.getElementById('ReqStatusCustomerChart'));
        chart.draw(data, options);
    }

// ---------------------------------------------------------------------//
// Linkage Status Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawLinkageStatusChart);
    function drawLinkageStatusChart(){

        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['with Link', hasLink],
            ['no link', ReqStateSum.all-hasLink-ReqStateSum.na]
        ]);

        var options = {
            title: 'SORs considered',
            width: 400,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:10, bottom:20, width:"80%", height:"70%"},
            colors: ['#109618', '#B82E2E']
        };

        var chart = new google.visualization.PieChart(document.getElementById('LinkageStatusChart'));
        chart.draw(data, options);
    }

}
