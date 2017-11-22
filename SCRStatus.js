$(document).ready(function() {
    var availableDocumentIDs = [];
    var Documents = [];
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
    // append List of available Items to HTML selector
    // ---------------------------------------------------------------------//
    function addToSelector(Selector,Variants){
        for (var i = 0; i < Variants.length; i++) {
            Variants.sort();
            //append options to HTML selector for TestPlatforms
            var sel = document.getElementById(Selector);
            var opt = document.createElement('option');
            opt.innerHTML = Variants[i];
            opt.value = Variants[i];
            sel.appendChild(opt);
        }
    }
    // ---------------------------------------------------------------------//
    // find Affected TestPlatforms and add them to the selector
    // ---------------------------------------------------------------------//
    $('tbody tr').each(function() {
        var Type = $(this).find('td.Type').text();
        var Subject = $(this).find('td.Subject').text();
        var DocumentID = $(this).find('td.ID').text();//this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
        if(Type == "System Component Requirement Document" || Type == "SOW Requirement Document"){
            Documents = handleDocs(Subject, DocumentID, Type, Documents);
        }

    });
    var DocSubject = $.map(Documents, function(value, index) {
        	return [value.Subject.concat(" * ").concat(value.DocID)];
    });
    addToSelector('selected_Documents', DocSubject);
    $("#selected_Documents").selectpicker('val', DocSubject);

    main(Documents);

});

// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(Documents){
    var SumReqCount = 0;
    var RequirementsStatusCount = [];
    var ReqStatus = {};
    var OverviewTable = [];
    var selectedDocuments = $( "#selected_Documents" ).val();

    // ---------------------------------------------------------------------//
    // append List of available Items to HTML selector
    // ---------------------------------------------------------------------//
    function addToSelector(Selector,Variants){
        for (var i = 0; i < Variants.length; i++) {
            Variants.sort();
            //append options to HTML selector for TestPlatforms
            var sel = document.getElementById(Selector);
            var opt = document.createElement('option');
            opt.innerHTML = Variants[i];
            opt.value = Variants[i];
            sel.appendChild(opt);
        }
    }
    // ---------------------------------------------------------------------//
    // create Table
    // ---------------------------------------------------------------------//
    function createTable(tableData) {
        var headingData = ['ID', 'Subject', 'Document ID', 'has Parent', 'has Child', 'has Review', 'has Test Case'];
        //remove preveous table
        $("#OverviewTable").remove();
        //create the new table
        var table = document.createElement('table');
        table.setAttribute("class", "table table-hover");
        table.setAttribute("id", "OverviewTable");
        table.setAttribute("hidden", "true");

        // Table Heading
        var tableHead = document.createElement('thead');
        //tableHead.setAttribute("class", "thead-default");
        var HeadingRow = document.createElement('tr');
        HeadingRow.setAttribute("class", "active");
        headingData.forEach(function(data) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(data));
            HeadingRow.appendChild(cell);
            tableHead.appendChild(HeadingRow);
        });

        // Table Body
        var tableBody = document.createElement('tbody');
        tableData.forEach(function(rowData) {
            var row = document.createElement('tr');
            var IntegrityURL = "integrity://lanwinsvmks1.eu.adglob.net:8001/im/viewissue?selection=";
            var ReqURL = IntegrityURL.concat(rowData[0]);

            row.setAttribute("class", "clickable-tr");
            row.setAttribute('href', ReqURL);
            row.addEventListener("click",function(){
                window.location.href = $(this).attr('href');
            });
            rowData.forEach(function(cellData) {
                var cell = document.createElement('td');
                var context = getColor(cellData);
                cell.setAttribute("bgcolor",context);
                cell.appendChild(document.createTextNode(cellData));
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });

        table.appendChild(tableHead);
        table.appendChild(tableBody);
        document.getElementById("TableContainer").appendChild(table);
    }
    // ---------------------------------------------------------------------//
    // get Color
    // ---------------------------------------------------------------------//
    function getColor(State){
        // States:  empty    ,TCmissing, UnTested , NegTested, RestTested, PartTested, PartTestWithRest, PosTested//
        //////////redbrown , red     , rose    ,orange   ,kaki     ,lgreen    ,dgreen
        colors : ['#8B0707','#DC3912','#DD4477','#F07336','#FF9900','#AB9808','#109618']
        var context = "";
        switch (State)
        {
            case 'yes':
                context = "#109618";
            break;
            case 'no':
                context = "#B82E2E";
            break;
            default:
                context = "#FFFFFF";
            break;
        }
        return context;
    }
    // ---------------------------------------------------------------------//
    // handle Status of Requirements
    // ---------------------------------------------------------------------//
    function countStatus(detailedWith, details, ReviewDone, Type, DocID, SumObject){
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

    function AddDocNames(RequirementsStatusCount, Documents){
        for (var i = 0; i < RequirementsStatusCount.length; i++) {
            for (var j = 0; j < Documents.length; j++) {
                if (RequirementsStatusCount[i].DocID == Documents[j].DocID)
                {
                    RequirementsStatusCount[i].DocName = Documents[j].Subject;
                }
            }
        }
    }
    // ---------------------------------------------------------------------//
    // handle Requirements Status of one Requirement
    // ---------------------------------------------------------------------//
    function handleReqStatus(details, detailedWith, Reviews, TestCases){
        ReqStatus = {Parents:"no", Childs:"no", Reviews:"no", Tests:"no"};

        if(details !== '' && details !== null && details !== '\xa0'){
            ReqStatus.Parents = "yes";
        }
        if(detailedWith !== '' && detailedWith !== null && detailedWith !== '\xa0'){
            ReqStatus.Childs = "yes";
        }
        if(Reviews !== '' && Reviews !== null && Reviews !== '\xa0'){
            ReqStatus.Reviews = "yes";
        }
        if(TestCases !== '' && TestCases !== null && TestCases !== '\xa0'){
            ReqStatus.Tests = "yes";
        }
        return ReqStatus;
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
        var TestIssues = $(this).find('td.Test').text();
        var Subject = $(this).find('td.Subject').text();
        //var validDocument = checkString(Subject,selectedDocuments);


        switch($(this).attr('class'))
        {
            case 'item_header':

            break;

            case 'item':
                ReqID = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                if(Type == "SOW Requirement" || Type == "System Component Requirement"){
                    ReqStatus = handleReqStatus(details, detailedWith, ReviewDone, TestIssues);
                    RequirementsStatusCount = countStatus(detailedWith, details, ReviewDone, Type, DocID, RequirementsStatusCount);
                    //var headingData = ['ID', 'Subject', 'Document ID', 'has Parent', 'has Child', 'has Review', 'has link to Test Case'];
                    OverviewTable.push([ReqID, Subject, DocID, ReqStatus.Parents, ReqStatus.Childs, ReqStatus.Reviews, ReqStatus.Tests]);
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

    AddDocNames(RequirementsStatusCount, Documents);

    //var availableDocuments = [];
    //for (var i = 0; i < Documents.length; i++) {
    //    availableDocuments.push(Documents[i].Subject);
    //}
//
    //addToSelector('selected_Documents', availableDocuments);
    //$("#selected_Documents").selectpicker('val', availableDocuments);

    function Comparator(a, b) {
        if (a[2] < b[2]) return -1;
        if (a[2] > b[2]) return 1;
        return 0;
    }
    OverviewTable = OverviewTable.sort(Comparator);
    createTable(OverviewTable);

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

        for (var i = 0; i < RequirementsStatusCount.length; i++) {
            TableArray.push([RequirementsStatusCount[i].DocName,RequirementsStatusCount[i].ReqWithParent, RequirementsStatusCount[i].ReqWithOutParent]);
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

            for (var i = 0; i < RequirementsStatusCount.length; i++) {
                TableArray.push([RequirementsStatusCount[i].DocName,RequirementsStatusCount[i].ReqWithChild, RequirementsStatusCount[i].ReqWithOutChild]);
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

            for (var i = 0; i < RequirementsStatusCount.length; i++) {
                TableArray.push([RequirementsStatusCount[i].DocName,RequirementsStatusCount[i].ReqWithReview, RequirementsStatusCount[i].ReqWithOutReview]);
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
