$(document).ready(function() {
    var count = 0;
    main(count);

});


function main(runcount){
    var SOWReqCount = 0;
    var activeReqTestStateSum = [];
    var attachedTCStatePT1Sum = [];
    var attachedTCStatePT2Sum = [];
    var attachedTCStatePVSSum = [];
    var activeReqTestState = '';
    var activeReqPTTestState = '';
    var ReqMilestone = '';
    var PFTCCount = 0;
    var TCCount = 0;
    var activePFTC = 'false';
    var activeReq = 'false';
    var prev_scr_id = 0;
    var prev_activeReqTestState = 0;
    var AllStatusMask = {noTC:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS2StatusMask = {noTC:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS3StatusMask = {noTC:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS4StatusMask = {noTC:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MSotherStatusMask = {noTC:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS2Count = 0;
    var MS3Count = 0;
    var MS4Count = 0;
    var noMSplanned = 0;
    var availableTestPlatforms = [];
    var attachedTCStatesSum = [];

// ---------------------------------------------------------------------//
// Count general Values over the whole HTML Data
// ---------------------------------------------------------------------//

    var TCCount = $('#roottable > tbody > tr > td.border.Type').filter(function() {
        return $(this).text() == 'Test Case';
    }).length;


// ---------------------------------------------------------------------//
// change Function
// ---------------------------------------------------------------------//

    function checkPFString(PFString){
        retCode = 'false';
        if(selectedTestPlatform == 'All'){
            retCode = 'valid';
        } else {
            //Split PFString if there is more than one TestPlatform selected: separated by: ,
            var splitPFString = PFString.split(',');
            for (var i = 0; i < splitPFString.length; i++) {
                var trimedPFString = splitPFString[i].trim();
                if (trimedPFString == selectedTestPlatform){
                    retCode = 'valid';
                    //break; ???
                }
            }
        }
        return retCode;
    }

// ---------------------------------------------------------------------//
// generate List of available Testplatforms in HTML Data and append to HTML selector
// ---------------------------------------------------------------------//
    function handleTestPlatforms(PFString, func){
        retCode = 'false';
        if(PFString !== '' && PFString !== null && PFString !== '\xa0'){ //\xa0 == &nbsp;
            //Split PFString if there is more than one TestPlatform selected: separated by: ,
            var splitPFString = PFString.split(',');
            for (var i = 0; i < splitPFString.length; i++) {
                var trimedPFString = splitPFString[i].trim();
                if (($.inArray(trimedPFString,availableTestPlatforms)) == -1 && func == 'addifnew' && runcount == 0)
                {
                    availableTestPlatforms.push(trimedPFString);
                    retCode = 'added';
                }
                else if (func == 'compare2selected' && trimedPFString == selectedTestPlatform){
                    retCode = 'valid';
                }
            }
        }
        return retCode;
        }

// ---------------------------------------------------------------------//
// append List of available Testplatforms to HTML selector
// ---------------------------------------------------------------------//
    function addTestPlatformsToSelector(){
        if(runcount == 0){
            availableTestPlatforms.push('All');
        }

        for (var i = 0; i < availableTestPlatforms.length; i++) {
            availableTestPlatforms.sort();
            //append options to HTML selector for TestPlatforms
            var sel = document.getElementById('selected_Test_Platforms');
            var opt = document.createElement('option');
            opt.innerHTML = availableTestPlatforms[i];
            opt.value = availableTestPlatforms[i];
            sel.appendChild(opt);
        }
        if(runcount == 0){
            document.getElementById('selected_Test_Platforms').value = 'All';
        }
    }

// ---------------------------------------------------------------------//
// Count Requirement Test States per Mielestone
// ---------------------------------------------------------------------//
    function CountPlanningState(ReqMS, Status){
        //only use 1st three Characters of Milestone e.g: MS2 of MS2.1
        var slicedReqMS = ReqMS.substring(0,3);
        switch (slicedReqMS)
        {
            case 'MS2':
                MS2StatusMask[Status]++;
                MS2Count++;
            break;
            case 'MS3':
                MS3StatusMask[Status]++;
                MS3Count++;
            break;
            case 'MS4':
                MS4StatusMask[Status]++;
                MS3Count++;
            break;
            default:
                MSotherStatusMask[Status]++;
                noMSplanned++;
            break;
        }
        AllStatusMask[Status]++;
    }

// ---------------------------------------------------------------------//
// calculte Testing State for a Reqirement from several linked Test Cases
// ---------------------------------------------------------------------//
    function handleActiveReqTestState(activeReqTestState){
        //sum States: noTC, UnTested, NegTested, RestTested, //
        //            PartTested, PartTestWithRest, PosTested//
        var sumState = 'noTC';
        var finish = 'false';
//        console.log(activeReqTestState);
        for (var i = 0; i < activeReqTestState.length; i++) {

            switch (activeReqTestState[i])
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
                    AllStatusMask.NegTested++;
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

    function handleTCPTState(oldSumState, MS, States){
        var sumState = '';
        //if Tescase state in this Milstone is 'TC not to Verify' look in previous Milestones.
        if (States[MS] == 'TC not to Verify' && MS == 'SR4State'){
            MS = 'SR3State';
        }
        else if (States[MS] == 'TC not to Verify' && MS == 'SR3State'){
            MS = 'SR2State';
        }

        switch (States[MS])
        {
            case 'TC to Verify':
                if(oldSumState == 'PosTested'){
                //if posTested and new untested goto PartTested
                    sumState = 'PartTested';
                }//if PartTested and new Untested stay at Parttested
                else if(oldSumState == 'PartTested'){
                    sumState = 'PartTested';
                }//if RestTested and new Untested goto PartTestWithRest
                else if(oldSumState == 'RestTested'){
                    sumState = 'PartTestWithRest';
                }//if PartTestWithRest stay at PartTestWithRest
                else if(oldSumState == 'PartTestWithRest'){
                    sumState = 'PartTestWithRest';
                }
                else {
                    sumState = 'UnTested';
                }
            break;
            case 'TC Completed with Restriction':
                if(oldSumState == 'UnTested'){
                    sumState = 'PartTestWithRest';
                }//if UnTested goto PartTestWithRest
                else {
                    sumState = 'RestTested';
                }
            break;
            case 'TC Completed':
                //in case only one TC attached and positive
                if (oldSumState == '' || oldSumState == 'noRelevantTC') { 
                    sumState = 'PosTested';
                }
            break;
            case 'TC Failed':
                sumState = 'NegTested';
            break;
            case 'TC not to Verify':
                //if Milestone is MS2 and TC is 'TC not to Verify'
            case ' ':
            default:
                // if Test Case State for this Release is empty 
                // it is not relevant for this Release
                // also no other States are considered
                if (oldSumState == '' || oldSumState == 'noRelevantTC' ){
                    sumState = 'noRelevantTC';
                } else {
                    sumState = oldSumState;
                }
            break;
        }
        return sumState;
    }

// ---------------------------------------------------------------------//
// calculate Testing State from linked Test Cases PT1/PT2/PVS States
// ---------------------------------------------------------------------//
    function handleAttachedTCState(ReqMS,ReqTCStatesSum){
        //sum States: noTC, UnTested, NegTested, RestTested, //
        //            PartTested, PartTestWithRest, PosTested, notRelevant//
        var PTsumState = '';
        var slicedReqMS = ReqMS.substring(0,3);

        for (var i = 0; i < ReqTCStatesSum.length; i++) {
            
            switch (slicedReqMS)
                {
                    case 'MS2':
                        PTsumState = handleTCPTState(PTsumState, 'SR2State', ReqTCStatesSum[i]);
                    break;
                    case 'MS3':
                        PTsumState = handleTCPTState(PTsumState, 'SR3State', ReqTCStatesSum[i]);
                    break;
                    case 'MS4':
                        PTsumState = handleTCPTState(PTsumState, 'SR4State', ReqTCStatesSum[i]);
                    break;
                    default:
                    break;
                }
        }
        return PTsumState;
    }

// ---------------------------------------------------------------------//
// combine PT States and TC State to one TestState for the Requirement
// ---------------------------------------------------------------------//
    function combineTestStates(TCState,PTState){
        var combinedState = '';
        if (PTState == 'noRelevantTC'){
            combinedState = TCState;
        } else {
            combinedState = PTState;
        }
        return combinedState;
    }

// ---------------------------------------------------------------------//
// find Affected TestPlatforms and add them to the selector
// ---------------------------------------------------------------------//
    $('tbody tr').each(function() {
        var TestPlatform = $(this).find('td.Affected').text(); //Affected Test Platforms
        handleTestPlatforms(TestPlatform, 'addifnew');
    });
    addTestPlatformsToSelector();
    var selectedTestPlatform = $( "#selected_Test_Platforms" ).val();
// ---------------------------------------------------------------------//
// Main Routine: parse HTML trou tbody > tr
// ---------------------------------------------------------------------//

    $('tbody tr').each(function() {
        var Type = $(this).find('td.Type').text();
        var Milestone = $(this).find('td.Milestone').text();
        var PT1States = $(this).find('td.State.PT1').text();
        var PT2States = $(this).find('td.State.PT2').text();
        var PVSStates = $(this).find('td.State.PVS').text();
        var TestPlatformOfReq = $(this).find('td.Affected').text(); //Affected Test Platforms
        var validTPF = checkPFString(TestPlatformOfReq);
        //aquireProjects(Projects);

        switch($(this).attr('class'))
        {
            case 'scr_header':

                if (activeReq == 'true' && activePFTC == 'false'){
                    AllStatusMask.noTC++;
                    CountPlanningState(ReqMilestone,'noTC');
//                    console.log('Sum State: noTC');
//                    console.log('-------------------------------------------------------------------');
                }
                else if (activeReq == 'true' && activePFTC == 'true'){
                    activeReqTestState = handleActiveReqTestState(activeReqTestStateSum);
                    activeReqPTTestState = handleAttachedTCState(ReqMilestone,attachedTCStatesSum);
                    combinedTestState = combineTestStates(activeReqTestState,activeReqPTTestState);
                    CountPlanningState(ReqMilestone,combinedTestState);
//                    console.log('Sum State:', combinedTestState, '| TC State:', activeReqTestState, '| PT State:',activeReqPTTestState);
//                    console.log('-------------------------------------------------------------------');
                    prev_activeReqTestState = combinedTestState;
                }
                //resetting for new Requirement
                activeReq = 'false';
                activePFTC ='false';
                activeReqTestStateSum = [];
                attachedTCStatesSum = [];
            break;

            case 'scr':
                var State = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                if(Type == 'SOW Requirement' && validTPF == 'valid') {
                    activeReq = 'true';
                    prev_scr_id = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                    ReqMilestone = Milestone;
                    SOWReqCount++;
//                    console.log('SOWID:', prev_scr_id, 'SOW State:', State, 'Planned for:', Milestone);
//                    console.log('-------------------------------------------------------------------');
                }
                else if (Type == 'Test Case'){
                    var TCID = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                    //console.log('TCID:', TCID);
                }
            break;

            case 'platform_test_case':
                var State = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                var pltfm_tc_id = this.getElementsByClassName('ID')[0].childNodes[0].nodeValue;
                var attachedTCStates = {SR2State:'',SR3State:'',SR4State:''};
                if (activeReq == 'true') {
                    PFTCCount++;
                }
                activePFTC = 'true';
                activeReqTestStateSum.push(State);
                attachedTCStates.SR2State = PT1States;
                attachedTCStates.SR3State = PT2States;
                attachedTCStates.SR4State = PVSStates;
                attachedTCStatesSum.push(attachedTCStates);
//              console.log('TCID:', pltfm_tc_id, '| TC State:',State,'| PT1:',PT1States,'| PT2:',PT2States,'| PVS:',PVSStates);
//              console.log(pltfm_tc_id,'| PT1:',PT1States,'| PT2:',PT2States,'| PVS:',PVSStates);

            break;
            default:
            break;
        }
    });

// ---------------------------------------------------------------------//
// general Calculations
// ---------------------------------------------------------------------//

    var posSOWTestCoverage = MS2StatusMask.PosTested + MS2StatusMask.RestTested + MS3StatusMask.PosTested + MS2StatusMask.RestTested + MS4StatusMask.PosTested + MS2StatusMask.RestTested;



// ---------------------------------------------------------------------//
// Print google Charts
// ---------------------------------------------------------------------//

// ---------------------------------------------------------------------//
// Pie Charts
// ---------------------------------------------------------------------//
// Coverage Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawSOWCoverageChart);
    function drawSOWCoverageChart(){
    
        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count'],
            ['positive tested', posSOWTestCoverage],
            ['not tested', SOWReqCount-posSOWTestCoverage]
        ]);

        var options = {
            title: 'Test Coverage',
            width: 600,
            height: 400,
            legend: { position: 'bottom', maxLines: 6 },
            colors: ['#109618', '#DC3912']
        };

        var chart = new google.visualization.PieChart(document.getElementById('SOWCoverageChart'));
        chart.draw(data, options);
    }


// ---------------------------------------------------------------------//
//  Item Overview Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawOverviewChart);
    function drawOverviewChart(){
    
        var data = google.visualization.arrayToDataTable([
            ['Type', 'Count', { role: 'style' }],
            ['SOWs', SOWReqCount, 'red'],
            ['linked TCs', PFTCCount,'green'],
//            ['TCs', TCCount,'green'],
        ]);

        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1,
                         { calc: "stringify",
                           sourceColumn: 1,
                           type: "string",
                           role: "annotation" },
                         2]);

        var options = {
            title: 'Amount of Items',
            width: 600,
            height: 400,
            legend: { position: 'bottom', maxLines: 6 },
            bar: { groupWidth: '50%' },
            pieSliceText: 'value',
            colors: ['#3366CC', '#994499']
        };


        var chart = new google.visualization.PieChart(document.getElementById('OverviewChart'));
        chart.draw(view, options);
    }

// ---------------------------------------------------------------------//
// Bar Charts
// ---------------------------------------------------------------------//
//  Milestone Planning Overview
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawMilestoneChart);
    function drawMilestoneChart(){
    
        var data = google.visualization.arrayToDataTable([
            ['Milestone', 'Count', { role: 'style' }],
            ['SR2', MS2Count, 'color:#109618'],
            ['SR3', MS3Count,'color: #FF9900'],
            ['SR4', MS4Count,'color: #DC3912'],
            ['not planned', noMSplanned,'color: #8B0707']
        ]);

        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1,
                         { calc: "stringify",
                           sourceColumn: 1,
                           type: "string",
                           role: "annotation" },
                         2]);

        var options = {
            title: 'Requirements Planned',
            width: 600,
            height: 400,
            legend: { position: 'bottom', maxLines: 3 },
            bar: { groupWidth: '50%' },
            isStacked: true
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('MilestoneChart'));
        chart.draw(view, options);
    }

// ---------------------------------------------------------------------//
//  Test Coverage over Milestones Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawTestCoverage);
    function drawTestCoverage(){
    
        var data = google.visualization.arrayToDataTable([
            ['Release', 'Req no TC', 'Req negative Tested', 'Req UnTested', 'Req Partially Tested','Req tested with restrictions','PartTestWithRest', 'Req Positive Tested'],
            ['All', AllStatusMask.noTC,AllStatusMask.NegTested,AllStatusMask.UnTested,AllStatusMask.RestTested,AllStatusMask.PartTestWithRest,AllStatusMask.PartTested,AllStatusMask.PosTested],
            ['SR2', MS2StatusMask.noTC,MS2StatusMask.NegTested,MS2StatusMask.UnTested,MS2StatusMask.RestTested,MS2StatusMask.PartTestWithRest,MS2StatusMask.PartTested,MS2StatusMask.PosTested],
            ['SR3', MS3StatusMask.noTC,MS3StatusMask.NegTested,MS3StatusMask.UnTested,MS3StatusMask.RestTested,MS3StatusMask.PartTestWithRest,MS3StatusMask.PartTested,MS3StatusMask.PosTested],
            ['SR4', MS4StatusMask.noTC,MS4StatusMask.NegTested,MS4StatusMask.UnTested,MS4StatusMask.RestTested,MS4StatusMask.PartTestWithRest,MS4StatusMask.PartTested,MS4StatusMask.PosTested],
            ['not planned', MSotherStatusMask.noTC,MSotherStatusMask.NegTested,MSotherStatusMask.UnTested,MSotherStatusMask.RestTested,MSotherStatusMask.PartTestWithRest,MSotherStatusMask.PartTested,MSotherStatusMask.PosTested]
        ]);

//        var view = new google.visualization.DataView(data);
//        view.setColumns([0, 1,
//                         { calc: "stringify",
//                           sourceColumn: 1,
//                           type: "string",
//                           role: "annotation" },
//                         2]);

        var options = {
            title: 'Release Overview',
            width: 600,
            height: 400,
            legend: { position: 'right', maxLines: 3 },
            bar: { groupWidth: '50%' },
            isStacked: true
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('TestCoverage'));
        chart.draw(data, options);
    }
}