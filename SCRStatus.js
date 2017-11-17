$(document).ready(function() {
    main();

});

// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(){
    var SumReqCount = 0;
    var RequirementsStatus = [];
    var Documents = [];

    // ---------------------------------------------------------------------//
    // handle Status of Requirements
    // ---------------------------------------------------------------------//
    function handleStatus(detailedWith, details, ReviewDone, Type, DocID, SumObject){
        var DocumentState = {DocID:0, DocName:0, ReqWithParent:0, ReqWithOutParent:0, ReqWithChild:0, ReqWithOutChild:0, ReqWithReview:0, ReqWithOutReview:0,others:0};
        var avialable = false;
        var count = 0;

        for (var i = 0; i < SumObject.length; i++) {
            if(SumObject[i].DocID == DocID){
                avialable = true;
                count = i;
                break;
            }
        }
        if (avialable == true)
        {
            if(detailedWith !== '' && detailedWith !== null && detailedWith !== '\xa0'){
                SumObject[count].ReqWithChild++;
            } else {
                SumObject[count].ReqWithOutChild++;
            }

            if(details !== '' && details !== null && details !== '\xa0'){
                SumObject[count].ReqWithParent++;
            } else {
                SumObject[count].ReqWithOutParent++;
            }

            if(ReviewDone == 'Yes'){
                SumObject[count].ReqWithReview++;
            } else {
                SumObject[count].ReqWithOutReview++;
            }

        }
        else
        {
            DocumentState.DocID = DocID;
            if(detailedWith !== '' && detailedWith !== null && detailedWith !== '\xa0'){
                DocumentState.ReqWithChild = 1;
            } else {
                DocumentState.ReqWithOutChild = 0;
            }

            if(details !== '' && details !== null && details !== '\xa0'){
                DocumentState.ReqWithParent = 1;
            } else {
                DocumentState.ReqWithOutParent = 0;
            }

            if(ReviewDone == 'Yes'){
                DocumentState.ReqWithReview = 1;
            } else {
                DocumentState.ReqWithOutReview = 0;
            }
            SumObject.push(DocumentState);
        }
        return SumObject;
    }

    // ---------------------------------------------------------------------//
    // handle Document informations
    // ---------------------------------------------------------------------//
    function handleDocs(Subject, ID, Type, Documents){
        var DocInfo = {DocID:0, Subject:0, Type:0};
        var avialable = false;
        var count = 0;

        for (var i = 0; i < Documents.length; i++) {
            if(Documents[i].DocID == ID){
                avialable = true;
                count = i;
                break;
            }
        }
        if (avialable == false)
        {
            DocInfo.DocID = ID;
            DocInfo.Subject = Subject;
            DocInfo.Type = Type;
            Documents.push(DocInfo);
        }

        return Documents;
    }
// ---------------------------------------------------------------------//
// Main Routine: parse HTML trou tbody > tr
// ---------------------------------------------------------------------//

    $('tbody tr').each(function() {
        var Type = $(this).find('td.Type').text();
        var State = $(this).find('td.State').text();
        var details = $(this).find('td.Details').text();
        var detailedWith = $(this).find('td.Detailed').text();
        var ReqState = $(this).find('td.State').text();
        var ReviewDone = $(this).find('td.Review').text();
        var DocID = $(this).find('td.Document').text();
        var Subject = $(this).find('td.Subject').text();
        var ID = $(this).find('td.ID').text();


        switch($(this).attr('class'))
        {
            case 'item_header':

            break;

            case 'item':
                if(Type == "SOW Requirement" || Type == "System Component Requirement"){
                    RequirementsStatus = handleStatus(detailedWith, details, ReviewDone, Type, DocID, RequirementsStatus);
                }
                if(Type == "System Component Requirement Document" || Type == "SOW Requirement Document"){
                    Documents = handleDocs(Subject, ID, Type, Documents);
                }
                //handleReqState(ReqState, Milestone);
                //handleMilestone(Milestone);
                SumReqCount++;
            break;

            case 'level1':

            break;
            default:
            break;
        }
    });

// ---------------------------------------------------------------------//
// general Calculations
// ---------------------------------------------------------------------//

    function AddDocNames(RequirementsStatus, Documents){
        for (var i = 0; i < RequirementsStatus.length; i++) {
            for (var j = 0; j < Documents.length; j++) {
                if (RequirementsStatus[i].DocID == Documents[j].DocID)
                {
                    RequirementsStatus[i].DocName = Documents[j].Subject;
                }
            }
        }
    }
    AddDocNames(RequirementsStatus, Documents);



