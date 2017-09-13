$(document).ready(function() {
	var prevElementID = "";
	$("table#Header").each(function() {
		//console.log($(this));
		$(this).find("tbody tr").each(function(){
			//console.log("subthis:", $(this));
			var Description = $(this).find("td#DescriptionText").text();
			var ElementID = $(this).find("#ReqID").text();
			if (ElementID !== ""){
				prevElementID = ElementID;
			}


			if(Description !== ""){
				console.log(prevElementID);
				console.log(Description);

				var Heading = document.createElement("h1");
				Heading.className = "Heading";
				Heading.innerHTML = Description;
				var Header = document.getElementById(prevElementID);
				//Header.insertBefore(Heading,Header.childNodes[0]);
				Header.appendChild(Heading);
			}

			var String=Description.substring(Description.lastIndexOf("<en>")+1,Description.lastIndexOf("</en>"));
			console.log(String)

		});
		//convert Description in html Heading
		$(this).remove();
	});
});
