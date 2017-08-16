$(document).ready(function() {
    var availableProjects = [];
    var availableCustomer = [];
    var availableAffectedTestPlatforms = [];
// ---------------------------------------------------------------------//
// generate List of available Items
// ---------------------------------------------------------------------//
    function collectItems(ItemString,ItemArray){
        if(ItemString !== '' && ItemString !== null && ItemString !== '\xa0'){ //\xa0 == &nbsp;
            //Split ItemString if there is more than one Project
            var splitItemString = ItemString.split(',');
            for (var i = 0; i < splitItemString.length; i++) {
                var trimedItemString = splitItemString[i].trim();
                if (($.inArray(trimedItemString,ItemArray)) == -1)
                {
                    ItemArray.push(trimedItemString);
                }
            }
        }
    }

// ---------------------------------------------------------------------//
// append List of available Items to HTML selector
// ---------------------------------------------------------------------//
    function addItemsToSelector(availableItems,selector){
        availableItems.push('-All-');

        for (var i = 0; i < availableItems.length; i++) {
            availableItems.sort();
            //append options to HTML selector for Projects
            var sel = document.getElementById(selector);
            var opt = document.createElement('option');
            opt.innerHTML = availableItems[i];
            opt.value = availableItems[i];
            sel.appendChild(opt);
        }
        document.getElementById(selector).value = '-All-';
    }

// ---------------------------------------------------------------------//
// find Projects and Customer and add them to a selector
// ---------------------------------------------------------------------//
    $('tbody tr').each(function() {
        var Project = $(this).find('td.Project').text(); //Projects in Platform and Project Testcases
        var classID = $(this).attr('class');
        var ProjectArray = [];
        var CustomerArray = [];

        if (classID == 'feature'){
            var Type = this.getElementsByClassName('Type')[0].childNodes[0].nodeValue;
            var RequirementsType = $(this).find('td.Requirements').text();

            if (Type == 'System Component Requirement' && 
               (RequirementsType == 'Feature' || RequirementsType == 'Sub-Function'|| RequirementsType == 'Sub-Feature')){
                var Customer = $(this).find('td.Customer').text();
                collectItems(Customer, availableCustomer);
            }
        }

        if (classID == 'platform_test_case' || classID == 'project_test_case'){
            // aquire Projects only for Test Cases
            var Type = this.getElementsByClassName('Type')[0].childNodes[0].nodeValue;
            if (Type == 'Test Case'){
                collectItems(Project, availableProjects);
            }
        }

        if (classID == 'scr'){
            var AffectedTestPlatforms = this.getElementsByClassName('Affected')[0].childNodes[0].nodeValue;
                collectItems(AffectedTestPlatforms, availableAffectedTestPlatforms);
        }
    });

    addItemsToSelector(availableProjects,'selected_Project');
    addItemsToSelector(availableCustomer,'selected_Customer');
    addItemsToSelector(availableAffectedTestPlatforms,'selected_AffectedTestPlatform');

    main();


});

// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(){
    var OverviewTable = [];
    var TableRow = {ID:0, FeatureName:'', TestState:''};
    var TableRowArray = [];
    var activeFeature =false;
    var activeSCR = false;
    var activeTestCase = false;
    var activeFeatureTestStateSum = [];
    var activeSCRTestStateSum = [];
    var selectedProject = $( "#selected_Project" ).val();
    var selectedCustomer = $( "#selected_Customer" ).val();
    var selectedAffectedTestPlatform = $("#selected_AffectedTestPlatform").val();
    var FeatureSubject = '';
    var FeatureID = '';
    var FeatureType = '';
    var FeatureStateSum = {all:0, noTC:0, UnTested:0, NegTested:0, RestTested:0, PartTested:0, PartTestWithRest:0, PosTested:0, empty:0};