// ---------------------------------------------------------------------//
// Print google Charts
// ---------------------------------------------------------------------//
// ---------------------------------------------------------------------//
// Bar Charts
// ---------------------------------------------------------------------//
// Parents Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawStatesforParents);
    function drawStatesforParents(){
        var TableArray = [];

        for (var i = 0; i < RequirementsStatus.length; i++) {
            TableArray.push([RequirementsStatus[i].DocName,RequirementsStatus[i].ReqWithParent, RequirementsStatus[i].ReqWithOutParent]);
        }

        var dataTable = new google.visualization.DataTable()
        dataTable.addColumn('string', 'Document');
        dataTable.addColumn('number', 'with Parents');
        dataTable.addColumn('number', 'without Parents');
        dataTable.addRows(TableArray);
        var view = new google.visualization.DataView(dataTable);

        var options = {
            title: 'Requirements Parents',
            width: 500,
            height: 800,
            legend: { position: 'top', alignment: 'center', maxLines: 3 },
            chartArea: {left:100, bottom: 200, width:"80%"},
            bar: { groupWidth: '80%' },
            colors: ['#109618','#B82E2E','#FF9900'],
            hAxis: {
                direction: -1,
                slantedText: true,
                slantedTextAngle: 60 // here you can even use 180
            }
            //isStacked: true
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('StatesforParents'));
        chart.draw(view, options);
    }

// ---------------------------------------------------------------------//
// Childs Chart
// ---------------------------------------------------------------------//
        google.charts.setOnLoadCallback(drawStatesforChilds);
        function drawStatesforChilds(){
            var TableArray = [];

            for (var i = 0; i < RequirementsStatus.length; i++) {
                TableArray.push([RequirementsStatus[i].DocName,RequirementsStatus[i].ReqWithChild, RequirementsStatus[i].ReqWithOutChild]);
            }

            var dataTable = new google.visualization.DataTable()
            dataTable.addColumn('string', 'Document');
            dataTable.addColumn('number', 'with Childs');
            dataTable.addColumn('number', 'without Childs');
            dataTable.addRows(TableArray);
            var view = new google.visualization.DataView(dataTable);

            var options = {
                title: 'Requirements Childs',
                width: 500,
                height: 800,
                legend: { position: 'top', alignment: 'center', maxLines: 3 },
                chartArea: {left:100, bottom: 200, width:"80%"},
                bar: { groupWidth: '80%' },
                colors: ['#109618','#B82E2E','#FF9900'],
                //isStacked: true
                hAxis: {
                    direction: -1,
                    slantedText: true,
                    slantedTextAngle: 60 // here you can even use 180
                }
            };
            var chart = new google.visualization.ColumnChart(document.getElementById('StatesforChilds'));
            chart.draw(view, options);
        }
// ---------------------------------------------------------------------//
// Review Chart
// ---------------------------------------------------------------------//
        google.charts.setOnLoadCallback(drawStatesforReviews);
        function drawStatesforReviews(){
            var TableArray = [];

            for (var i = 0; i < RequirementsStatus.length; i++) {
                TableArray.push([RequirementsStatus[i].DocName,RequirementsStatus[i].ReqWithReview, RequirementsStatus[i].ReqWithOutReview]);
            }

            var dataTable = new google.visualization.DataTable()
            dataTable.addColumn('string', 'Document');
            dataTable.addColumn('number', 'with Review');
            dataTable.addColumn('number', 'without Review');
            dataTable.addRows(TableArray);
            var view = new google.visualization.DataView(dataTable);

            var options = {
                title: 'Requirements Reviews',
                width: 500,
                height: 800,
                legend: { position: 'top', alignment: 'center', maxLines: 3 },
                chartArea: {left:100, bottom: 200, width:"80%"},
                bar: { groupWidth: '80%' },
                colors: ['#109618','#B82E2E','#FF9900'],
                //isStacked: true
                hAxis: {
                    direction: -1,
                    slantedText: true,
                    slantedTextAngle: 60 // here you can even use 180
                }
            };
            var chart = new google.visualization.ColumnChart(document.getElementById('StatesforReviews'));
            chart.draw(view, options);
        }
}
