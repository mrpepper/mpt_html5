$(document).ready(function() {
    var availableTestPlatforms = [];

// ---------------------------------------------------------------------//
// generate List of available Testplatforms from HTML Table
// ---------------------------------------------------------------------//
    function aquireTestPlatforms(PFString){
        retCode = 'false';
        if(PFString !== '' && PFString !== null && PFString !== '\xa0'){ //\xa0 == &nbsp;
            //Split PFString if there is more than one TestPlatform selected: separated by: ,
            var splitPFString = PFString.split(',');
            for (var i = 0; i < splitPFString.length; i++) {
                var trimedPFString = splitPFString[i].trim();
                if (($.inArray(trimedPFString,availableTestPlatforms)) == -1)
                {
                    availableTestPlatforms.push(trimedPFString);
                    retCode = 'added';
                }
            }
        }
        return retCode;
        }

// ---------------------------------------------------------------------//
// append List of available Testplatforms to HTML selector
// ---------------------------------------------------------------------//
    function addTestPlatformsToSelector(){
        //availableTestPlatforms.push('-All-');

        for (var i = 0; i < availableTestPlatforms.length; i++) {
            availableTestPlatforms.sort();
            //append options to HTML selector for TestPlatforms
            var sel = document.getElementById('selected_Test_Platforms');
            var opt = document.createElement('option');
            opt.innerHTML = availableTestPlatforms[i];
            opt.value = availableTestPlatforms[i];
            sel.appendChild(opt);
        }
        //document.getElementById('selected_Test_Platforms').value = '-All-';
        //test
        //$.each(availableTestPlatforms, function(i,e){
        //    $("#strings option[value='" + e + "']").prop("selected", true);
        //});
        //
    }


// ---------------------------------------------------------------------//
// find Affected TestPlatforms and add them to the selector
// ---------------------------------------------------------------------//
    $('tbody tr').each(function() {
        var TestPlatform = $(this).find('td.Affected').text(); //Affected Test Platforms
        aquireTestPlatforms(TestPlatform);
    });
    addTestPlatformsToSelector();
    $("#selected_Test_Platforms").selectpicker('val', availableTestPlatforms);
    main();

});


// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(){
    var SOWReqCount = 0;
    var TCStateSum = [];
    var attachedTCStatePT1Sum = [];
    var attachedTCStatePT2Sum = [];
    var attachedTCStatePVSSum = [];
    var activeReqTestState = '';
    var activeReqPTTestState = '';
    var ReqMilestone = '';
    var PFTCCount = 0;
    var activeTC = 'false';
    var activeReq = 'false';
    var SOW_id = 0;
    var SOWAffectedTestPlatforms = '';
    var ProjTCTestPlatform = '';
    var PFTCTestPlatform = '';
    var AllStatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS2StatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS3StatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS4StatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MSotherStatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS2PTStatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS3PTStatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS4PTStatusMask = {TCmissing:0,UnTested:0,NegTested:0,RestTested:0,PartTested:0,PartTestWithRest:0,PosTested:0};
    var MS2Count = 0;
    var MS3Count = 0;
    var MS4Count = 0;
    var noMSplanned = 0;
    var PTTCStateSum = [];
    var allTestState = [];
    var selectedTestPlatforms = $( "#selected_Test_Platforms" ).val();
    var selectedSILrelevant = $( "#selected_SIL_relevant" ).val();
    var OverviewTable = [];
    var SOWSubject = '';
    var SOWSIL = '';
    var DepartmentOverview = {};

