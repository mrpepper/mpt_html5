$(document).ready(function() {

	$('div#nav').hide();
	$('#toggleNav').click(function(){
		$('div#nav').slideToggle("slow");
	});

	$('div#Data').hide();
	$('button.toggleData').click(function() {
		$('div#Data').toggle();
	});



	/*
	Document operations focus on restructuring the document structure which will be lost in a report
	Essential input fields: item ID and relationsship field Contains

	Preconditions on the report structure:
		- existance of a div with id="Data"
		- existance of one single row in the table body of class="document"
		- each row in the table body has its item ID stored in attribute id
	*/

	var indexColOrder=$('th#colOrder').index();
	var indexColLevel=$('th#colLevel').index();
	var indexColID=$('th#colID').index();
	var indexColContains=$('th#colContains').index();
	var indexColCategory=$('th#colCategory').index();
	var indexColSummary=$('th#colSummary').index();

	var arrDocItemOrder = [];
	var arrDocItemLevel = [];
	var cntDocItems = $('div#Data table#entries tbody tr.item').length;


	// main function calls:

	getDocStructure(getItemContainsArr($('div#Data table#entries tbody tr.document td').eq(indexColContains).text()),1,getItemLevelsArr($('div#Data table#entries tbody tr.document td').eq(indexColContains).text(),0));
	setDocStructure();

	generateReport();

	/*
	helper function to transfor a comma separated string of relationship IDs into an array

	in: "000000ay, ..., 999999ay"
	returns: [000000,...,999999]
	*/
	function getItemContainsArr(IDString) {

		var retval = [];

		if (IDString.length > 0) {
			retval = IDString.split(', ');
			for (var i=0; i < retval.length; i++) {
				retval[i] = retval[i].replace('ay','');
			}
		}

		return retval;
	}

	function getItemLevelsArr(IDString, IDLevel) {

		var retval = [];
		var containsLevel = IDLevel+1;

		if (IDString.length > 0) {
			retval = IDString.split(', ');
			for (var i=0; i < retval.length; i++) {
				retval[i] = containsLevel;
			}
		}

		return retval;
	}


	/*
	(recursive) function to generate the document structure

	initial input: array with with the item ID contained by the document item
	recursive input: array consisting of the contained IDs of the currently processed item merged with the remaining array of ID from the previous function call
	*/
	function getDocStructure(IDArray, IDOrder, LevelArray) {
		if (IDArray.length > 0) {
			// (1) get currID and remove it from IDArray
			var currID = IDArray.reverse().pop();
			var currLevel = LevelArray.reverse().pop();
			IDArray = IDArray.reverse();
			LevelArray = LevelArray.reverse();

			// (2) add currID to document structure
			//     add order number of currID to data table
			arrDocItemOrder.push(currID);
			arrDocItemLevel.push(currLevel);
			$('div#Data table#entries tbody tr#'+currID+' td').eq(indexColOrder).text(""+IDOrder);
			$('div#Data table#entries tbody tr#'+currID+' td').eq(indexColLevel).text(""+currLevel);

			// (3) get array of contained IDs for currID
			var currIDContains = getItemContainsArr($('div#Data table#entries tbody tr#'+currID+' td').eq(indexColContains).text());
			var currIDContainLevels = getItemLevelsArr($('div#Data table#entries tbody tr#'+currID+' td').eq(indexColContains).text(),currLevel);

			// (4) merge list of IDs contained by currID with remaining IDArray
			//     because merge will operate on an empty array there is no need to check if currIDContains is empty or not
			IDArray = $.merge(currIDContains, IDArray);
			LevelArray = $.merge(currIDContainLevels, LevelArray);

			// (5) call function with merged IDArray if IDArray is not empty
			if (IDArray.length > 0) {
				getDocStructure(IDArray, IDOrder+1, LevelArray);
			}
		}
	}

	/*
	funtion(s) to sort the data table by colum Order
	*/
	function setDocStructure(){
		var table = $('div#Data table#entries');
		var rows = table.find('tr:gt(0)').toArray().sort(comparer(indexColOrder));

		for (var i = 0; i < rows.length; i++){ table.append(rows[i]); }
	}
	function comparer(index) {
		return function(a, b) {
			var valA = getCellValue(a, index), valB = getCellValue(b, index);
			return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
		}
	}
	function getCellValue(row, index){ return $(row).children('td').eq(index).html(); }




	function generateReport() {
		var htmlOutput = "";

		$('div#Data table#entries tbody tr.item').each(function(){
			switch($(this).find('td').eq(indexColCategory).text()) {
				case 'Heading':
					level = parseInt($(this).find('td').eq(indexColLevel).text())+2;

					htmlOutput += "<h"+level+">"+$(this).find('td').eq(indexColSummary).text()+"</h"+level+">";
					break;
				case 'Test':
					if ($(this).prev().find('td').eq(indexColCategory).text() != 'Test') {
						htmlOutput += "<table id='entries'><thead><tr class='shaded'>";
						htmlOutput += "<th rowspan='2'>ID</th>";
						htmlOutput += "<th rowspan='2'>Test</th>";
						htmlOutput += "<th rowspan='2'>Test Platform</th>";
						htmlOutput += "<th rowspan='2'>Work Instruction</th>";
						htmlOutput += "<th colspan='2'>PT1</th>";
						htmlOutput += "<th colspan='2'>PT2</th>";
						htmlOutput += "<th colspan='2'>PVS</th></tr>";
						htmlOutput += "<tr class='shaded'><th>State</th>";
						htmlOutput += "<th>Verification Report</th>";
						htmlOutput += "<th>State</th>";
						htmlOutput += "<th>Verification Report</th>";
						htmlOutput += "<th>State</th>";
						htmlOutput += "<th>Verification Report</th></tr></thead><tbody>";
					}

					htmlOutput += "<tr><td class='attrVal'>"+$(this).find('td').eq(indexColID).text()+"</td>"; 		// ID
					htmlOutput += "<td class='attrVal'>"+$(this).find('td').eq(indexColSummary).text()+"</td>"; 	// Subject
					htmlOutput += "<td class='attrVal'>"+$(this).find('td').eq(indexColSummary+1).text()+"</td>"; 	// Test Platform
					htmlOutput += "<td class='attrVal'>"+$(this).find('td').eq(indexColSummary+2).text()+"</td>"; 	// Work Instruction
					htmlOutput += "<td class='attrVal centered' id='"+highlightState($(this).find('td').eq(indexColSummary+3).text())+"'>"+$(this).find('td').eq(indexColSummary+3).text()+"</td>"; // State PT1
					htmlOutput += "<td class='attrVal'>";
					if ( $(this).find('td').eq(indexColSummary+3).text().length > 1 ) { htmlOutput += $(this).find('td').eq(indexColSummary+4).text(); }  // Verification Report PT1
					htmlOutput += "</td>";
					htmlOutput += "<td class='attrVal centered' id='"+highlightState($(this).find('td').eq(indexColSummary+5).text())+"'>"+$(this).find('td').eq(indexColSummary+5).text()+"</td>"; // State PT2
					htmlOutput += "<td class='attrVal'>";
					if ( $(this).find('td').eq(indexColSummary+5).text().length > 1 ) { htmlOutput += $(this).find('td').eq(indexColSummary+6).text(); }  // Verification Report PT2
					htmlOutput += "</td>";
					htmlOutput += "<td class='attrVal centered' id='"+highlightState($(this).find('td').eq(indexColSummary+7).text())+"'>"+$(this).find('td').eq(indexColSummary+7).text()+"</td>";	// State PVS
					htmlOutput += "<td class='attrVal'>";
					if ( $(this).find('td').eq(indexColSummary+7).text().length > 1 ) { htmlOutput += $(this).find('td').eq(indexColSummary+8).text() }	// Verification Report PVS
					htmlOutput += "</td></tr>";

					if ($(this).next().find('td').eq(indexColCategory).text() != 'Test') {
						htmlOutput += "</tbody></table>";
					}

					break;
				default:
					htmlOutput += "<p>"+$(this).find('td').eq(indexColSummary).text()+" ["+$(this).find('td').eq(indexColID).text()+"]</p>";
					break;
			}
		});

		$('div#Report').html(htmlOutput);
	}

	function highlightState(stateString) {
		switch (stateString) {
			case 'TC Completed with restriction':
				return "TCrest";
				break;
			case 'TC Failed':
				return "TCfail";
				break;
			case 'TC Completed':
				return "TCcomp";
				break;
			default:
				break;
		}
	}

});
