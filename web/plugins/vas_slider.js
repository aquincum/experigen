/**
 * @file An attempt to create visual analog scales
 */


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
makeVAS = function (width, height, obj) {
	Experigen.screen().responses++;
	var newvas = new VAS(width, height, Experigen.screen().responses, this.vases.length, obj);
	this.vases.push(newvas);
	return newvas.html();
}

/**
 * The plugin function, which is inserted by {@link Experigen.make_into_trial} into the
 * methods of each {@link Experigen.trial}. It just adds the {@link makeVAS} function as
 * a member method of each screen.
 * @param trial {Experigen.trial} The trial screen passed to the plugin.
 */
function VASplugin(trial){
	trial.makeVAS = makeVAS;
	trial.vases = [];

	// Making sure the user modifies  the scale. To do this, we wrap around @link Experigen.trial.advance
	// save the main advance function.
	trial.oldAdvance = Experigen.screen().advance;

	// The wrapper
	Experigen.screen().advance = function(spec){
		var part = "#" + "part" + Experigen.screen().currentPart;
		var proceed = true;
		// each VAS in our part
		$(part).find(".vas").each(function(index){
			// get the index in vases
			var n = $(this).attr("id").match(/[0-9]+$/);
			if(!Experigen.screen().vases[n].clicked){
				alert("You have not adjusted the visual analog scale.");
				proceed = false;
			}
		});
		if(proceed)
			return trial.oldAdvance(spec);
		else
			return false;
	}
}


/**
 * And now we just register ourselves as a plugin to be loaded with every screen
 */
Experigen.addScreenPlugin(VASplugin);



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
 */
function VAS(width, height, response_no, vas_no, obj){
	var that = this;
	this.width = width;
	this.height = height
	this.n = response_no;
	this.vasn = vas_no;
	var paramsobj = obj || {};
	this.innercolor = paramsobj.innercolor || "#0000ee";
	this.outercolor = paramsobj.outercolor || "#ffffff";
	this.innerwidth = paramsobj.innerwidth || (width * 0.05);
	this.innerpic = paramsobj.innerpic || null;
	this.outerpic = paramsobj.outerpic || null;
	this.dragmode = false;
	this.savedmove = function(){};
	this.savedup = function(){};
	this.borderwidth = 1;
	this.clicked = false;

	/** Produces the HTML for the VAS
	 * @returns the HTML
	 */
	this.html = function(){
		var str = "<div class='vas' id='vas" + that.vasn + "' ";
		str += "style='";
		str += "width:"+ that.width + "px;";
		str += "height:"+ that.height + "px;";
		if(that.outerpic)
			str += 'background-image:url("' + that.innerpic + '");';
		str += "background-color:" + that.outercolor + ";";			
		str += "border: solid " + that.borderwidth + "px #aaa;";
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
		str += "position:absolute;";
		str += "left:" + (that.width/2-that.innerwidth/2) + "px;";
		str += "'>";
		str += "</div></div>";
		str += "<input type='hidden' name='response" +that.n+ "' value=0.5>";
		that.load();
		return str;
	}

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
	}

	this.innermousedown = function(event){
		that.dragmode = true; // we are dragged!
		that.innerclicked(event);
	}
	this.innermousemove = function(event){
		if(that.dragmode) // only move if dragging is happening
			that.innerclicked(event);
	}
	this.innermouseup = function(event){
		if(that.dragmode){
			that.dragmode = false; // cancel dragging
			that.innerclicked(event);
		}
	}
	this.load = function(){
		// we want the whole document to respond to us if dragging is involved, so
		// we attach event listeners to the document too
		$(document).mousemove(that.innermousemove);
		$(document).mouseup(that.innermouseup);
	}

}