// ---------------------------------------------------------------------//
// add Table
// ---------------------------------------------------------------------//
    function createTable(tableData) {
        var headingData = ['ID', 'Subject', 'Milestone', 'SIL', 'Test State', 'SR2 Test State', 'SR3 Test State', 'SR4 Test State','Test Platforms'];
        //remove preveous table
        $("#OverviewTable").remove();
        //create the new table
        var table = document.createElement('table');
        table.setAttribute("class", "table table-hover");
        table.setAttribute("id", "OverviewTable");
        table.setAttribute("hidden", "true");

        // Table Heading
        var tableHead = document.createElement('thead');
        tableHead.setAttribute("class", "thead-default");
        var HeadingRow = document.createElement('tr');
        headingData.forEach(function(data) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(data));
            HeadingRow.appendChild(cell);
            tableHead.appendChild(HeadingRow);
        });

        // Table Body
        var tableBody = document.createElement('tbody');
        tableBody.setAttribute("class", "table table-striped");
        tableData.forEach(function(rowData) {
            var row = document.createElement('tr');
            row.setAttribute("class", "clickable-row");
            row.setAttribute("data-href", "integrity://lanwinsvmks1.eu.adglob.net:8001/im/viewissue?selection=884657")

            rowData.forEach(function(cellData) {
                var cell = document.createElement('td');
                cell.appendChild(document.createTextNode(cellData));
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });

        table.appendChild(tableHead);
        table.appendChild(tableBody);
        //document.body.appendChild(table);
        document.getElementById("TableContainer").appendChild(table);

    }


// ---------------------------------------------------------------------//
// Count general Values over the whole HTML Data
// ---------------------------------------------------------------------//


// ---------------------------------------------------------------------//
// check if String is equal to selection
// ---------------------------------------------------------------------//
    function checkString(String,SelectedValue){
        var retCode = 'false';
        var splitString = String.split(',');
        //splitString.push('-All-'); // add -All- to every String so if selection is -All- it allways returns 'valid'
        // check if Array SelectedValue has equal entries to PF String Array
        for (var i in splitString){
            if(SelectedValue.indexOf(splitString[i].trim()) > -1){
                retCode = 'valid';
            }
        }
        return retCode;
    }

// ---------------------------------------------------------------------//
// check if SILString is equal to selection
// ---------------------------------------------------------------------//
    function checkSILString(SILString){
        var retCode = 'false';
        if (selectedSILrelevant == '-All-'){
            retCode = 'true'
        }
        else if (selectedSILrelevant == 'Safety Relevant') {
            if (SILString !== 'QM' && SILString !== 'No' && SILString !== '\xa0' && SILString !== '' ){
                retCode = 'true';
            }
        }
        else if (selectedSILrelevant == 'QM' && SILString == 'QM'){
                retCode = 'true';
        }
        return retCode;
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
        //sum States: TCmissing, UnTested, NegTested, RestTested, //
        //            PartTested, PartTestWithRest, PosTested//
        var sumState = 'TCmissing';
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
                    if (sumState == 'TCmissing') {
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
// calculte Testing State for a Reqirement from linked Test Cases PT Test States
// ---------------------------------------------------------------------//
////    function handleTCPTState(oldSumState, MS, States){
////        var sumState = '';
////        //if Tescase state in this Milstone is 'TC not to Verify' look in previous Milestones.
////        if (States[MS] == 'TC not to Verify' && MS == 'PVSState'){
////            MS = 'PT2State';
////        }
////        else if (States[MS] == 'TC not to Verify' && MS == 'PT2State'){
////            MS = 'PT1State';
////        }
////
////        switch (States[MS])
////        {
////            case 'TC to Verify':
////                if(oldSumState == 'PosTested'){
////                //if posTested and new untested goto PartTested
////                    sumState = 'PartTested';
////                }//if PartTested and new Untested stay at Parttested
////                else if(oldSumState == 'PartTested'){
////                    sumState = 'PartTested';
////                }//if RestTested and new Untested goto PartTestWithRest
////                else if(oldSumState == 'RestTested'){
////                    sumState = 'PartTestWithRest';
////                }//if PartTestWithRest stay at PartTestWithRest
////                else if(oldSumState == 'PartTestWithRest'){
////                    sumState = 'PartTestWithRest';
////                }
////                else {
////                    sumState = 'UnTested';
////                }
////            break;
////            case 'TC Completed with Restriction':
////                if(oldSumState == 'UnTested'){
////                    sumState = 'PartTestWithRest';
////                }//if UnTested goto PartTestWithRest
////                else {
////                    sumState = 'RestTested';
////                }
////            break;
////            case 'TC Completed':
////                //in case only one TC attached and positive
////                if (oldSumState == '' || oldSumState == 'noRelevantTC') {
////                    sumState = 'PosTested';
////                }
////            break;
////            case 'TC Failed':
////                sumState = 'NegTested';
////            break;
////            case 'TC not to Verify':
////                //if Milestone is MS2 and TC is 'TC not to Verify'
////            case ' ':
////            default:
////                // if Test Case State for this Release is empty
////                // it is not relevant for this Release
////                // also no other States are considered
////                if (oldSumState == '' || oldSumState == 'noRelevantTC' ){
////                    sumState = 'noRelevantTC';
////                } else {
////                    sumState = oldSumState;
////                }
////            break;
////        }
////        return sumState;
////    }

// ---------------------------------------------------------------------//
// calculate Testing State from linked Test Cases PT1/PT2/PVS States
// ---------------------------------------------------------------------//
////    function handleAttachedTCState(ReqMS,ReqTCStatesSum){
////        //sum States: TCmissing, UnTested, NegTested, RestTested, //
////        //            PartTested, PartTestWithRest, PosTested, notRelevant//
////        var PTsumState = '';
////        var slicedReqMS = ReqMS.substring(0,3);
////
////        for (var i = 0; i < ReqTCStatesSum.length; i++) {
////
////            switch (slicedReqMS)
////                {
////                    case 'MS2':
////                        PTsumState = handleTCPTState(PTsumState, 'PT1State', ReqTCStatesSum[i]);
////                    break;
////                    case 'MS3':
////                        PTsumState = handleTCPTState(PTsumState, 'PT2State', ReqTCStatesSum[i]);
////                    break;
////                    case 'MS4':
////                        PTsumState = handleTCPTState(PTsumState, 'PVSState', ReqTCStatesSum[i]);
////                    break;
////                    default:
////                    break;
////                }
////        }
////        return PTsumState;
////    }

// ---------------------------------------------------------------------//
// combine PT States and TC State to one TestState for the Requirement
// ---------------------------------------------------------------------//
////    function combineTestStates(TCState,PTState){
////        var combinedState = '';
////        if (PTState == 'noRelevantTC'){
////            combinedState = TCState;
////        } else {
////            combinedState = PTState;
////        }
////        return combinedState;
////    }

// ---------------------------------------------------------------------//
// combine PT States and TC State to one TestState for the Requirement
// ---------------------------------------------------------------------//
    function combinePTTestStates(TestState,PTState){
        for (var key in PTState){
            if (PTState.hasOwnProperty(key) && PTState[key] == 'notRelevant') {
                    PTState[key] = TestState;
            }
        }
        return PTState;
    }

// ---------------------------------------------------------------------//
//count PT Planing States
// ---------------------------------------------------------------------//
    function CountPTPlanningState(ReqMS,PTSum){
        var slicedReqMS = ReqMS.substring(0,3);

        if (PTSum == 'TCmissing'){
            switch (slicedReqMS)
            {
                case 'MS2':
                    MS2PTStatusMask.TCmissing++;
                    MS3PTStatusMask.TCmissing++;
                    MS4PTStatusMask.TCmissing++;
                break;
                case 'MS3':
                    MS3PTStatusMask.TCmissing++;
                    MS4PTStatusMask.TCmissing++;
                break;
                case 'MS4':
                    MS4PTStatusMask.TCmissing++;
                break;
                default:
                break;
            }
        }
        else
        {
            MS2PTStatusMask[PTSum['PT1State']]++;
            MS3PTStatusMask[PTSum['PT2State']]++;
            MS4PTStatusMask[PTSum['PVSState']]++;
        }
    }

// ---------------------------------------------------------------------//
// calculte Testing State for a Reqirement from linked Test Cases PT Test States
// ---------------------------------------------------------------------//
    function handleTCPTStates(ReqMS, SOWTPFstring, TCdata){
        //selectedTestPlatforms
        var sumState = 'notRelevant';
        var finish = 'false';
        var PTsumStates = {PT1State:'',PT2State:'',PVSState:''};
        var PTGens = ['PT1State', 'PT2State', 'PVSState'];
        var slicedReqMS = ReqMS.substring(0,3);
        var PTGenCount = 0;


        //choose PT Generations to analyse, concerning the Requirement Milestone
        switch (slicedReqMS)
        {
            case 'MS2':
                //PTGens = ['PT1State', 'PT2State', 'PVSState'];
                PTGenCount = 0;
            break;
            case 'MS3':
                //PTGens = ['PT2State', 'PVSState'];
                PTGenCount = 1;
            break;
            case 'MS4':
                //PTGens = ['PVSState'];
                PTGenCount = 2;
            break;
        }

        //iterate over all TCs from one SOW, first over one PT generation for every TC then go to next PT generation
        for (var j = PTGenCount; j < PTGens.length; j++) { //Generations


            sumState = 'notRelevant';
            for (var i = 0; i < TCdata.length; i++) { //PT Gen Testresults PT1/PT2/PVS
                var PTState = TCdata[i][PTGens[j]];
                // check if TC is not to verify in current Generation
                // and set to previous gen State if 'TC not to Verify'
                if (j !== 0 && TCdata[i][PTGens[j]] == 'TC not to Verify'){
                    PTState = TCdata[i][PTGens[j-1]];
                    if (j-1 !== 0 && TCdata[i][PTGens[j-1]] == 'TC not to Verify'){
                    PTState = TCdata[i][PTGens[j-2]];
                    }
                }
                //console.log(PTState)
                switch (PTState)
                { //PosTested, PartTested, PartTestWithRest, UnTested, NegTested, TCmissing, notRelevant
                    case 'TC to Verify':
                        switch (sumState)
                        {
                            case 'PosTested':
                                sumState = 'PartTested';
                            break;
                            case 'PartTested':
                                sumState = 'PartTested';
                            break;
                            case 'PartTestWithRest':
                                sumState = 'PartTestWithRest';
                            break;
                            case 'UnTested':
                            case 'notRelevant':
                            default:
                                sumState = 'UnTested';
                            break;
                            case 'NegTested':
                                sumState = 'NegTested'; //not relevant here could be removed?
                            break;
                        }
                    break;
                    case 'TC Completed with Restriction':
                        switch (sumState)
                        {
                            case 'PosTested':
                            case 'PartTested':
                            case 'PartTestWithRest':
                            case 'UnTested':
                            default:
                                sumState = 'PartTestWithRest';
                            break;
                            case 'NegTested':
                                sumState = 'NegTested'; //not relevant here could be removed?
                            break;
                            case 'notRelevant':
                                sumState = 'UnTested';
                            break;
                        }
                    break;
                    case 'TC Completed':
                        //in case only one TC attached and positive
                        if (sumState == 'notRelevant') {
                            sumState = 'PosTested';
                        }
                    break;
                    case 'TC Failed':
                        sumState = 'NegTested';
                        finish = 'true';
                    break;
                    case 'TC not to Verify':
                        //look in previous PT generations!!!
                    default:
                        // if Test Case PT State for this Release is empty
                        // it is not relevant for this Release
                        // also no other States are considered
                        if (sumState == '' || sumState == 'notRelevant' ){
                            sumState = 'notRelevant';
                        } else {
                            sumState = sumState;
                        }
                    break;
                    }
                PTsumStates[PTGens[j]] = sumState;

                if (finish == 'true'){
                    finish = 'false';
                    break; //break inner loop
                }
            }//inner loop
        }//outer loop
        return PTsumStates;
    }

// ---------------------------------------------------------------------//
//Generate Department Overview
// ---------------------------------------------------------------------//
    function generateDepartmentOverview(TestPF){
          retCode = 'false';
          if(TestPF !== '' && TestPF !== null && TestPF !== '\xa0'){ //\xa0 == &nbsp;
              //Split PFString if there is more than one TestPlatform: separated by: ,
              var splitPFString = TestPF.split(',');
              for (var i = 0; i < splitPFString.length; i++) {
                  var cutPFString = splitPFString[i].split('-');
                  DepartmentString = cutPFString[0].trim();

                  if (DepartmentString in DepartmentOverview)
                  {
                      DepartmentOverview[DepartmentString]++;
                  }
                  else
                  {
                      DepartmentOverview[DepartmentString] = 1;
                  }
              }
          }
          return retCode;
    }

// ---------------------------------------------------------------------//
// combined calculation for test states
// ---------------------------------------------------------------------//
    function handleTestStates(ReqMS,TestStates){

    }


// ---------------------------------------------------------------------//
// Main Routine: parse HTML trou tbody > tr
// ---------------------------------------------------------------------//

    $('tbody tr').each(function() {
        var Type = $(this).find('td.Type').text();
        var Milestone = $(this).find('td.Milestone').text();
        var PT1State = $(this).find('td.State.PT1').text();
        var PT2State = $(this).find('td.State.PT2').text();
        var PVSState = $(this).find('td.State.PVS').text();
        var TestPlatformOfReq = $(this).find('td.Affected').text(); //Affected Test Platforms
        var validTPF = checkString(TestPlatformOfReq,selectedTestPlatforms);
        var SILLevelofReq = $(this).find('td.SIL').text();
        var useSILReq = checkSILString(SILLevelofReq);

        switch($(this).attr('class'))
        {
            case 'sow_header':
                if (activeReq == 'true' && activeTC == 'false'){
                    CountPlanningState(ReqMilestone,'TCmissing');
                    CountPTPlanningState(ReqMilestone,'TCmissing');
//                    console.log('Sum State: TCmissing');
//                    console.log('-------------------------------------------------------------------');
                }
                else if (activeReq == 'true' && activeTC == 'true'){
                    //console.log('SOWTPF:', SOWAffectedTestPlatforms,' ProjTC:',ProjTCTestPlatform,' PFTC:',PFTCTestPlatform);

                    //calculate SOW Test Status from TC Test State
                    activeReqTestState = handleActiveReqTestState(TCStateSum);
                    //activeReqPTTestState = handleAttachedTCState(ReqMilestone,PTTCStateSum);
                    //combinedTestState = combineTestStates(activeReqTestState,activeReqPTTestState);
                    CountPlanningState(ReqMilestone,activeReqTestState);
                    // ---------------------------------------------------------------------//

                    //calculate SOW Test Status from PT gen Test States
                    var PTSumState = handleTCPTStates(ReqMilestone, SOWAffectedTestPlatforms, allTCdata);
                    var combinedPTTestStates = combinePTTestStates(activeReqTestState, PTSumState);
                    CountPTPlanningState(ReqMilestone,combinedPTTestStates);
                    // ---------------------------------------------------------------------//

                    //try to combine the calculation for PT Test State and TC Test State in one function
                    //handleTestStates(ReqMilestone,allTCdata);
                    // ---------------------------------------------------------------------//

                    generateDepartmentOverview(SOWAffectedTestPlatforms);

                    OverviewTable.push([SOW_id, SOWSubject, ReqMilestone, SOWSIL, activeReqTestState, PTSumState.PT1State , PTSumState.PT2State, PTSumState.PVSState,SOWAffectedTestPlatforms]);

                    //console.log('Sum State:', combinedTestState, '| TC State:', activeReqTestState, '| PT State:',PTSumState );//activeReqPTTestState
                    //console.log('PT State:',PTSumState );
                    //console.log('-------------------------------------------------------------------');
                }
                //resetting for new Requirement
                PTSumState = [];
                activeReq = 'false';
                activeTC ='false';
                TCStateSum = [];
                allTCdata = [];
            break;

            case 'sow':
                var State = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                if(Type == 'SOW Requirement' && validTPF == 'valid' && useSILReq == 'true') {
                    activeReq = 'true';
                    SOW_id = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                    SOWAffectedTestPlatforms = this.getElementsByClassName('Affected')[0].childNodes[0].nodeValue;
                    SOWSubject = this.getElementsByClassName('Subject')[0].childNodes[0].nodeValue;
                    ReqMilestone = Milestone;
                    SOWReqCount++;
                    SOWSIL = SILLevelofReq;
//                    console.log('SOWID:', SOW_id, 'SOW State:', State, 'Planned for:', Milestone);
//                    console.log('-------------------------------------------------------------------');
                }
                else if (Type == 'Test Case'){
                    var TCID = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                    ProjTCTestPlatform = this.getElementsByClassName('Platform')[0].childNodes[0].nodeValue;
                    //console.log('TCID:', TCID);
                }
            break;

            case 'test_case':
                var State = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                var pltfm_tc_id = this.getElementsByClassName('ID')[0].childNodes[0].nodeValue;
                var PTTCStates = {PT1State:'',PT2State:'',PVSState:''};
                PFTCTestPlatform = this.getElementsByClassName('Platform')[0].childNodes[0].nodeValue;
                if (activeReq == 'true') {
                    PFTCCount++;
                }
                activeTC = 'true';
                TCStateSum.push(State);
                PTTCStates.PT1State = PT1State;
                PTTCStates.PT2State = PT2State;
                PTTCStates.PVSState = PVSState;
                PTTCStateSum.push(PTTCStates);

                TCdata.TCState = State;
                TCdata.PT1State = PT1State;
                TCdata.PT2State = PT2State;
                TCdata.PVSState = PVSState;
                TCdata.TestPF = PFTCTestPlatform;
                allTCdata.push(TCdata);

                //console.log('TCID:', pltfm_tc_id, '| TC State:',State,'|, PT1:',PT1State,'| PT2:',PT2State,'| PVS:',PVSState);
                //console.log('TCID:', pltfm_tc_id, '| TC State:',TCdata.TCState,'|, PT1:',TCdata.PT1State,'| PT2:',TCdata.PT2State,'| PVS:',TCdata.PVSState);

            break;
            default:
            break;
        }
    });

// ---------------------------------------------------------------------//
// general Calculations
// ---------------------------------------------------------------------//

    var posSOWTestCoverage = MS2StatusMask.PosTested + MS2StatusMask.RestTested + MS3StatusMask.PosTested + MS3StatusMask.RestTested + MS4StatusMask.PosTested + MS4StatusMask.RestTested;
    createTable(OverviewTable);
    //console.log(DepartmentOverview)
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
            ['Positive Tested and Tested with Restrictions', posSOWTestCoverage],
            ['other states', SOWReqCount-posSOWTestCoverage]
        ]);

        var options = {
            title: 'Test Coverage',
            width: 600,
            height: 400,
            legend: { position: 'right',alignment: 'center', maxLines: 3 },
            chartArea: {left:80, bottom:20},
            colors: ['#109618', '#DC3912']
        };

        var chart = new google.visualization.PieChart(document.getElementById('SOWCoverageChart'));
        chart.draw(data, options);
    }


