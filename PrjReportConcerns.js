$(document).ready(function() { 
	
	$('div#nav').hide();
	$('#toggleNav').click(function(){
		$('div#nav').slideToggle("slow");
	});

	$('div#Data').hide();
	$('button.toggleData').click(function() {
		$('div#Data').toggle();
	});

	google.charts.load('current', {'packages':['corechart']});
	
// ---- 
// initial data preparation 
// ----
	// write Project in header
	var colIndexProject = $('div#Data table#entries tbody td.colProject').index();
	var project = $('div#Data table#entries tbody tr:eq(0) td').eq(colIndexProject).text();
	$('div#header p span#project').html(project);

	// initially all items in data table are of classes "7Step open"
	$('div#Data table#entries tbody tr').each(function(){
		// based on used method change from 7Step to Issue or 8D:
		$("td.colMethod:contains('Issue Tracking')").parent().removeClass('7Step').addClass('Issue');
		$("td.colMethod:contains('8D Method')").parent().removeClass('7Step').addClass('8D');
		
		// based on current state change from open to finit states
		$("td.colState:contains('Concern Completed')").parent().removeClass('open').addClass('completed');
		$("td.colState:contains('Concern Deviation Accepted')").parent().removeClass('open').addClass('deviation');
		$("td.colState:contains('Concern Rejected')").parent().removeClass('open').addClass('rejected');
	});
	// for legacy 7Step items state "Concern Preventive Actions Defined" is equal to 8D state "Concern Completed" and therefore also a finit state
	$('div#Data table#entries tbody tr.7Step').each(function(){
		$("td.colState:contains('Concern Preventive Actions Defined')").parent().removeClass('open').addClass('completed');
	});
	
	// count all items
	var cntTotal = $('div#Data table#entries tbody tr').length;
	
	// identify current week (data format: yyyyww)
	var colIndexCurrWeek = $('div#Data table#entries tbody td.colCWNow').index();
	var strCurrWeek = $('div#Data table#entries tbody tr:eq(0) td').eq(colIndexCurrWeek).text();
	var intCurrWeek = parseInt(strCurrWeek);

	
// ----
// Combo Chart "Process Application"
// ----
	// calculate relevant calender weeks:
	// in general intCurrWeek-x but a turn of the year within reporting period must be taken into account
	var arrWeekCases = [intCurrWeek];
	var intLastWeekPrevYear = parseInt((parseInt(strCurrWeek.substr(0,4))-1).toString()+"52");
	switch (parseInt(strCurrWeek.substr(4,2))) {
		case 8:
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intCurrWeek-3,intCurrWeek-4,intCurrWeek-5,intCurrWeek-6,intCurrWeek-7,intLastWeekPrevYear); break;
		case 7:
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intCurrWeek-3,intCurrWeek-4,intCurrWeek-5,intCurrWeek-6,intLastWeekPrevYear,intLastWeekPrevYear-1); break;
		case 6:
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intCurrWeek-3,intCurrWeek-4,intCurrWeek-5,intLastWeekPrevYear,intLastWeekPrevYear-1,intLastWeekPrevYear-2); break;
		case 5:
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intCurrWeek-3,intCurrWeek-4,intLastWeekPrevYear,intLastWeekPrevYear-1,intLastWeekPrevYear-2,intLastWeekPrevYear-3); break;
		case 4:
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intCurrWeek-3,intLastWeekPrevYear,intLastWeekPrevYear-1,intLastWeekPrevYear-2,intLastWeekPrevYear-3,intLastWeekPrevYear-4); break;
		case 3:
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intLastWeekPrevYear,intLastWeekPrevYear-1,intLastWeekPrevYear-2,intLastWeekPrevYear-3,intLastWeekPrevYear-4,intLastWeekPrevYear-5); break;
		case 2:
			arrWeekCases.push(intCurrWeek-1,intLastWeekPrevYear,intLastWeekPrevYear-1,intLastWeekPrevYear-2,intLastWeekPrevYear-3,intLastWeekPrevYear-4,intLastWeekPrevYear-5,intLastWeekPrevYear-6); break;
		case 1:
			arrWeekCases.push(intLastWeekPrevYear,intLastWeekPrevYear-1,intLastWeekPrevYear-2,intLastWeekPrevYear-3,intLastWeekPrevYear-4,intLastWeekPrevYear-5,intLastWeekPrevYear-6,intLastWeekPrevYear-7); break;
		default:
			// if week number > 8 the reporting period is fully within the same year
			arrWeekCases.push(intCurrWeek-1,intCurrWeek-2,intCurrWeek-3,intCurrWeek-4,intCurrWeek-5,intCurrWeek-6,intCurrWeek-7,intCurrWeek-8);
	}
		
	var arrCntCreated = [0,0,0,0,0,0,0,0,0]; 
	$('div#Data table#entries tbody tr td.colCreated').each(function(){
		switch (parseInt($(this).text())) {
			case arrWeekCases[0]:
				arrCntCreated[0] += 1; break;
			case arrWeekCases[1]:
				arrCntCreated[1] += 1; break;
			case arrWeekCases[2]:
				arrCntCreated[2] += 1; break;
			case arrWeekCases[3]:
				arrCntCreated[3] += 1; break;
			case arrWeekCases[4]:
				arrCntCreated[4] += 1; break;
			case arrWeekCases[5]:
				arrCntCreated[5] += 1; break;
			case arrWeekCases[6]:
				arrCntCreated[6] += 1; break;
			case arrWeekCases[7]:
				arrCntCreated[7] += 1; break;
			case arrWeekCases[8]:
				arrCntCreated[8] +=1; break;
			default:
				break;
		}
	});
	
	var arrCntClosed = [0,0,0,0,0,0,0,0,0];
	$('div#Data table#entries tbody tr td.colClosed').each(function(){
		switch (parseInt($(this).text())) {
			case arrWeekCases[0]:
				arrCntClosed[0] += 1; break;
			case arrWeekCases[1]:
				arrCntClosed[1] += 1; break;
			case arrWeekCases[2]:
				arrCntClosed[2] += 1; break;
			case arrWeekCases[3]:
				arrCntClosed[3] += 1; break;
			case arrWeekCases[4]:
				arrCntClosed[4] += 1; break;
			case arrWeekCases[5]:
				arrCntClosed[5] += 1; break;
			case arrWeekCases[6]:
				arrCntClosed[6] += 1; break;
			case arrWeekCases[7]:
				arrCntClosed[7] += 1; break;
			case arrWeekCases[8]:
				arrCntClosed[8] +=1; break;
			default:
				break;
		}
	});
	
	var arrCntOpen = [$('div#Data table#entries tbody tr.7Step.open').length + $('div#Data table#entries tbody tr.8D.open').length,0,0,0,0,0,0,0,0];
	//console.log("### -1w: ###");
	var loop = 1;
	$('div#Data table#entries tbody tr td.colState-1').each(function(){ 
		arrCntOpen[1] = getCntOpen($(this).text(), arrCntOpen[1], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -2w: ###");
	$('div#Data table#entries tbody tr td.colState-2').each(function(){ 
		arrCntOpen[2] = getCntOpen($(this).text(), arrCntOpen[2], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -3w: ###");
	$('div#Data table#entries tbody tr td.colState-3').each(function(){ 
		arrCntOpen[3] = getCntOpen($(this).text(), arrCntOpen[3], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -4w: ###");
	$('div#Data table#entries tbody tr td.colState-4').each(function(){ 
		arrCntOpen[4] = getCntOpen($(this).text(), arrCntOpen[4], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -5w: ###");
	$('div#Data table#entries tbody tr td.colState-5').each(function(){ 
		arrCntOpen[5] = getCntOpen($(this).text(), arrCntOpen[5], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -6w: ###");
	$('div#Data table#entries tbody tr td.colState-6').each(function(){ 
		arrCntOpen[6] = getCntOpen($(this).text(), arrCntOpen[6], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -7w: ###");
	$('div#Data table#entries tbody tr td.colState-7').each(function(){ 
		arrCntOpen[7] = getCntOpen($(this).text(), arrCntOpen[7], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("### -8w: ###");
	$('div#Data table#entries tbody tr td.colState-8').each(function(){ 
		arrCntOpen[8] = getCntOpen($(this).text(), arrCntOpen[8], $(this).parent().hasClass("7Step"), $(this).parent().hasClass("Issue"), loop);
		loop++;
	});
	loop = 1;
	//console.log("######");
	
	google.charts.setOnLoadCallback(drawChartCombPcApplication);
	function drawChartCombPcApplication() {
	
		var data = google.visualization.arrayToDataTable([
			['Week', 'Created', 'Closed', 'Open'],
			['8 weeks ago',  arrCntCreated[8], arrCntClosed[8], arrCntOpen[8]],
			['7 weeks ago',  arrCntCreated[7], arrCntClosed[7], arrCntOpen[7]],
			['6 weeks ago',  arrCntCreated[6], arrCntClosed[6], arrCntOpen[6]],
			['5 weeks ago',  arrCntCreated[5], arrCntClosed[5], arrCntOpen[5]],
			['4 weeks ago',  arrCntCreated[4], arrCntClosed[4], arrCntOpen[4]],
			['3 weeks ago',  arrCntCreated[3], arrCntClosed[3], arrCntOpen[3]],
			['2 weeks ago',  arrCntCreated[2], arrCntClosed[2], arrCntOpen[2]],
			['last week',    arrCntCreated[1], arrCntClosed[1], arrCntOpen[1]],
			['current',      arrCntCreated[0], arrCntClosed[0], arrCntOpen[0]]
		]);
		
		var options = {
			title: "Process Application for 8Ds/7Steps",
			legend: {position:'top', maxLines:2},
			hAxis: {slantedText:true, slantedTextAngle:90},
			vAxis: {title:'Qty', baseline:0, gridlines: {count:-1}}, 
			seriesType: 'bars',
			series: {
				0: {color:'red'},
				1: {color:'green'},
				2: {color:'blue', type:'line'}
			}
			
		};
	
		var chart = new google.visualization.ComboChart(document.getElementById('chartCombPcApp'));
        chart.draw(data, options);
	
	}

		
// ----
// Combo Chart "Durations"
// ----
	var targetVerify = [,,,,,0.75,,,,,,,]; // in [%]; @6 Month <=> <131 weekdays 
	var arrVerify = [0,0,0,0,0,0,0,0,0,0,0,0,0]; // holds the quantities
	var cntVerify = 0;
	$('div#Data table#entries tbody tr td.colVeriT').each(function(){
		var value = $(this).text();
		
		if (value != "") {
			cntVerify++;
			
			if (parseInt(value) > 261) {
				arrVerify[12] += 1; 
			} else if (parseInt(value) > 239) {
				arrVerify[11] += 1;
			} else if (parseInt(value) > 217) {
				arrVerify[10] += 1;
			} else if (parseInt(value) > 196) {
				arrVerify[9] += 1;
			} else if (parseInt(value) > 174) {
				arrVerify[8] += 1;
			} else if (parseInt(value) > 152) {
				arrVerify[7] += 1;
			} else if (parseInt(value) > 130) {
				arrVerify[6] += 1;
			} else if (parseInt(value) > 109) {
				arrVerify[5] += 1;
			} else if (parseInt(value) > 87) {
				arrVerify[4] += 1;
			} else if (parseInt(value) > 65) {
				arrVerify[3] += 1;
			} else if (parseInt(value) > 43) {
				arrVerify[2] += 1;
			} else if (parseInt(value) > 22) {
				arrVerify[1] += 1;
			} else {
				arrVerify[0] += 1;
			}
		}
	});

	var targetClosure = [,,,,,,,,,,,0.75,];	// in [%]; @12 Month <=> <261 weekdays
	var arrClosure = [0,0,0,0,0,0,0,0,0,0,0,0,0]; // holds the quantities
	var cntClosure = 0;
	$('div#Data table#entries tbody tr td.colCompT').each(function(){
		var value = $(this).text();
		
		if (value != "") {
			cntClosure++;
			if (parseInt(value) > 261) {
				arrClosure[12] += 1; 
			} else if (parseInt(value) > 239) {
				arrClosure[11] += 1;
			} else if (parseInt(value) > 217) {
				arrClosure[10] += 1;
			} else if (parseInt(value) > 196) {
				arrClosure[9] += 1;
			} else if (parseInt(value) > 174) {
				arrClosure[8] += 1;
			} else if (parseInt(value) > 152) {
				arrClosure[7] += 1;
			} else if (parseInt(value) > 130) {
				arrClosure[6] += 1;
			} else if (parseInt(value) > 109) {
				arrClosure[5] += 1;
			} else if (parseInt(value) > 87) {
				arrClosure[4] += 1;
			} else if (parseInt(value) > 65) {
				arrClosure[3] += 1;
			} else if (parseInt(value) > 43) {
				arrClosure[2] += 1;
			} else if (parseInt(value) > 22) {
				arrClosure[1] += 1;
			} else {
				arrClosure[0] += 1;
			}
		}
	});
	
	for (i = 1; i < arrVerify.length; i++) {
		var j = i-1;
		arrVerify[i] += arrVerify[j];
		arrClosure[i] += arrClosure[j];
	}
	
	google.charts.setOnLoadCallback(drawChartLineDuration);
	function drawChartLineDuration() {

		var data = google.visualization.arrayToDataTable([
			['Month', 'Verify', 'Verify Target', 'Closure', 'Closure Target'],
			['1 Mo',  arrVerify[0]/cntVerify, targetVerify[0], arrClosure[0]/cntClosure, targetClosure[0]],
			['2 Mo',  arrVerify[1]/cntVerify, targetVerify[1], arrClosure[1]/cntClosure, targetClosure[1]],
			['3 Mo',  arrVerify[2]/cntVerify, targetVerify[2], arrClosure[2]/cntClosure, targetClosure[2]],
			['4 Mo',  arrVerify[3]/cntVerify, targetVerify[3], arrClosure[3]/cntClosure, targetClosure[3]],
			['5 Mo',  arrVerify[4]/cntVerify, targetVerify[4], arrClosure[4]/cntClosure, targetClosure[4]],
			['6 Mo',  arrVerify[5]/cntVerify, targetVerify[5], arrClosure[5]/cntClosure, targetClosure[5]],
			['7 Mo',  arrVerify[6]/cntVerify, targetVerify[6], arrClosure[6]/cntClosure, targetClosure[6]],
			['8 Mo',  arrVerify[7]/cntVerify, targetVerify[7], arrClosure[7]/cntClosure, targetClosure[7]],
			['9 Mo',  arrVerify[8]/cntVerify, targetVerify[8], arrClosure[8]/cntClosure, targetClosure[8]],
			['10 Mo', arrVerify[9]/cntVerify, targetVerify[9], arrClosure[9]/cntClosure, targetClosure[9]],
			['11 Mo', arrVerify[10]/cntVerify, targetVerify[10], arrClosure[10]/cntClosure, targetClosure[10]],
			['12 Mo', arrVerify[11]/cntVerify, targetVerify[11], arrClosure[11]/cntClosure, targetClosure[11]],
			['> 12 Mo',  arrVerify[12]/cntVerify, targetVerify[12], arrClosure[12]/cntClosure, targetClosure[12]]
		]);

		var options = {
			title: "Durations",
			legend: {position:'top', maxLines:2},
			hAxis: {slantedText:true, slantedTextAngle:90},
			vAxis: {format:'#%', baseline:0, minValue:0, maxValue:1}, 
			series: {
				0: {color:'orange'},
				1: {color:'orange', pointShape:'diamond', pointSize: 10},
				2: {color:'darkblue'},
				3: {color:'darkblue', pointShape:'diamond', pointSize: 10}
			}
		};

		var chart = new google.visualization.LineChart(document.getElementById('chartLineDuration'));
		chart.draw(data, options);

	}

	
// ----
// Combo Chart "Processsing Frequencies within 1st week"
// ----
	var targetDetectCreate = 0.75; // in [%]
	var cntDetectCreateSet = 0;
	var cntDetectCreateInRange = 0; 
	$('div#Data table#entries tbody tr td.colCreDetDif').each(function(){
		var value = $(this).text();
		
		if (value != "") {
			cntDetectCreateSet++;
			// data already in weeks (incl. weekend)
			if ((parseInt(value) >= 0)&&(parseInt(value) <= 1)) {
				cntDetectCreateInRange++;
			}
		}
	});
	
	var targetAcceptReject = 0.75; // in [%]
	var cntAcceptRejectInRange = 0;
	$('div#Data table#entries tbody tr td.colInitT').each(function(){
		var value = $(this).text();
		
		if (value != "") {
			// data already in weekdays
			if ((parseInt(value) >= 0)&&(parseInt(value) <= 5)) {
				cntAcceptRejectInRange++;
			}
		}
	});
	
	google.charts.setOnLoadCallback(drawChartComboProcessing);
	function drawChartComboProcessing() {
		var fnStr = "Detect/Create "+String.fromCharCode(185);
	
		var data = google.visualization.arrayToDataTable([
			['Response Type', 'Achieved', 'Target'],
			[fnStr, cntDetectCreateInRange/cntDetectCreateSet, targetDetectCreate],
			['Accept/Reject', cntAcceptRejectInRange/cntTotal, targetAcceptReject]
		]);

		var options = {
			title: "Responses within 1st week",
			legend: {position:'top', maxLines:2},
			vAxis: {format:'#%', baseline:0, minValue:0, maxValue:1}, 
			series: {
				0: {color:'darkblue', type:'bars'},
				1: {color:'green', type:'line'}
			}
		};

		var chart = new google.visualization.ComboChart(document.getElementById('chartCombInitiation'));
		chart.draw(data, options);

		$('div#Dashboard p#footnotes span#DetectCreatePercentage').html(Math.round(cntDetectCreateSet/cntTotal*100));
	}
	

// ----
// Column Chart "Distribution of Finit States for 7Step's and 8D's"
// ----
	var cnt8DItems_completed = $('div#Data table#entries tbody tr.8D.completed').length;
	var cnt8DItems_deviation = $('div#Data table#entries tbody tr.8D.deviation').length;
	var cnt8DItems_rejected = $('div#Data table#entries tbody tr.8D.rejected').length;
	var cnt8DItems_finit = cnt8DItems_completed+cnt8DItems_deviation+cnt8DItems_rejected;
	
	var cnt7StepItems_completed = $('div#Data table#entries tbody tr.7Step.completed').length;
	var cnt7StepItems_deviation = $('div#Data table#entries tbody tr.7Step.deviation').length;
	var cnt7StepItems_rejected = $('div#Data table#entries tbody tr.7Step.rejected').length;
	var cnt7StepItems_finit = cnt7StepItems_completed+cnt7StepItems_deviation+cnt7StepItems_rejected;
	
	google.charts.setOnLoadCallback(drawChartColFinitStates);
	function drawChartColFinitStates() {

		var data = google.visualization.arrayToDataTable([
			['Method', 'Completed', 'Deviation Accepted', 'Rejected'],
			['7Step', cnt7StepItems_completed/cnt7StepItems_finit, cnt7StepItems_deviation/cnt7StepItems_finit, cnt7StepItems_rejected/cnt7StepItems_finit],
			['8D', cnt8DItems_completed/cnt8DItems_finit, cnt8DItems_deviation/cnt8DItems_finit, cnt8DItems_rejected/cnt8DItems_finit]
		]);
		
		var options = {
			title: "Finit States "+String.fromCharCode(178),
			legend: {position:'top', maxLines:2},
			isStacked: true,
			vAxis: {format: "#%", baseline:0, minValue:0, maxValue:1}, 
			series: {
				0: {color:'green'},
				1: {color:'yellow'},
				2: {color:'orange'}
			}
		};
	
		var chart = new google.visualization.ColumnChart(document.getElementById('chartColFinitStates'));
        chart.draw(data, options);
	
		$('div#Dashboard p#footnotes span#7StepFinitQty').html(cnt7StepItems_finit);
		$('div#Dashboard p#footnotes span#8DFinitQty').html(cnt8DItems_finit);
	}
	
	
// ----
// Pie Chart "Distribution of Problem Resolution Method's used"
// ----
	var cnt7StepItems = $('div#Data table#entries tbody tr.7Step').length;
	var cnt8DItems = $('div#Data table#entries tbody tr.8D').length;
	var cntIssueItems = $('div#Data table#entries tbody tr.Issue').length;

	google.charts.setOnLoadCallback(drawChartPieMethod);
	function drawChartPieMethod() {
	
		var data = google.visualization.arrayToDataTable([
			['Method', 'Qty'],
			['8D', cnt8DItems],
			['7Step', cnt7StepItems],
			['Issue Tracking', cntIssueItems]
		]);
		
		var options = {
			title: "Method's used",
			legend: {position:'top', maxLines:2},
			slices: {
				0: {color:'blue'},
				1: {color:'darkblue'},
				2: {color:'gray'}
			}
		};
	
		var chart = new google.visualization.PieChart(document.getElementById('chartPieMethod'));
        chart.draw(data, options);
	
	}
	
	
// ---
// support function(s)
// ---
	function getCntOpen(cellValue, retval, is7Step, isIssue, loop) {
		/*  
			Mapping of historical state values to state names:
			use CLI> im states --fields="ID,Name" to retrieve information
		*/
		
		switch (cellValue) {
			case "67":  // 67 	Concern Root Cause Identified
			case "68":  // 68 	Concern Solution Identified
			case "69":  // 69 	Concern Solution Verified
			case "72":  // 72 	Concern Team Defined
			case "104": // 104	Concern Solution Integrated
				retval++; 
				break;
			case "70":  // 70 	Concern Preventive Actions Defined
				if (!is7Step) { 
					retval++;
				}
				break;
			case "73":  // 73 	Concern Accepted and Interim Action Defined
			case "74":  // 74 	Concern New
				if (!isIssue) {
					retval++;
				}
				break;
			case "71":  // 71 	Concern Deviation Accepted
			case "75":  // 75 	Concern Rejected
			case "101": // 101	Concern Completed
			case "102": // 102	Concern Issue Solved
			case "103": // 103	Concern Issue Verified
			case "105": // 105	Concern Issue Completed
			case "":
			default:
				break;
		}
		//console.log(loop+";"+cellValue+";"+is7Step+";"+isIssue+";"+retval);
		return retval;
	}
});