// ---------------------------------------------------------------------//
// add Table for Feature List
// ---------------------------------------------------------------------//
    function createTable(tableData) {
        var table = document.createElement('table');
        table.setAttribute("class", "table table-hover");
        var tableBody = document.createElement('tbody');
        tableBody.setAttribute("class", "table table-hover");


        tableData.forEach(function(rowData) {
            var row = document.createElement('tr');
        
            rowData.forEach(function(cellData) {
                var cell = document.createElement('td');
                cell.appendChild(document.createTextNode(cellData));
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
        
        table.appendChild(tableBody);
        document.body.appendChild(table);
    }

// ---------------------------------------------------------------------//
// check if String is equal to selection
// ---------------------------------------------------------------------//
    function checkString(String,SelectedValue){
        var retCode = 'false';
        var splitString = String.split(',');
        splitString.push('-All-'); // add -All- to every String so if selection is -All- it allways returns 'valid'
        // check if Array SelectedValue has equal entries to PF String Array
        for (var i in splitString){
            if(SelectedValue.indexOf(splitString[i].trim()) > -1){
                retCode = 'valid';
            }
        }
        return retCode;
    }



    function countTestStates(sumTestState){
        //sum States: noTC, UnTested, NegTested, RestTested, //
        //            PartTested, PartTestWithRest, PosTested//
        FeatureStateSum[sumTestState]++;
        FeatureStateSum.all++;
    }

// ---------------------------------------------------------------------//
// calculate Testing State for Feature from linked SCRs and further Test Cases
// ---------------------------------------------------------------------//
    function calculateFeatureTestState(TestStateSum){
        //sum States: noTC, UnTested, NegTested, RestTested, //
        //            PartTested, PartTestWithRest, PosTested//
        var sumState = 'noTC';
        var finish = 'false';

        for (var i = 0; i < TestStateSum.length; i++) {

            switch(TestStateSum[i])
            {
                case 'TC New':
                case 'TC Specified':
                case 'TC on Work':
                case 'TC Retest':
                    if(sumState == 'PosTested'){
                    //if posTested and new untested goto PartTested
                        sumState = 'PartTested';
                    }//if PartTested and new Untested stay at Parttested
                    else if(sumState == 'PartTested'){
                        sumState = 'PartTested';
                    }//if RestTested and new Untested goto PartTestWithRest
                    else if(sumState == 'RestTested'){
                        sumState = 'PartTestWithRest';
                    }//if PartTestWithRest stay at PartTestWithRest
                    else if(sumState == 'PartTestWithRest'){
                        sumState = 'PartTestWithRest';
                    }
                    else {
                        sumState = 'UnTested';
                    }
                break;
                case 'TC Completed with restriction':
                    if(sumState == 'UnTested'){
                        sumState = 'PartTestWithRest';
                    }//if UnTested goto PartTestWithRest
                    else {
                        sumState = 'RestTested';
                    }
                break;
                case 'TC Completed':
                    //in case only one TC attached and positive
                    if (sumState == 'noTC') { 
                        sumState = 'PosTested';
                    }
                break;
                case 'TC Failed':
                    sumState = 'NegTested';
                    finish = 'true';
                break;
                case 'TC Closed':
                break;
                default:
                break;
            }
            if (finish == 'true'){break;}
        }
        return sumState;
    }


// ---------------------------------------------------------------------//
// Main Routine: parse HTML trou tbody > tr
// ---------------------------------------------------------------------//

    $('tbody tr').each(function() {

        var Type = $(this).find('td.Type').text();
        var ProjectofItem = $(this).find('td.Project').text();
        var Subject = $(this).find('td.Subject').text();
        var CustomerofItem = $(this).find('td.Customer').text();
        var currentAffectedTestPlatform = $(this).find('td.Affected').text();
        var validPJ = checkString(ProjectofItem,selectedProject);
        var validCustomer = checkString(CustomerofItem,selectedCustomer);
        var validAffectedTestPlatform = checkString(currentAffectedTestPlatform, selectedAffectedTestPlatform);
        var sumTestState = 'noTC';



        switch($(this).attr('class'))
        {
            case 'feature_header':
                if (activeFeature == true && activeSCR == true){
                    if (activeTestCase == true){
                        sumTestState = calculateFeatureTestState(activeFeatureTestStateSum);
                    }
                    else if (activeTestCase == false){
                        //sumTestState = 'noTC';
                    }
                    //console.log(FeatureID, ':', FeatureSubject,':',sumTestState);
                    OverviewTable.push([FeatureID,FeatureSubject,FeatureType, sumTestState]);
                }
                countTestStates(sumTestState);

                activeTestCase = false;
                activeFeature =false;
                activeSCR = false;
                activeFeatureTestStateSum = [];
            break;

            case 'feature':
                var FeatureState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                FeatureSubject = this.getElementsByClassName('Subject')[0].childNodes[0].nodeValue;
                FeatureID = this.getElementsByClassName('ID')[0].childNodes[0].nodeValue;
                FeatureType = this.getElementsByClassName('Type')[1].childNodes[0].nodeValue;
                if (FeatureState == 'Requirement Implemented' && validCustomer == 'valid'){
                    activeFeature = true;
                }
                //console.log('------------------------------------');
                //console.log('Feature', ' : ', FeatureState);
            break;

            case 'feature_relationship':
                //console.log('feature_relationship');
            break;
            case 'scr_header':
                //console.log('scr_header');
            break;
            case 'scr':
                var Type = this.getElementsByClassName('Type')[0].childNodes[0].nodeValue;
                var ReqType = this.getElementsByClassName('Type')[1].childNodes[0].nodeValue;
                var ReqState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                var AffectedTestPlatforms = this.getElementsByClassName('Affected ')[0].childNodes[0].nodeValue;
                
                if (activeFeature == true && validAffectedTestPlatform == 'valid'){
                    activeSCR = true;
                }
                //console.log('scr' , ' : ' , Type,' : ' , ReqType, ' : ', ReqState);
            break;
            case 'platform_test_case_header':
                //console.log('platform_test_case_header');
            break;
            case 'platform_test_case':
                var PlatformTCState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                var PlatformTCProject = this.getElementsByClassName('Project')[0].childNodes[0].nodeValue;
                if (activeFeature == true && activeSCR == true && validPJ == 'valid'){
                    activeTestCase = true;
                    activeFeatureTestStateSum.push(PlatformTCState);
                    //console.log('platform_test_case', ' : ', PlatformTCState, ' : ', PlatformTCProject);
                }
            break;
            case 'project_test_case_header':
                //console.log('project_test_case_header');
            break;
            case 'project_test_case':
                var ProjTCState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                var ProjTCProject = this.getElementsByClassName('Project')[0].childNodes[0].nodeValue;
                if (activeFeature == true && activeSCR == true && validPJ == 'valid'){
                    activeTestCase = true;
                    activeFeatureTestStateSum.push(ProjTCState);
                    //console.log('project_test_case', ' : ', ProjTCState, ' : ', ProjTCProject);
                }
            break;
            default:
            break;
        }
    });

// ---------------------------------------------------------------------//
// general Calculations
// ---------------------------------------------------------------------//
createTable(OverviewTable);

// ---------------------------------------------------------------------//
// Print google Charts
// ---------------------------------------------------------------------//
// ---------------------------------------------------------------------//
// Pie Charts
// ---------------------------------------------------------------------//
// Coverage Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawOverviewFeatureCoverage);
    function drawOverviewFeatureCoverage(){
    
        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['Positive Tested', FeatureStateSum.PosTested],
            ['other states', FeatureStateSum.all-FeatureStateSum.PosTested]
        ]);

        var options = {
            //title: 'Test Coverage',
            width: 600,
            height: 600,
            legend: { position: 'right',alignment: 'center', maxLines: 3 },
            //chartArea: {left:00, bottom:20},
            colors: ['#109618', '#DC3912'],
            slices: {  0: {offset: 0.3},
                    },
        };

        var chart = new google.visualization.PieChart(document.getElementById('OverviewFeatureCoverage'));
        chart.draw(data, options);
    }


// ---------------------------------------------------------------------//
// Bar Charts
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawFeatureTestCoverage);
    function drawFeatureTestCoverage(){
        //var FeatureStateSum = {all:0, noTC:0, UnTested:0, NegTested:0, RestTested:0, PartTested:0, PartTestWithRest:0, PosTested:0, empty:0};
        var data = google.visualization.arrayToDataTable([
           //['TestStates', 'no Test Case attached', 'negative tested', 'untested', 'partially tested','tested with restrictions','part tested with restrictions', 'positive tested'],
           //['Count', FeatureStateSum.noTC,FeatureStateSum.NegTested,FeatureStateSum.UnTested,FeatureStateSum.RestTested,FeatureStateSum.PartTestWithRest,FeatureStateSum.PartTested,FeatureStateSum.PosTested],
           ['State', 'Count',{role: 'style'}],
           ['no Test Case attached', FeatureStateSum.noTC, '#3366CC'],
           ['negative tested',FeatureStateSum.NegTested,'#DC3912'],
           ['untested',FeatureStateSum.UnTested, '#FF9900'],
           ['partially tested',FeatureStateSum.RestTested,'#DD4477'],
           ['tested with restrictions',FeatureStateSum.PartTestWithRest, '#994499'],
           ['part tested with restrictions',FeatureStateSum.PartTested,'#0099C6'],
           ['positive tested',FeatureStateSum.PosTested, '#109618']
        ]);


        var options = {
            //title: 'SOWs Test Status for PT Generations',
            width: 1200,
            height: 800,
            //legend: { position: 'right', alignment: 'center', maxLines: 6 },
            //chartArea: {left:80, bottom:20, width:"40%", height:"70%"},
            bar: { groupWidth: '70%' },
            //colors: ['#109618', '#DC3912'],
            annotations: {
                textStyle: {
                    color: 'black',
                    fontSize: 10,
                },
                //alwaysOutside: true
            }

        };

        var chart = new google.visualization.ColumnChart(document.getElementById('FeaturTestCoverage'));
        chart.draw(data, options);
    }


//  Feature TestCoverage States
// ---------------------------------------------------------------------//

//    google.charts.setOnLoadCallback(drawFeatureTestCoverage);
//    function drawFeatureTestCoverage(){
//        //var FeatureStateSum = {all:0, noTC:0, UnTested:0, NegTested:0, RestTested:0, PartTested:0, PartTestWithRest:0, PosTested:0, empty:0};
//        var data = [
//            ['no Test Case attached', 'negative tested', 'untested', 'partially tested','tested with restrictions','part tested with restrictions', 'positive tested'],
//            [FeatureStateSum.noTC,FeatureStateSum.NegTested,FeatureStateSum.UnTested,FeatureStateSum.RestTested,FeatureStateSum.PartTestWithRest,FeatureStateSum.PartTested,FeatureStateSum.PosTested],
//        ];
//        var aggregates = ["State"];
//        var metrics = ["Features"];
//
//        var options = {
//            //title: 'SOWs Test Status for PT Generations',
//            width: 1200,
//            height: 800,
//            legend: { position: 'right', alignment: 'center', maxLines: 6 },
//            //chartArea: {left:80, bottom:20, width:"40%", height:"70%"},
//            bar: { groupWidth: '50%' },
//            //isStacked: true,
//            annotations: {
//                textStyle: {
//                    color: 'black',
//                    fontSize: 10,
//                },
//                //alwaysOutside: true
//            }
//
//        };
////test 
//        var dataTable = google.visualization.arrayToDataTable(data);
//        //Formatters
//        var intergerFormatter = new google.visualization.NumberFormat({
//            groupingSymbol: ",",
//            fractionDigits: 0
//        });
//        for (var i = 0; i < data[0].length; i++) {
//            intergerFormatter.format(dataTable, i);
//        }
//
//        var view = new google.visualization.DataView(dataTable);
//        var cols = [0];
//        for (var i = 1; i < data[0].length; i++) {
//            cols.push({
//                sourceColumn: i,
//                type: "number",
//                label: data[0][i]
//            });
//            cols.push({
//                calc: "stringify",
//                sourceColumn: i,
//                type: "string",
//                role: "annotation"
//            });
//            cols.push({
//                calc: createTooltip(i),
//                /*(function(i) {
//                      return function(dataTable, row){
//                        return "Url count" + dataTable.getValue(row, i)+"</b>";
//                    };
//                 })(i),*/
//                type: "string",
//                role: "tooltip",
//                p: { html: true }
//            });
//        }
//        view.setColumns(cols);
////test
//        var chart = new google.visualization.ColumnChart(document.getElementById('FeaturTestCoverage'));
//        chart.draw(view, options);
//
//    function createTooltip(col) {
//      return function(dataTable, row) {
//        var html = "";
//        html += aggregates[0] + ": " + dataTable.getColumnLabel(col) + "\n";
////        html += aggregates[1] + ": " + dataTable.getValue(row, 0) + "\n";
//        html +=
//          metrics[0] +
//          ": " +
//          intergerFormatter.formatValue(dataTable.getValue(row, col)) +
//          "\n";
//        return html;
//      };
//  }
//    }

}