// ---------------------------------------------------------------------//
//  Item Overview Chart
// ---------------------------------------------------------------------//
//    google.charts.setOnLoadCallback(drawOverviewChart);
//    function drawOverviewChart(){
//
//        var data = google.visualization.arrayToDataTable([
//            ['Type', 'Count', { role: 'style' }],
//            ['SOWs', SOWReqCount, 'red'],
//            ['linked TCs', PFTCCount,'green'],
//        ]);
//
//        var view = new google.visualization.DataView(data);
//        view.setColumns([0, 1,
//                         { calc: "stringify",
//                           sourceColumn: 1,
//                           type: "string",
//                           role: "annotation" },
//                         2]);
//
//        var options = {
//            title: 'Amount of Items',
//            width: 600,
//            height: 400,
//            legend: { position: 'right', alignment: 'center', maxLines: 3 },
//            chartArea: {left:80, bottom:20},
//            bar: { groupWidth: '50%' },
//            pieSliceText: 'value',
//            colors: ['#3366CC', '#994499']
//        };
//
//
//        var chart = new google.visualization.PieChart(document.getElementById('ItemOverviewChart'));
//        chart.draw(view, options);
//    }

// ---------------------------------------------------------------------//
// Bar Charts
// ---------------------------------------------------------------------//
//  Milestone Planning Overview
// ---------------------------------------------------------------------//
//    google.charts.setOnLoadCallback(drawMilestoneChart);
//    function drawMilestoneChart(){
//
//        var data = google.visualization.arrayToDataTable([
//            ['Milestone', 'Count', { role: 'style' }],
//            ['SR2', MS2Count, 'color:#109618'],
//            ['SR3', MS3Count,'color: #FF9900'],
//            ['SR4', MS4Count,'color: #DC3912'],
//            ['not planned', noMSplanned,'color: #8B0707']
//        ]);
//
//        var view = new google.visualization.DataView(data);
//        view.setColumns([0, 1,
//                         { calc: "stringify",
//                           sourceColumn: 1,
//                           type: "string",
//                           role: "annotation" },
//                         2]);
//
//        var options = {
//            title: 'Requirements Planned',
//            width: 500,
//            height: 500,
//            legend: { position: 'bottom', maxLines: 3 },
//            bar: { groupWidth: '50%' },
//            isStacked: true
//        };
//        var chart = new google.visualization.ColumnChart(document.getElementById('MilestoneChart'));
//        chart.draw(view, options);
//    }
// ---------------------------------------------------------------------//
//  Department Overview
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawDepartmentChart);
    function drawDepartmentChart(){
        var data = new google.visualization.DataTable()
        data.addColumn('string', 'Dep');
        data.addColumn('number', 'count');
        var testarray = [];
//        data.addRows(DepartmentOverview.length)
        for (var key in DepartmentOverview) {
            testarray.push([key, DepartmentOverview[key]]);
//            console.log(testarray)
            //data.addRow([key, DepartmentOverview[key]]);
//            console.log(data);
        }
        data.addRows(testarray);



        var view = new google.visualization.DataView(data);
        //view.setColumns([0, 1,
        //                 { calc: "stringify",
        //                   sourceColumn: 1,
        //                   type: "string",
        //                   role: "annotation" },
        //                 2]);

        var options = {
            title: 'Department Overview',
            width: 800,
            height: 400,
            legend: { position: 'right', maxLines: 3 },
            bar: { groupWidth: '50%' },
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('DepartmentOverview'));
        chart.draw(view, options);
    }

