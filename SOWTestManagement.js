$(document).ready(function() {
    var availableTestPlatforms = [];
    var availableVariants = [];
    var availableCustomer = [];

    // ---------------------------------------------------------------------//
    // generate List of Items
    // ---------------------------------------------------------------------//
    function aquireStrings(String,Array){
        retCode = 'false';
        if(String !== '' && String !== null){ //\xa0 == &nbsp; -> old code: "&& String !== '\xa0'"
            //Split String if there is more than one String: separated by: ,
            var splitString = String.split(',');
            for (var i = 0; i < splitString.length; i++) {
                var trimedString = splitString[i].trim();
                if (($.inArray(trimedString,Array)) == -1)
                {
                    Array.push(trimedString);
                    retCode = 'added';
                }
            }
        }
        return retCode;
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
        var TestPlatform = $(this).find('td.Affected').text(); //Affected Test Platforms
        var Variants = $(this).find('td.Variant').text(); //Variants
        var Customer = $(this).find('td.Customer').text(); //Variants
        aquireStrings(TestPlatform,availableTestPlatforms);
        aquireStrings(Variants,availableVariants);
        aquireStrings(Customer,availableCustomer);
    });

    addToSelector('selected_Test_Platforms', availableTestPlatforms);
    $("#selected_Test_Platforms").selectpicker('val', availableTestPlatforms);
    addToSelector('selected_Variant', availableVariants);
    $("#selected_Variant").selectpicker('val', availableVariants);
    addToSelector('selected_Customer', availableCustomer);
    $("#selected_Customer").selectpicker('val', availableCustomer);
    main();

});


