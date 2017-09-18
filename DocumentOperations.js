$(document).ready(function() {
	// ---------------------------------------------------------------------//
    // Get all heading Elements, transfer the description field in a heading and remove this table
    // ---------------------------------------------------------------------//
	var prevElementID = "";
	$("table#Header").each(function() {
		$(this).find("tbody tr").each(function(){
			var Description = $(this).find("td#DescriptionText").text();
			var ElementID = $(this).find("#ReqID").text();
			if (ElementID !== ""){
				prevElementID = ElementID;
			}

			if(Description !== ""){
				var Heading = document.createElement("h1");
				Heading.className = "Heading";
				Heading.innerHTML = Description;
				var Header = document.getElementById(prevElementID);
				//Header.insertBefore(Heading,Header.childNodes[0]);
				Header.appendChild(Heading);
			}
		});
		$(this).remove();
	});
	// ---------------------------------------------------------------------//
    // Get all Description Elements and extract <en> </en> Tagged Text
    // ---------------------------------------------------------------------//
	var len = document.getElementsByName("DescriptionText").length;
	for (var i = 0; i < len; i++) {
		var Description = document.getElementsByName("DescriptionText")[i].innerText;
		if (Description.lastIndexOf("<en>") > -1){
			var String = Description.substring(Description.lastIndexOf("<en>")+4,Description.lastIndexOf("</en>"));
			document.getElementsByName("DescriptionText")[i].innerText = String;
		}
	}
});