// ---------------------------------------------------------------------//
//  Test Coverage over Milestones Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawTestCoverage);
    function drawTestCoverage(){

        var data = [
            ['Release', 'Test Case missing', 'negative tested', 'untested', 'partially tested','tested with restrictions','part tested with restrictions', 'positive tested'],
//            ['All', AllStatusMask.TCmissing,AllStatusMask.NegTested,AllStatusMask.UnTested,AllStatusMask.RestTested,AllStatusMask.PartTestWithRest,AllStatusMask.PartTested,AllStatusMask.PosTested],
            ['SR2', MS2StatusMask.TCmissing,MS2StatusMask.NegTested,MS2StatusMask.UnTested,MS2StatusMask.RestTested,MS2StatusMask.PartTestWithRest,MS2StatusMask.PartTested,MS2StatusMask.PosTested],
            ['SR3', MS3StatusMask.TCmissing,MS3StatusMask.NegTested,MS3StatusMask.UnTested,MS3StatusMask.RestTested,MS3StatusMask.PartTestWithRest,MS3StatusMask.PartTested,MS3StatusMask.PosTested],
            ['SR4', MS4StatusMask.TCmissing,MS4StatusMask.NegTested,MS4StatusMask.UnTested,MS4StatusMask.RestTested,MS4StatusMask.PartTestWithRest,MS4StatusMask.PartTested,MS4StatusMask.PosTested]
        ];
        var aggregates = ["State", "Release"];
        var metrics = ["SOWs"];

        var options = {
            title: 'Planned SOWs with Test State',
            width: 1000,
            height: 400,
            legend: { position: 'right', alignment: 'center', maxLines: 3 },
            chartArea: {left:80, bottom:20, width:"60%", height:"70%"},
            bar: { groupWidth: '50%' },
            //isStacked: true
        };

        var dataTable = google.visualization.arrayToDataTable(data);
        //Formatters
        var intergerFormatter = new google.visualization.NumberFormat({
            groupingSymbol: ",",
            fractionDigits: 0
        });
        for (var i = 0; i < data[0].length; i++) {
            intergerFormatter.format(dataTable, i);
        }

        var view = new google.visualization.DataView(dataTable);
        var cols = [0];
        for (var i = 1; i < data[0].length; i++) {
            cols.push({
                sourceColumn: i,
                type: "number",
                label: data[0][i]
            });
            cols.push({
                calc: "stringify",
                sourceColumn: i,
                type: "string",
                role: "annotation"
            });
            cols.push({
                calc: createTooltip(i),
                /*(function(i) {
                      return function(dataTable, row){
                        return "Url count" + dataTable.getValue(row, i)+"</b>";
                    };
                 })(i),*/
                type: "string",
                role: "tooltip",
                p: { html: true }
            });
        }
        view.setColumns(cols);
        var chart = new google.visualization.ColumnChart(document.getElementById('TestCoverage'));
        chart.draw(view, options);

        function createTooltip(col) {
        return function(dataTable, row) {
            var html = "";
            html += aggregates[0] + ": " + dataTable.getColumnLabel(col) + "\n";
            html += aggregates[1] + ": " + dataTable.getValue(row, 0) + "\n";
            html +=
            metrics[0] +
            ": " +
            intergerFormatter.formatValue(dataTable.getValue(row, col)) +
            "\n";
            return html;
            };
        }
    }

