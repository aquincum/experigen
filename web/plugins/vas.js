/**
 * @file An attempt to create visual analog scales
 */







/**
 * We just register ourselves as a plugin to be loaded with every screen.
 * The plugin function, which is inserted by {@link Experigen.make_into_trial} into the
 * methods of each {@link Experigen.trial}. It just adds the {@link makeVAS} function as
 * a member method of each screen.
 */
Experigen.addScreenPlugin(function (trial){
	/**
	 * This function will actually be a member of an {@link Experigen.trial}.
	 * @param width The width of the scale in pixels
	 * @param height The height of the scale in pixels
	 * @returns The html for the scale to be included
	 */
	var makeVAS = function (width, height) {
		Experigen.screen().responses++;
		var newvas = new VAS(width, height, Experigen.screen().responses, this.vases.length);
		this.vases.push(newvas);
		return newvas.html();
	};

	/**
	 * A visual analog scale.
	 * @class
	 * @param width The width of the VAS in pixels
	 * @param height The height of the VAS in pixels
	 * @param response_no The rank of the VAS within responses in the screen
	 * @param vas_no The rank of the VAS within all VASes in the screen
	 * @param [type="slider"] "slider" or "fill"
	 */
	var VAS = function (width, height, response_no, vas_no, type){
		var that = this;
		this.width = width;
		this.height = height
		this.n = response_no;
		this.vasn = vas_no;
		this.type = type || "slider";


		/** Produces the HTML for the VAS
		 * @returns the HTML
		 */
		this.html = function(){
			var str = "<div class='vas' id='vas" + that.n + "' ";
			str += "onclick='e = event || window.event;Experigen.screen().vases[" + that.vasn + "].clicked(e)' ";
			str += "style='";
			str += "width:"+ width + "px;";
			str += "height:"+ height + "px;";
			if(that.type == "slider")
				str += "background-image:url(\"_lib/js/transp.png\");";
			else
				str += "background-color:#ffffff";			
			str += "'><div class='clickedvas' style='";
			if(that.type == "slider"){
			}
			else{
				str += "width:0px;";
				str += "background-color:#ffffff;";
			}
			str += "height:"+ height+"px;";
			str += "'>";
			str += "</div></div>";
			str += "<input type='hidden' name='response" +that.n+ "' value=0>";
			return str;
		}

		/**
		 * Event handler for clicks.
		 * @param event {Event} The click event from the browser.
		 */
		this.clicked = function(event){
			var $me = $("#vas" + that.n);  // this is the VAS
			var myleft = $me.offset().left;  // the left edge of the VAS
			var clickleft = event.clientX; // the X coordinate of the click
			var $myclicked = $me.children(".clickedvas"); // the inner div, which determines how the scale will look like to the left of the click
			$myclicked.width(clickleft-myleft); // sets the width of this inner div
			var perc = (clickleft-myleft)/this.width; // the percentage
			document.forms["currentform"]["response"+that.n].value = perc.toString(); // setting the hidden response variable to the percentage. This will be sent to the server.
			
		}
	};
	trial.makeVAS = makeVAS;
	trial.vases = [];
});




