$(document).ready(function() {

		$('nav').hide(); $('div#nav').hide();
		
		$('table#entries tbody tr').each(function(){
			$("td.colState:contains('Closed')").parent().removeClass('open').addClass('closed');
			$("td.colState:contains('Completed')").parent().removeClass('open').addClass('closed');
			$("td.colState:contains('Rejected')").parent().removeClass('open').addClass('closed');
			$("td.colState:contains('Info')").parent().removeClass('open').addClass('closed');
			$("td.colState:contains('Decision')").parent().removeClass('open').addClass('closed');
			$("td.colState:contains('Concern Lessons Learned Finished')").parent().removeClass('open').addClass('closed');
			$("td.colState:contains('Concern Deviation Accepted')").parent().removeClass('open').addClass('closed');
			
			$("td.colVis:not(:contains('MPT'))").parent().removeClass('internal').addClass('external');
			$("td.colVis:contains('MPT')").each(function(){
				if ($(this).text().length > 3) { 
					$(this).parent().removeClass('internal').addClass('external'); 
				}
			});
		});
		
		refresh();

		$('#toggleNav').click(function(){
			$('nav').slideToggle("slow"); $('div#nav').slideToggle("slow");
		});

		$('button.toggleCols').click(function() {
			var colIndex = $('button.toggleCols').index(this)+1;
			$('table#entries td:nth-child('+colIndex+'), table#entries th:nth-child('+colIndex+')').toggle();
		});

		$("button.vis").click(function(){
			var id = $(this).text();
			
			if (id == "External") {
				$('table#entries tbody tr:visible.external').show();
				$('table#entries tbody tr:visible.internal').hide();
			} else if (id == "Internal") {
				$('table#entries tbody tr:visible.external').hide();
				$('table#entries tbody tr:visible.internal').show();
			} else { pass; }
			
			refresh();
		});

		$("button.state").click(function(){
			var id = $(this).text();
			
			if (id == "Open") {
				$('table#entries tbody tr:visible.open').show();
				$('table#entries tbody tr:visible.closed').hide();
			} else if (id == "Closed") {
				$('table#entries tbody tr:visible.open').hide();
				$('table#entries tbody tr:visible.closed').show();
			} else { pass; }
			
			refresh();
		});

		$("button.reset").click(function(){
			$('tbody tr').each(function(){
				$(this).show();
			});
			
			refresh();
		});

		$('th').click(function(){
			var table = $(this).parents('table').eq(0);
			var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
			var iconDiv = $(this).find('div');

			this.asc = !this.asc;
			$(iconDiv).removeClass();
			if (!this.asc) {
				rows = rows.reverse();
				$(iconDiv).addClass('ui-icon ui-icon-triangle-1-s');
			}
			else {
				$(iconDiv).addClass('ui-icon ui-icon-triangle-1-n');
			}
			for (var i = 0; i < rows.length; i++){ table.append(rows[i]); }

			$(this).siblings().find('div').removeClass();
			$(this).siblings().find('div').addClass('ui-icon ui-icon-triangle-2-n-s');
			
			refresh();
		});

		function comparer(index) {
			return function(a, b) {
				var valA = getCellValue(a, index), valB = getCellValue(b, index);
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
			}
		}

		function getCellValue(row, index){ return $(row).children('td').eq(index).html(); }

		function refresh() {
			$('p#content').text('Showing '+ $('tbody tr:visible').length + ' of ' + $('tbody tr').length + ' entries.');
			$('table#entries tbody tr:visible:odd').removeClass('even').removeClass('odd').addClass('odd');
			$('table#entries tbody tr:visible:even').removeClass('even').removeClass('odd').addClass('even');
		}
			
	});