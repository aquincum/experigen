/**
 * @file An attempt to create visual analog scales
 */


/**
 * And now we just register ourselves as a plugin to be loaded with every screen
 * The plugin function, which is inserted by {@link Experigen.make_into_trial} into the
 * methods of each {@link Experigen.trial}. It just adds the {@link makeVAS} function as
 * a member method of each screen.
 */
Experigen.registerPlugin({
	extendtrial: function (trial){

		/**
		 * This function will actually be a member of an {@link Experigen.trial}.
		 * @param width The width of the scale in pixels
		 * @param height The height of the scale in pixels
		 * @param [obj] A collection of options
		 * @param [obj.innercolor="#0000ee"] The color of the slider
		 * @param [obj.outercolor="#ffffff"] The color of the whole scale
		 * @param [obj.innerwidth=5% of width] The width of the inner slider
		 * @param [obj.innerpic=null] If specified, the given picture will be used as the background for the slider
		 * @param [obj.outerpic=null] If specified, the given picture will be used as the background for the outer scale
		 * @returns The html for the scale to be included
		 */
		var makeVAS = function (width, height, obj) {
			Experigen.screen().responses++;
			var newvas = new VAS(width, height, Experigen.screen().responses, this.vases.length, obj);
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
		 * @param [obj] A collection of options
		 * @param [obj.innercolor="#0000ee"] The color of the slider
		 * @param [obj.outercolor="#ffffff"] The color of the whole scale
		 * @param [obj.innerwidth=5% of width] The width of the inner slider
		 * @param [obj.innerpic=null] If specified, the given picture will be used as the background for the slider
		 * @param [obj.outerpic=null] If specified, the given picture will be used as the background for the outer scale
		 * @param [obj.edgelabels=['']] If specified, edge labels will be displayed
		 o	 */
		var VAS = function(width, height, response_no, vas_no, obj){
			var that = this;
			this.width = width;
			this.height = height;
			this.n = response_no;
			this.vasn = vas_no;
			var paramsobj = obj || {};
			this.innercolor = paramsobj.innercolor || "#0000ee";
			this.outercolor = paramsobj.outercolor || "#ffffff";
			this.innerwidth = paramsobj.innerwidth || (width * 0.05);
			this.innerpic = paramsobj.innerpic || null;
			this.outerpic = paramsobj.outerpic || null;
			this.edgelabels = paramsobj.edgelabels || [''];
			this.dragmode = false;
			this.savedmove = function(){};
			this.savedup = function(){};
			this.borderwidth = 1;
			this.clicked = false;

			/** Produces the HTML for the VAS
			 * @returns the HTML
			 */
			this.html = function(){
				var str = "<div class='scaleWrapper'><div class='scaleEdgeLabel'>"+that.edgelabels[0]+"</div>";
				str += "<div class='vas' id='vas" + that.vasn + "' ";
				str += "style='";
				str += "width:"+ that.width + "px;";
				str += "height:"+ that.height + "px;";
				if(that.outerpic)
					str += 'background-image:url("' + that.innerpic + '");';
				str += "background-color:" + that.outercolor + ";";			
				str += "border: solid " + that.borderwidth + "px #aaa;";
				str += "display: inline-flex;"
				str += "margin-left: auto; margin-right: auto;"
				str += "'><div class='clickedvas'";
				str += "onmousedown='e = event || window.event;Experigen.screen().vases[" + that.vasn + "].innermousedown(e)' ";
				str += "onmousemove='e = event || window.event;Experigen.screen().vases[" + that.vasn + "].innermousemove(e)' ";
				str += "onmouseup='e = event || window.event;Experigen.screen().vases[" + that.vasn + "].innermouseup(e)' ";
				str += "style='";
				str += "width:" + that.innerwidth + "px;";
				if(that.innerpic)
					str += 'background-image:url("' + that.innerpic + '");';
				str += "background-color:" + that.innercolor + ";";
				str += "height:"+ that.height+"px;";
				str += "cursor:pointer;";
				str += "position:relative;";
				str += "left:" + (that.width/2-that.innerwidth/2) + "px;";
				str += "'>";
				str += "</div></div><div class='scaleEdgeLabel'>" + that.edgelabels[that.edgelabels.length-1] + "</div></div><p></p>";
				str += "<input type='hidden' name='response" +that.n+ "' value=0.5>";
				that.load();
				return str;
			};

			/**
			 * Event handler for clicks.
			 * @param event {Event} The click event from the browser.
			 */
			this.innerclicked = function(event){
				that.clicked = true;
				var $me = $("#vas" + that.vasn);  // this is the VAS
				var outerleft = $me.offset().left;  // the left edge of the VAS
				var outertop = $me.offset().top;  // the top edge of the VAS
				var clickleft = event.clientX; // the X coordinate of the click
				var $myinner = $me.children(".clickedvas"); // the inner div
				var halfwidth = $myinner.width()/2;  // half of the inner div's width
				var resultingleft = Math.max(clickleft - halfwidth, outerleft); // do not be so left so you fall off to the left
				resultingleft = Math.min(resultingleft, outerleft + that.width - halfwidth*2); // do not be so right so that you fall of to the right
				$myinner.offset({left: resultingleft, top: outertop+that.borderwidth}); // repositions the inner div
				var perc = (resultingleft-outerleft)/(that.width - halfwidth*2); // the percentage
				document.forms["currentform"]["response"+that.n].value = perc.toString(); // setting the hidden response variable to the percentage. This will be sent to the server.
			};

			this.innermousedown = function(event){
				that.dragmode = true; // we are dragged!
				that.innerclicked(event);
			};
			this.innermousemove = function(event){
				if(that.dragmode) // only move if dragging is happening
					that.innerclicked(event);
			};
			this.innermouseup = function(event){
				if(that.dragmode){
					that.dragmode = false; // cancel dragging
					that.innerclicked(event);
				}
			};
			this.load = function(){
				// we want the whole document to respond to us if dragging is involved, so
				// we attach event listeners to the document too
				$(document).mousemove(that.innermousemove);
				$(document).mouseup(that.innermouseup);
			};

		};



		trial.makeVAS = makeVAS;
		trial.vases = [];

	},
	onadvance: function(last_screen){
		//		if(!last_screen) return true;
		var part = "#" + "part" + Experigen.screen().currentPart;
		var proceed = true;
		console.log(part);
		// each VAS in our part
		$(part).find(".vas").each(function(index){
			// get the index in vases
			var n = $(this).attr("id").match(/[0-9]+$/);
			if(!Experigen.screen().vases[n].clicked){
				if(!confirm("You have not adjusted the visual analog scale. Are you sure you want to continue?"))
					proceed = false;
			}
		});
		return proceed;
	}
});