// ---------------------------------------------------------------------//
//  Test Coverage over Milestones Chart
// ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawPTCoverage);
    function drawPTCoverage(){

//        var data = google.visualization.arrayToDataTable([
//            ['Release', 'Test Case missing', 'negative tested', 'untested', 'partially tested','tested with restrictions','part tested with restrictions', 'positive tested'],
//            ['SR2', MS2PTStatusMask.TCmissing,MS2PTStatusMask.NegTested,MS2PTStatusMask.UnTested,MS2PTStatusMask.RestTested,MS2PTStatusMask.PartTestWithRest,MS2PTStatusMask.PartTested,MS2PTStatusMask.PosTested],
//            ['SR3', MS3PTStatusMask.TCmissing,MS3PTStatusMask.NegTested,MS3PTStatusMask.UnTested,MS3PTStatusMask.RestTested,MS3PTStatusMask.PartTestWithRest,MS3PTStatusMask.PartTested,MS3PTStatusMask.PosTested],
//            ['SR4', MS4PTStatusMask.TCmissing,MS4PTStatusMask.NegTested,MS4PTStatusMask.UnTested,MS4PTStatusMask.RestTested,MS4PTStatusMask.PartTestWithRest,MS4PTStatusMask.PartTested,MS4PTStatusMask.PosTested],
//        ]);
        var data = [
            ['Release', 'Test Case missing', 'negative tested', 'untested', 'partially tested','tested with restrictions','part tested with restrictions', 'positive tested'],
            ['SR2', MS2PTStatusMask.TCmissing,MS2PTStatusMask.NegTested,MS2PTStatusMask.UnTested,MS2PTStatusMask.RestTested,MS2PTStatusMask.PartTestWithRest,MS2PTStatusMask.PartTested,MS2PTStatusMask.PosTested],
            ['SR3', MS3PTStatusMask.TCmissing,MS3PTStatusMask.NegTested,MS3PTStatusMask.UnTested,MS3PTStatusMask.RestTested,MS3PTStatusMask.PartTestWithRest,MS3PTStatusMask.PartTested,MS3PTStatusMask.PosTested],
            ['SR4', MS4PTStatusMask.TCmissing,MS4PTStatusMask.NegTested,MS4PTStatusMask.UnTested,MS4PTStatusMask.RestTested,MS4PTStatusMask.PartTestWithRest,MS4PTStatusMask.PartTested,MS4PTStatusMask.PosTested],
        ];

        var aggregates = ["State", "Release"];
        var metrics = ["SOWs"];

        var options = {
            title: 'SOWs Test Status for PT Generations',
            width: 1000,
            height: 400,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:80, bottom:20, width:"60%", height:"70%"},
            bar: { groupWidth: '50%' },
            //isStacked: true
        };

        var dataTable = google.visualization.arrayToDataTable(data);
        //Formatters
        var intergerFormatter = new google.visualization.NumberFormat({
            groupingSymbol: ",",
            fractionDigits: 0
        });
        for (var i = 0; i < data[0].length; i++) {
            intergerFormatter.format(dataTable, i);
        }

        var view = new google.visualization.DataView(dataTable);
        var cols = [0];
        for (var i = 1; i < data[0].length; i++) {
            cols.push({
                sourceColumn: i,
                type: "number",
                label: data[0][i]
            });
            cols.push({
                calc: "stringify",
                sourceColumn: i,
                type: "string",
                role: "annotation"
            });
            cols.push({
                calc: createTooltip(i),
                /*(function(i) {
                      return function(dataTable, row){
                        return "Url count" + dataTable.getValue(row, i)+"</b>";
                    };
                 })(i),*/
                type: "string",
                role: "tooltip",
                p: { html: true }
            });
        }
        view.setColumns(cols);
        var chart = new google.visualization.ColumnChart(document.getElementById('PTCoverage'));
        chart.draw(view, options);

        function createTooltip(col) {
        return function(dataTable, row) {
            var html = "";
            html += aggregates[0] + ": " + dataTable.getColumnLabel(col) + "\n";
            html += aggregates[1] + ": " + dataTable.getValue(row, 0) + "\n";
            html +=
            metrics[0] +
            ": " +
            intergerFormatter.formatValue(dataTable.getValue(row, col)) +
            "\n";
            return html;
            };
        }
    }
}
