/**
 * @file A plugin that adds a "report sound error" link in the footer.
 */

/**
 * Adds a report sound problem button to the bottom of the main wrapper. The label
 * is "Report a problem with the sound file" or it can be manually set in 
 * Experigen.settings.pluginsettings.reportsounderror
 * @param trial
 */


Experigen.addScreenPlugin(function(trial){
	var append = function(){
		if(trial.mo) trial.mo.disconnect();
		if(trial.soundbuttons.length < 1) return;
		var s = {};
		if(Experigen.settings.pluginsettings)
			if(Experigen.settings.pluginsettings.reportsounderror)
				s = Experigen.settings.pluginsettings.reportsounderror;
		var label = s.label || "Report a problem with the sound file";
		$("#main").append("<div id='reportsoundproblem' style='text-align: left;display: block; margin:20px;'></div>");
		label = "<input type='button' onclick='reportSoundProblem();' value='" + label + "'>";
		$("#reportsoundproblem").html(label);
	}

	/**
	 * Appends a text box to report anything and advances the screen
	 */
	var reportSoundProblem = function(){
		var rep = "<p>Could you explain what the problem is specifically?</p><input type='text' name='rspexplain' size='80' value='The sound file did not play.' onfocus='this.value=\"\";'>";
		rep += "<input type='submit' onclick='rspSubmit();return false;'>";
		$("#reportsoundproblem").html(rep);
	}

	var rspSubmit = function(){
		var str = "<input type='hidden' name='soundproblem' value='" + $("input[name='rspexplain']").val() + "'>"; 
		$("#currentform").append(str);
		//	$("#reportsoundproblem").remove();
		Experigen.recordResponse();
	}

	if(MutationObserver){
		trial.mo = new MutationObserver(append); 
		trial.mo.observe($("#main")[0], {childList: true});
	}
	else{
		$("#main").on("DOMNodeInserted", append);
	}

	trial.reportSoundProblem = reportSoundProblem;
	trial.rspSubmit = rspSubmit;
	/*	trial.reportsounderror_saved_advance = trial.advance;
		trial.advance = function(spec){
		if (Experigen.screen().currentPart > Experigen.screen().parts.length)
		$("#reportsoundproblem").remove();
		return Experigen.screen().reportsounderror_saved_advance(spec);
		};*/
});
