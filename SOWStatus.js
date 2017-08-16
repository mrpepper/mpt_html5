$(document).ready(function() {
    main();

});

// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(){
    var ReqStateSum = {all:0, ReqImplemented:0, ReqSpecified:0, others:0};
    var MS2ReqStateSum = {all:0, ReqImplemented:0, ReqSpecified:0, others:0};
    var MS3ReqStateSum = {all:0, ReqImplemented:0, ReqSpecified:0, others:0};
    var MS4ReqStateSum = {all:0, ReqImplemented:0, ReqSpecified:0, others:0};
    var hasLink = 0;
    var hasMilestone = 0;
    var SumReqCount = 0;

    function addtoMilestoneCount(ReqStateArray, ReqState){
        switch (ReqState)
        {
            case 'Requirement Implemented':
                ReqStateArray.ReqImplemented++;
            break;
            case 'Requirement Specified':
                ReqStateArray.ReqSpecified++;
            break;
            default:
                ReqStateArray.others++;
            break;
        }
        return ReqStateArray;
    }

    function handleReqState(ReqState, Milestone){
    //Requirement New,Requirement specified,Requirement Implemented, Requirement Closed
        slicedMilestone = Milestone.substring(0,3);
        switch (slicedMilestone)
        {
            case 'MS2':
                MS2ReqStateSum  = addtoMilestoneCount(MS2ReqStateSum, ReqState);
            break;
            case 'MS3':
                MS3ReqStateSum  = addtoMilestoneCount(MS3ReqStateSum, ReqState);
            break;
            case 'MS4':
                MS4ReqStateSum  = addtoMilestoneCount(MS4ReqStateSum, ReqState);
            break;
            default:
            break;
        }
    }

    function handleLinkage(detailedWith){
        if (detailedWith !== ''){
            hasLink++;
        }
    }

    function handleMilestone(Milestone){
        if (Milestone !== ''){
            hasMilestone++;
        }
    }



// ---------------------------------------------------------------------//
// Main Routine: parse HTML trou tbody > tr
// ---------------------------------------------------------------------//

    $('tbody tr').each(function() {
        var Type = $(this).find('td.Type').text();
        var State = $(this).find('td.State').text();
        var Milestone = $(this).find('td.Milestone').text();
        var detailedWith = $(this).find('td.Detailed').text();
        var ReqState = $(this).find('td.State').text();


        switch($(this).attr('class'))
        {
            case 'scr_header':

            break;

            case 'scr':
                handleReqState(ReqState, Milestone);
                handleLinkage(detailedWith, Milestone);
                handleMilestone(Milestone);
                SumReqCount++;
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
    var ReqSpecImpl = MS2ReqStateSum.ReqSpecified + MS2ReqStateSum.ReqImplemented + MS3ReqStateSum.ReqSpecified + MS3ReqStateSum.ReqImplemented + MS4ReqStateSum.ReqSpecified + MS4ReqStateSum.ReqImplemented;
    console.log(hasLink);
    console.log(hasMilestone);
    console.log(SumReqCount);
    console.log(MS2ReqStateSum);
    console.log(MS3ReqStateSum);
    console.log(MS4ReqStateSum);


// ---------------------------------------------------------------------//
// Print google Charts
// ---------------------------------------------------------------------//

// ---------------------------------------------------------------------//
// Bar Charts
// ---------------------------------------------------------------------//
// Milestone Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawStatesforMilestones);
    function drawStatesforMilestones(){
    
        var data = google.visualization.arrayToDataTable([
            ['Release', 'other States', 'Requirement Specified', 'Requirement Implemented'],
            ['MS2',MS2ReqStateSum.others, MS2ReqStateSum.ReqSpecified,MS2ReqStateSum.ReqImplemented],
            ['MS3',MS3ReqStateSum.others, MS3ReqStateSum.ReqSpecified,MS3ReqStateSum.ReqImplemented],
            ['MS4',MS4ReqStateSum.others, MS4ReqStateSum.ReqSpecified,MS4ReqStateSum.ReqImplemented]
        ]);
        var options = {
            title: 'States for Milestones',
            width: 400,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 3 },
            chartArea: {left:50, bottom:20, width:"50%", height:"70%"},
            bar: { groupWidth: '50%' },
            colors: ['#B82E2E','#FF9900', '#109618'],
            isStacked: true
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('StatesforMilestones'));
        chart.draw(data, options);
    }

// ---------------------------------------------------------------------//
// Pie Charts
// ---------------------------------------------------------------------//
// Has Milestone
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawMilestoneChart);
    function drawMilestoneChart(){
    
        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['is planned', hasMilestone],
            ['not planned', SumReqCount-hasMilestone]
        ]);

        var options = {
            title: 'SOWs planned',
            width: 500,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:10, bottom:20, width:"80%", height:"70%"},
            colors: ['#109618', '#B82E2E']
        };

        var chart = new google.visualization.PieChart(document.getElementById('MilestoneChart'));
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
            ['no link', SumReqCount-hasLink]
        ]);

        var options = {
            title: 'SOWs considered',
            width: 500,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:10, bottom:20, width:"80%", height:"70%"},
            colors: ['#109618', '#B82E2E']
        };

        var chart = new google.visualization.PieChart(document.getElementById('LinkageStatusChart'));
        chart.draw(data, options);
    }
// ---------------------------------------------------------------------//
// Reqest State Status Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawReqStateChart);
    function drawReqStateChart(){
    
        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['Requirement Specified or Implemented', ReqSpecImpl],
            ['All other states', SumReqCount-ReqSpecImpl]
        ]);

        var options = {
            title: 'SOW requirement status',
            width: 500,
            height: 300,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:10, bottom:20, width:"80%", height:"70%"},
            colors: ['#109618', '#B82E2E']
        };

        var chart = new google.visualization.PieChart(document.getElementById('ReqStatusChart'));
        chart.draw(data, options);
    }


}