// ---------------------------------------------------------------------//
// Main Function
// ---------------------------------------------------------------------//
function main(){
    var SOWReqCount = 0;
    var TCStateSum = [];
    var TCdata = {TCState:'',PT1State:'',PT2State:'',TestPF:''};
    var allTCdata = [];
    var attachedTCStatePT1Sum = [];
    var attachedTCStatePT2Sum = [];
    var attachedTCStatePVSSum = [];
    var activeReqTestState = '';
    var activeReqPTTestState = '';
    var ReqMilestone = '';
    var activeTC = false;
    var activeReq = false;
    var SOWid = 0;
    var SOWAffectedTestPlatforms = '';
    var SOWVariant = '';
    var ProjTCTestPlatform = '';
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
    var selectedVariants = $( "#selected_Variant" ).val();
    var selectedCustomer = $( "#selected_Customer" ).val();
    var OverviewTable = [];
    var SOWSubject = '';
    var SOWSIL = '';
    var DepartmentOverview = {};


    // ---------------------------------------------------------------------//
    // create Table
    // ---------------------------------------------------------------------//
    function createTable(tableData) {
        var headingData = ['ID', 'Subject', 'Milestone', 'SIL', 'SR2 Test State', 'SR3 Test State', 'SR4 Test State','Test Platforms','Variant'];
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
        ////////////dblue    , red     , rose    ,orange   ,kaki     ,lgreen    ,dgreen
        //colors : ['#3366CC','#DC3912','#DD4477','#FF9900','#AAAA11','#66AA00','#109618']
        var context = "";
        switch (State)
        {
            case 'TCmissing':
                context = "#3366CC"; //blue
            break;
            case 'NegTested':
                context = "#DC3912"; //red
            break;
            case 'UnTested':
                context = "#DD4477"; //rose
            break;
            case 'PartTestWithRest':
                context = "#FF9900"; //orange
            break;
            case 'RestTested':
                context = "#AAAA11"; //kaki
            break;
            case 'PartTested':
                context = "#66AA00"; //lgreen
            break;
            case 'PosTested':
                context = "#109618"; //dgreen
            break;
            default:
                context = "#FFFFFF"; //white
            break;
        }
        return context;
    }
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
            retCode = 'valid'
        }
        else if (selectedSILrelevant == 'Safety Relevant') {
            if (SILString !== 'QM' && SILString !== 'No' && SILString !== '\xa0' && SILString !== '' ){
                retCode = 'valid';
            }
        }
        else if (selectedSILrelevant == 'QM' && SILString == 'QM'){
                retCode = 'valid';
        }
        return retCode;
    }
    // ---------------------------------------------------------------------//
    // reduce Array
    // ---------------------------------------------------------------------//
    function reduceArray(removefromArray, deleterArray, removeIfNOTInDeleterArray){
        if(typeof removefromArray == 'undefined'){
            removefromArray = [];
        }
        else if (removeIfNOTInDeleterArray == false) {
            for (var j in deleterArray){
                if(removefromArray.indexOf(deleterArray[j]) > -1){
                    var pos = removefromArray.indexOf(deleterArray[j]);
                    removefromArray.splice(pos,1);
                }
            }
        }
        else if (removeIfNOTInDeleterArray == true){
            var removedArray = [];
            for (var i in removefromArray){
                if (deleterArray.indexOf(removefromArray[i]) > -1 ){
                    removedArray.push(removefromArray[i]);
                }
            }
            removefromArray = removedArray;
        }
        return removefromArray;
    }
    // ---------------------------------------------------------------------//
    // String to Array
    // ---------------------------------------------------------------------//
    function stringtoArray(String,Separator){
        if(String !== '' && String !== null && String !== '\xa0'){ //\xa0 == &nbsp;
            //Split String if there is more than one entry: separated by: Separator
            var Array = String.split(Separator);
            for (var i = 0; i < Array.length; i++) {
                Array[i] = Array[i].trim();
            }
        }
        return Array;
    }
    // ---------------------------------------------------------------------//
    // Add  to Array if new
    // ---------------------------------------------------------------------//
    function addtoArray(Array,Value){
        if(Array.indexOf(Value) == -1){
            Array.push(Value);
        }
        return Array;
    }
    // ---------------------------------------------------------------------//
    //count Values and store in SumObject
    // ---------------------------------------------------------------------//
    function countValue(Value, SumObject){
          retCode = 'false';
          if(Value !== '' && Value !== null && Value !== '\xa0'){ //\xa0 == &nbsp;
              //Split PFString if there is more than one TestPlatform: separated by: ,
              var splitString = Value.split(',');
              for (var i = 0; i < splitString.length; i++) {
                  var trimmedString = splitString[i].trim();
                  if (trimmedString in SumObject)
                  {
                      SumObject[trimmedString]++;
                  }
                  else
                  {
                      SumObject[trimmedString] = 1;
                  }
              }
          }
          return SumObject;
    }
    // ---------------------------------------------------------------------//
    //Generate Department Overview
    // ---------------------------------------------------------------------//
    function CountDepStrings(TestPF, SumObject){

          if(TestPF !== '' && TestPF !== null && TestPF !== '\xa0'){ //\xa0 == &nbsp;
              //Split PFString if there is more than one TestPlatform: separated by: ,
              var PFString = TestPF.split(',');
              //only take the first part of the TestPF String and trim away the spaces eg.: "EEE"
              PFString.forEach(function(element,ind,Array){
                  var split = Array[ind].split("-");
                  Array[ind] = split[0].trim();
              });
              //remove duplicates and write to new Array: uniqueNames
              var uniqueElements = [];
              PFString.forEach(function(element,ind,Array){
                  if($.inArray(element, uniqueElements) === -1) uniqueElements.push(element);
              });
              //count the Department strings and write to SumObject
              uniqueElements.forEach(function(element,ind,Array){
                  if (element in SumObject) { SumObject[element]++; }
                  else {SumObject[element] = 1; }
              });
          }
          return SumObject;
    }
    // ---------------------------------------------------------------------//
    // Handling Test States
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
    // Handling PTStates
    // ---------------------------------------------------------------------//
    // count PT Planing States
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
        var collectedTCTPFs = [];
        // collectTestplatform from SOW
        var SOWTPFs = stringtoArray(SOWTPFstring,",");


        //collect Testplatforms from Test Cases and add to array if New
        for (var i = 0; i < TCdata.length; i++) {
            collectedTCTPFs = addtoArray(collectedTCTPFs, TCdata[i].TestPF);
        }
        //reduce Array by items from TPF selection from the menu
        var TCTPFredbySelection = reduceArray(collectedTCTPFs, selectedTestPlatforms,true);
        var SOWTPFredbySelction = reduceArray(SOWTPFs,selectedTestPlatforms,true);
        //how many Testplatforms from SOW are not covered by Testplatforms from Testcase
        var TPFsleft = reduceArray(SOWTPFredbySelction,TCTPFredbySelection,false);


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

        //check for TC with no PT States and substitute with TCState
        for (var i = 0; i < TCdata.length; i++) {
            var Gens = ['PT1State', 'PT2State', 'PVSState'];
            var count = 0;
            for (var j in Gens){
                if(TCdata[i][Gens[j]] == '' || TCdata[i][Gens[j]] == null || TCdata[i][Gens[j]] == '\xa0'){ //\xa0 == &nbsp;
                    count++;
                }
            }
            if (count == 3){
                for (var k in Gens){
                    if(TCdata[i].TCState == 'TC New' || TCdata[i].TCState == 'TC Specified' || TCdata[i].TCState == 'TC on Work' || TCdata[i].TCState == 'TC Retest'){
                        TCdata[i][Gens[k]] = 'TC to Verify';
                    } else {
                        TCdata[i][Gens[k]] = TCdata[i].TCState;
                    }
                }
            }
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


        // in case SOW Affected Testplatform Contains a Testplatform that was not included in the Test Cases, set the Status to 'TCmissing'
        if (TPFsleft.length > 0){
            for (var key in PTsumStates) {
                if(PTsumStates[key] == 'NegTested')
                {
                    PTsumStates[key] = 'NegTested';
                } else if(PTsumStates[key] == '')
                {
                    PTsumStates[key] = '';
                } else
                {
                    PTsumStates[key] = 'TCmissing';
                }
            }
        }

        CountPTPlanningState(ReqMS,PTsumStates);

        return PTsumStates;
    }

    // ---------------------------------------------------------------------//
    // Add PTSum State "TC missing" for Requirements Table
    // ---------------------------------------------------------------------//
    function handleEmptyPTStates(ReqMS){
        var PTSumState = {PT1State:'',PT2State:'',PVSState:''};
        var slicedReqMS = ReqMS.substring(0,3);
        switch (slicedReqMS)
        {
            case 'MS2':
                PTSumState.PT1State = "TCmissing";
                PTSumState.PT2State = "TCmissing";
                PTSumState.PVSState = "TCmissing";
            break;
            case 'MS3':
                PTSumState.PT2State = "TCmissing";
                PTSumState.PVSState = "TCmissing";
            break;
            case 'MS4':
                PTSumState.PVSState = "TCmissing";
            break;
            default:
            break;
        }
        return PTSumState;
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
        var VariantOfReq = $(this).find('td.Variant').text(); //Affected Test Platforms
        var validVariant = checkString(VariantOfReq,selectedVariants);
        var SILLevelofReq = $(this).find('td.SIL').text();
        var validSILReq = checkSILString(SILLevelofReq);
        var CustomerOfReq = $(this).find('td.Customer').text(); //Affected Test Platforms
        var validCustomer = checkString(CustomerOfReq,selectedCustomer);

        switch($(this).attr('class'))
        {
            case 'sow_header':
                if (activeReq  && !activeTC){
                    CountPlanningState(ReqMilestone,'TCmissing');
                    CountPTPlanningState(ReqMilestone,'TCmissing');
                    var PTSumState = handleEmptyPTStates(ReqMilestone);
                    //console.log('Sum State: TCmissing');
                    //console.log('-------------------------------------------------------------------');

                    //generate DepartmentOverview
                    DepartmentOverview = CountDepStrings(SOWAffectedTestPlatforms, DepartmentOverview);
                    OverviewTable.push([SOWid, SOWSubject, ReqMilestone, SOWSIL, PTSumState.PT1State , PTSumState.PT2State, PTSumState.PVSState,SOWAffectedTestPlatforms, SOWVariant]);
                }
                else if (activeReq && activeTC){
                    //console.log('SOWTPF:', SOWAffectedTestPlatforms,' ProjTC:',ProjTCTestPlatform,');

                    //calculate SOW Test Status from TC Test State
                    activeReqTestState = handleActiveReqTestState(TCStateSum);
                    CountPlanningState(ReqMilestone,activeReqTestState);

                    //calculate SOW Test Status from PT gen Test States
                    var PTSumState = handleTCPTStates(ReqMilestone, SOWAffectedTestPlatforms, allTCdata);

                    //generate DepartmentOverview
                    DepartmentOverview = CountDepStrings(SOWAffectedTestPlatforms, DepartmentOverview);
                    OverviewTable.push([SOWid, SOWSubject, ReqMilestone, SOWSIL, PTSumState.PT1State , PTSumState.PT2State, PTSumState.PVSState,SOWAffectedTestPlatforms, SOWVariant]);
                    //console.log('SOW ID:', SOWid, '| PT State:',PTSumState );
                    //console.log('-------------------------------------------------------------------');
                }
                //resetting for new Requirement
                PTSumState = [];
                activeReq = false;
                activeTC = false ;
                TCStateSum = [];
                allTCdata = [];
            break;

            case 'sow':
                if(Type == 'SOW Requirement' && validTPF == 'valid' && validSILReq == 'valid' && validVariant == 'valid' && validCustomer == 'valid') {
                    activeReq = true;
                    SOWid = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                    SOWAffectedTestPlatforms = this.getElementsByClassName('Affected')[0].childNodes[0].nodeValue;
                    SOWSubject = this.getElementsByClassName('Subject')[0].childNodes[0].nodeValue;
                    SOWVariant = this.getElementsByClassName('Variant')[0].childNodes[0].nodeValue;

                    ReqMilestone = Milestone;
                    SOWReqCount++;
                    SOWSIL = SILLevelofReq;
                    //var SOWState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                    //console.log('SOWID:', SOWid, 'Planned for:', ReqMilestone, 'AffectedTPFs:', SOWAffectedTestPlatforms, 'Variant', SOWVariant);
                    //console.log('-------------------------------------------------------------------');
                }
                else if (Type == 'Test Case'){
                    var TCid = this.getElementsByClassName('ID')[1].childNodes[0].nodeValue;
                    ProjTCTestPlatform = this.getElementsByClassName('Platform')[0].childNodes[0].nodeValue;
                    //console.log('TCid:', TCid);
                }
            break;

            case 'test_case':
                var TCid = this.getElementsByClassName('ID')[0].childNodes[0].nodeValue;
                var TestPlatformOfTC = $(this).find('td.Platform').text(); //Test Platform
                var PTTCStates = {PT1State:'',PT2State:'',PVSState:''};
                var validTCTPF = checkString(TestPlatformOfTC,selectedTestPlatforms);
                //activeTC = false;

                if (validTCTPF == 'valid'){
                    TCdata.TCState = this.getElementsByClassName('State')[0].childNodes[0].nodeValue;
                    TCdata.TestPF = this.getElementsByClassName('Platform')[0].childNodes[0].nodeValue;

                    TCdata.PT1State = PT1State;
                    TCdata.PT2State = PT2State;
                    TCdata.PVSState = PVSState;

                    TCStateSum.push(TCdata.TCState);
                    allTCdata.push(TCdata);
                    //if (activeReq == true){
                    //    console.log('|TPF:', TestPlatformOfTC, 'TCid:', TCid, '| TC State:',TCdata.TCState,'|, PT1:',TCdata.PT1State,'| PT2:',TCdata.PT2State,'| PVS:',TCdata.PVSState);
                    //}
                    TCdata = [];
                    activeTC = true;
                }
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
            width: 400,
            height: 400,
            legend: { position: 'right',alignment: 'center', maxLines: 3 },
            chartArea: {left:30, bottom:30},
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
        var dataTable = new google.visualization.DataTable()
        dataTable.addColumn('string', 'Dep');
        dataTable.addColumn('number', 'count');
        var TableArray = [];

        for (var key in DepartmentOverview) {
            TableArray.push([key, DepartmentOverview[key]]);
        }
        dataTable.addRows(TableArray);

        var view = new google.visualization.DataView(dataTable);
        // ---------------------------------------------------------------------//
        var cols = [0];
        cols.push({
            sourceColumn: 1,
            type: "number",
        });
        cols.push({
            calc: "stringify",
            sourceColumn: 1,
            type: "string",
            role: "annotation"
        });
        var view = new google.visualization.DataView(dataTable);
        view.setColumns(cols);
        //---------------------------------------------------------------------//

        var options = {
            title: 'Department Overview',
            width: 400,
            height: 400,
            legend: "none",
            chartArea: {left:50, bottom:30, width:"70%", height:"70%"},
            bar: { groupWidth: '50%' },
        };




        var chart = new google.visualization.ColumnChart(document.getElementById('DepartmentOverview'));
        chart.draw(view, options);
    }

    // ---------------------------------------------------------------------//
    //  Test Coverage over Milestones Chart
    // ---------------------------------------------------------------------//
    //google.charts.setOnLoadCallback(drawTestCoverage);
    //function drawTestCoverage(){
//
    //    var data = [
    //        ['Release', 'Test Case missing', 'negative tested', 'untested', 'partially tested','tested with restrictions','part tested with restrictions', 'positive tested'],
    //        //['All', AllStatusMask.TCmissing,AllStatusMask.NegTested,AllStatusMask.UnTested,AllStatusMask.RestTested,AllStatusMask.PartTestWithRest,AllStatusMask.PartTested,AllStatusMask.PosTested],
    //        ['SR2', MS2StatusMask.TCmissing,MS2StatusMask.NegTested,MS2StatusMask.UnTested,MS2StatusMask.RestTested,MS2StatusMask.PartTestWithRest,MS2StatusMask.PartTested,MS2StatusMask.PosTested],
    //        ['SR3', MS3StatusMask.TCmissing,MS3StatusMask.NegTested,MS3StatusMask.UnTested,MS3StatusMask.RestTested,MS3StatusMask.PartTestWithRest,MS3StatusMask.PartTested,MS3StatusMask.PosTested],
    //        ['SR4', MS4StatusMask.TCmissing,MS4StatusMask.NegTested,MS4StatusMask.UnTested,MS4StatusMask.RestTested,MS4StatusMask.PartTestWithRest,MS4StatusMask.PartTested,MS4StatusMask.PosTested]
    //    ];
    //    var aggregates = ["State", "Release"];
    //    var metrics = ["SOWs"];
//
    //    var options = {
    //        title: 'Test States over Milestones',
    //        width: 600,
    //        height: 400,
    //        legend: { position: 'right', alignment: 'center', maxLines: 3 },
    //        chartArea: {left:80, bottom:20, width:"60%", height:"70%"},
    //        bar: { groupWidth: '50%' },
    //        //////////dblue    , red     , rose    ,orange   ,kaki     ,lgreen    ,dgreen
    //        colors : ['#3366CC','#DC3912','#DD4477','#FF9900','#AAAA11','#66AA00','#109618']
    //        //isStacked: true
    //    };
//
    //    var dataTable = google.visualization.arrayToDataTable(data);
    //    //Formatters
    //    var integerFormater = new google.visualization.NumberFormat({
    //        groupingSymbol: ",",
    //        fractionDigits: 0
    //    });
    //    for (var i = 0; i < data[0].length; i++) {
    //        integerFormater.format(dataTable, i);
    //    }
//
    //    var view = new google.visualization.DataView(dataTable);
    //    var cols = [0];
    //    for (var i = 1; i < data[0].length; i++) {
    //        cols.push({
    //            sourceColumn: i,
    //            type: "number",
    //            label: data[0][i]
    //        });
    //        cols.push({
    //            calc: "stringify",
    //            sourceColumn: i,
    //            type: "string",
    //            role: "annotation"
    //        });
    //        cols.push({
    //            calc: createTooltip(i),
    //            /*(function(i) {
    //                  return function(dataTable, row){
    //                    return "Url count" + dataTable.getValue(row, i)+"</b>";
    //                };
    //             })(i),*/
    //            type: "string",
    //            role: "tooltip",
    //            p: { html: true }
    //        });
    //    }
    //    view.setColumns(cols);
//  //      var chart = new google.visualization.ColumnChart(document.getElementById('TestCoverage'));
    //    //chart.draw(view, options);
//
    //    function createTooltip(col) {
    //    return function(dataTable, row) {
    //        var html = "";
    //        html += aggregates[0] + ": " + dataTable.getColumnLabel(col) + "\n";
    //        html += aggregates[1] + ": " + dataTable.getValue(row, 0) + "\n";
    //        html +=
    //        metrics[0] +
    //        ": " +
    //        integerFormater.formatValue(dataTable.getValue(row, col)) +
    //        "\n";
    //        return html;
    //        };
    //    }
    //}

    // ---------------------------------------------------------------------//
    //  Test Coverage over Milestones Chart
    // ---------------------------------------------------------------------//
    google.charts.setOnLoadCallback(drawPTCoverage);
    function drawPTCoverage(){

        var data = [
            ['Release', 'Test Case missing'  ,'negative tested'        ,'untested'              ,'partially tested with restrictions','tested with restrictions','part tested'             ,'positive tested'],
            ['SR2', MS2PTStatusMask.TCmissing,MS2PTStatusMask.NegTested,MS2PTStatusMask.UnTested,MS2PTStatusMask.PartTestWithRest    ,MS2PTStatusMask.RestTested,MS2PTStatusMask.PartTested,MS2PTStatusMask.PosTested],
            ['SR3', MS3PTStatusMask.TCmissing,MS3PTStatusMask.NegTested,MS3PTStatusMask.UnTested,MS3PTStatusMask.PartTestWithRest    ,MS3PTStatusMask.RestTested,MS3PTStatusMask.PartTested,MS3PTStatusMask.PosTested],
            ['SR4', MS4PTStatusMask.TCmissing,MS4PTStatusMask.NegTested,MS4PTStatusMask.UnTested,MS4PTStatusMask.PartTestWithRest    ,MS4PTStatusMask.RestTested,MS4PTStatusMask.PartTested,MS4PTStatusMask.PosTested],
        ];

        var aggregates = ["State", "Release"];
        var metrics = ["SOWs"];

        var options = {
            title: 'PT Test States over Milestones',
            width: 700,
            height: 400,
            legend: { position: 'right', alignment: 'center', maxLines: 6 },
            chartArea: {left:50, bottom:30, width:"70%", height:"70%"},
            bar: { groupWidth: '50%' },
            //////////dblue    , red     , rose    ,orange   ,kaki     ,lgreen    ,dgreen
            colors : ['#3366CC','#DC3912','#DD4477','#FF9900','#AAAA11','#66AA00','#109618']
            //isStacked: true
        };

        var dataTable = google.visualization.arrayToDataTable(data);
        //Formatters
        var integerFormater = new google.visualization.NumberFormat({
            groupingSymbol: ",",
            fractionDigits: 0
        });
        for (var i = 0; i < data[0].length; i++) {
            integerFormater.format(dataTable, i);
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
            integerFormater.formatValue(dataTable.getValue(row, col)) +
            "\n";
            return html;
            };
        }
    }
}
