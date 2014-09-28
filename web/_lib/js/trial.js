/**
 * @file This file contains the constructor for a trial object, which is loaded with every screen/item. 
 * The functions that generate the experiment parts are here.
 */

/// Changes: runextra, playWAVSound, makeWAVSoundButton

/**
 * Called as Experigen.make_into_trial, this is not a constructor
 * @name Experigen.trial
 * @param {Experigen.trial} that The screen to be.
 * @class
 */
Experigen.make_into_trial = function (that) {

	that.userCode = Experigen.userCode;
	that.userFileName = Experigen.userFileName;

	that.HORIZONTAL = "H";
	that.VERTICAL = "V";

	that.parts = [];
	that.currentPart = 0;
	that.callingPart = 0;
	that.soundbuttons = [];
	that.responses = 0;

	/** 
	 * Advances by one trial part or steps to the next
	 * screen if finished.
	 * @method
	 * @memberof Experigen.trial
	 * @param [spec] Extra arguments, spec.hide and spec.disable if set true,
	 * will hide or disable the current trial part respectively.
	 */
	that.advance = function(spec) {
		var parts = $(".trialpartWrapper");
		var part = "";
		var spec = spec || {};
		// initial call figures out screen parts
		if (parts.length && Experigen.screen().callingPart===0) { 
			Experigen.screen().parts = $(".trialpartWrapper");
			var haveIDs = true; // check that all wrappers have ID's
			// to do: check that they are "part" + number w/o skipping
			for (var i=0; i<Experigen.screen().parts.length; i++) {
				if(!Experigen.screen().parts[i].id) haveIDs = false;
			}
			if (!haveIDs) { // assign IDs by order
				//console.log("This template doesn't fully specify part numbers, parts will appear in order");
				for (var i=0; i<Experigen.screen().parts.length; i++) {
					Experigen.screen().parts[i].id = "part" + (i+1);
				}
			}
		}
		// after initalization:
		if (parts.length && Experigen.screen().callingPart===Experigen.screen().currentPart) {
			// current part
			part = "#" + "part" + Experigen.screen().currentPart;
			// does it contain text boxes that shouldn't allowed to be empty?
			if (/textInputNotEmpty/.test($(part).find(':input').first().attr("class")) && !Experigen.screen().checkEmpty($(part).find(':input').first())) {
				return false;
			} else {
				// no text boxes to fill, we can move on
				// hide current part first if needed
				if (spec && spec.hide) {
					$(part).hide();
				}
				if (spec && spec.disable) {
					// let's disable any form elements
					$(part + ' input[type!="hidden"]').attr("disabled", "disabled");
				}
				// now advance and show next part, or advance to next screen
				Experigen.screen().currentPart += 1;
				if (Experigen.screen().currentPart > Experigen.screen().parts.length) {
					
					// add all require data to the current form
					for (i in Experigen.fieldsToSave) {
						var str = "";
						//console.log(i + ": " + typeof Experigen.screen()[i]);
						if (typeof Experigen.screen()[i] === "object") {
							str = "<input type='hidden' name='" + i + "' value='" + Experigen.screen()[i][Experigen.resources[i+"s"].key] + "'>"; 
						} else {
							str = "<input type='hidden' name='" + i + "' value='" + Experigen.screen()[i] + "'>"; 
						}
						$("#currentform").append(str);
					}
					for (var i=0; i<Experigen.screen().soundbuttons.length; i+=1) {
						var str= "<input type='hidden' name='sound" + (i+1) + "' value='" + Experigen.screen().soundbuttons[i].presses + "'>\n";
						$("#currentform").append(str);
					}
					// send the form
					// enabled all text fields before sending, because disabled elements will not be sent
					$("#currentform " + 'input[type="text"]').prop("disabled", false)
					Experigen.sendForm($("#currentform"));
					Experigen.advance();
				} else {
					// show next part
					part = "#" + "part" + Experigen.screen().currentPart;
					$(part).show();
					// give focus to the first form object inside, if any
					$(part).find(':input[type!="hidden"][class!="scaleButton"]').first().focus();
				}
			}
		}
		return true;
	}

	/** 
	 * Inserts a scale to the DOM and to the Experigen.trial model.
	 * @method
	 * @memberof Experigen.trial
	 * @param obj {Object} A collection of options
	 * @param [obj.buttons=["1",...,"7"]] {String[]} The labels of the buttons
	 * @param [obj.edgelabels=none] {String[]} A 2-element array of labels of the edges on the side of the scale. By default, there is no label.
	 * @param [obj.linebreaks=0] {Number} Number of line breaks (br's) placed after the scale
	 * @param [obj.buttontype="button"] {String} "button" or "radio"
	 * @param [obj.disable=false] {boolean} If true, the scale will be disabled after used.
	 * @param [obj.hide=false] {boolean} If true, the scale will be hidden after used.
	 * @param [obj.runextra=""] {String} A string of JS code to be run after the scale is used, after calling {@link Experigen.trial.continueButtonClick}()
	 */
	that.makeScale = function(obj) {
		Experigen.screen().responses++;
		var buttons = obj.buttons || ["1","2","3","4","5","6","7"];
		var edgelabels = obj.edgelabels || [''];
		var linebreaks = obj.linebreaks || 0;
		var buttontype = "button";
		if (obj.buttontype === "radio") { buttontype = "radio"; };
		var disable = (obj.disable) ? true  : false;
		var hide    = (obj.hide) ? true  : false;
		var runextra = (obj.runextra) ? obj.runextra : "";

		var serverValues = obj.serverValues || buttons;
		/// validate serverValues here to be non-empty and distinct

		var str = "";
		str += '<div class="scaleWrapper">';
		str += '<div class="scaleEdgeLabel">' + edgelabels[0] + '</div>';
		for (var i=0; i<buttons.length; i+=1) {
			str += '<div class="scalebuttonWrapper">';
			str += '<input type="' + buttontype + '" value="'+ buttons[i] +'" id="' + Experigen.screen().responses + 'button' + i + '" name="scale'+ Experigen.screen().responses +'" class="scaleButton" onClick="Experigen.screen().recordResponse(' + Experigen.screen().responses + "," + "'" + buttons[i] + "'" + ');Experigen.screen().continueButtonClick(this,{hide:' +  hide + ',disable:' + disable + '});' + runextra;

			if (obj.rightAnswer) {
				str += 'Experigen.screen().feedbackOnText(this,\'' + obj.feedbackID + '\',\'' + obj.matchRegExpression + '\',\'' + obj.rightAnswer + '\',\'' + obj.feedbackWrong + '\',\'' + obj.feedbackMatch + '\',\'' + obj.feedbackRight + '\')';
			}

			str += '"></div>';
			if (linebreaks>0 && (i+1)%linebreaks==0 && (i+1)!=buttons.length) { str += '<br>'}
		}
		str += '<div class="scaleEdgeLabel">' + edgelabels[edgelabels.length-1] + '</div>';
		str += '</div>';
		str += "<input type='hidden' name='response" + Experigen.screen().responses + "' value=''>\n";
		return str;
	}


	/** 
	 * Records the response of a scale to the hidden form response field. The experiment
	 * spreadsheet will have a field called responseN with N being the number of the current
	 * scale on the screen, with a value of the name of the given button.
	 * @method
	 * @memberof Experigen.trial
	 * @param scaleNo The number of the scale
	 * @param buttonNo The value of the button to save
	 */
	that.recordResponse = function (scaleNo, buttonNo) {
		/// make all the necessary fields in document.forms["currentform"],
		/// and fill them with data
		if (scaleNo!==undefined && buttonNo!==undefined) {
			document.forms["currentform"]["response"+scaleNo].value = buttonNo;
		}
	}

	

	/**
	 * Determine which trialpartWrapper the call came from.
	 * @method
	 * @memberof Experigen.trial
	 */
	that.findCaller = function (caller) {
		// determine which trialpartWrapper the came from
		var comingFrom = $(caller);
		while (comingFrom && comingFrom.parent().length===1) {
			if (comingFrom.parent(".trialpartWrapper").length===1) {
				comingFrom = comingFrom.parent();
				break;
			}
			comingFrom = comingFrom.parent();
			if (comingFrom.attr("id")==="main") {
				break;
			}
		}
		if (comingFrom && comingFrom.attr("id")) {
			var part = comingFrom.attr("id").match(/part(\d+)$/);
			if (part) part = part[1];
			Experigen.screen().callingPart = parseInt(part,10);
		}
		return comingFrom;
	}

	
	/** 
	 * Inserts a text input to the DOM and to the Experigen.trial model.
	 * @method
	 * @memberof Experigen.trial
	 * @param obj {Object|String} A collection of options, or simply the initial string in the text field. The object may contain fields for JS/CSS code
	 *  passed to the HTML: style, onblur, onclick, onfocus, onchange
	 * @param [obj.initValue] {String} The initial string to display.
	 * @param [obj.allowempty] {boolean} Whether to allow the subject to leave the input empty.
	 * @param [obj.disable] {boolean} Whether to allow the subject to change the input (?).
	 * @param [obj.matchRegExpression] {boolean} Whether there is a regular expression to be matched by the response. See below.
	 * @param [obj.rightAnswer] {String} The right answer, if there is such. See below.
	 * @param [obj.feedbackID] The ID of the DOM element for feedback display.
	 * @param [obj.feedbackWrong]{String} Feedback if the answer does not match the regexp. The substring RIGHTANSWER will be replaced by the right answer, if provided
	 * @param [obj.feedbackMatch] {String} Feedback if the answer matches the regexp. The substring RIGHTANSWER will be replaced by the right answer, if provided
	 * @param [obj.feedbackRight] {String} Feedback if the answer is right. The substring RIGHTANSWER will be replaced by the right answer.
	 */
	that.makeTextInput = function (obj) {

		Experigen.screen().responses++;
	
		if (typeof obj==="string") {
			obj = {initValue: obj}
		}
		if (typeof obj!=="object") {
			obj = {initValue: ""}
		}
		if (!obj.initValue) {
			obj.initValue = "";
		}
		var str = "";
		str += "<input type='text' name='response" + Experigen.screen().responses + "' ";
		str += "id=response" + Experigen.screen().responses + " ";
		str += "value='"+ obj.initValue + "' ";

		var classNames = [];
		if (obj.allowempty===false) {
			classNames.push("textInputNotEmpty");
		} else {
			classNames.push("textInput");
		}
		if (obj.disable===true) {
			classNames.push("textInputDisable");
		}
		str += "class='" + classNames.join(" ") + "' ";
		
		if (obj.style) {
			str += "style='" + obj.style + "' ";
		}
		if (obj.onclick) {
			str += "onclick='" + obj.onclick + "' ";
		}
		if (obj.onblur) {
			str += "onblur='" + obj.onblur + "' ";
		}
		if (obj.onfocus) {
			str += "onfocus='" + obj.onfocus + "' ";
		}
		if (obj.onchange) {
			str += "onchange='" + obj.onchange + "' ";
		}
		if (obj.matchRegExpression || obj.rightAnswer) {
			var temp = 'Experigen.screen().feedbackOnText(this,"' + obj.feedbackID + '","' + obj.matchRegExpression + '","' + obj.rightAnswer + '","' + obj.feedbackWrong + '","' + obj.feedbackMatch + '","' + obj.feedbackRight + '")';
			str += "onchange='" + temp + "' ";
		}
		str += ">\n";
		return str;
	}




	/**
	 * Provides the feedback, called by the input field
	 * @method
	 * @memberof Experigen.trial
	 */
	that.feedbackOnText = function (sourceElement, targetElement, regex, rightAnswer, feedbackWrong, feedbackMatch, feedbackRight) {
		var str = $(sourceElement)[0].value || "";
		str = str.trim();
		var patt;
		if (str===rightAnswer) {
			$(targetElement).html(feedbackRight.replace(/RIGHTANSWER/,'"' + rightAnswer + '"'));
		} else {
			if (str && !feedbackMatch) { // supply feedback only to non-empty answers
				$(targetElement).html(feedbackWrong.replace(/RIGHTANSWER/,'"' + rightAnswer + '"'));
				return true;
			}
			patt = new RegExp(regex,"i");
			if (patt.test(str)) {
				$(targetElement).html(feedbackMatch.replace(/RIGHTANSWER/,'"' + rightAnswer + '"'));
			} else {
				if (str) { // supply feedback only to non-empty answers
					$(targetElement).html(feedbackWrong.replace(/RIGHTANSWER/,'"' + rightAnswer + '"'));
				}
			}
		}
	}


	/** 
	 * Inserts a picture to the DOM and to the Experigen.trial model.
	 * @method
	 * @memberof Experigen.trial
	 * @param obj {Object|String} A collection of options, or simply the file name of the picture. The object may contain fields for JS/CSS code
	 *  passed to the HTML: style, width, height, alt, class, id, onblur, onclick, onfocus, onchange
	 * @param [obj.src] {String} The source of the picture, as a file name.
	 */
	that.makePicture = function (obj) {
	
		if (typeof obj==="string") {
			obj = {src: obj}
		}
		if (typeof obj!=="object") {
			obj = {src: ""}
		}
		if (!obj.src) {
			obj.src = ""; // Fixed typos
		}
		obj.src = Experigen.settings.folders.pictures + obj.src;
	
		var str = "";
		str += "<img ";
		if (obj.src) {
			str += "src='" + obj.src + "' ";
		}
		if (obj.width) {
			str += "width='" + obj.width + "' ";
		}
		if (obj.height) {
			str += "height='" + obj.height + "' ";
		}
		if (obj.alt) {
			str += "alt='" + obj.alt + "' ";
		}
		if (obj["class"]) {
			str += "class='" + obj["class"] + "' ";
		}
		if (obj.id) {
			str += "id='" + obj.id + "' ";
		}
		if (obj.style) {
			str += "style='" + obj.style + "' ";
		}
		if (obj.onclick) {
			str += "onclick='" + obj.onclick + "' ";
		}
		if (obj.onblur) {
			str += "onblur='" + obj.onblur + "' ";
		}
		if (obj.onfocus) {
			str += "onfocus='" + obj.onfocus + "' ";
		}
		if (obj.onchange) {
			str += "onchange='" + obj.onchange + "' ";
		}
		str += ">";
		return str;	
	}

	/**
	 * Checks whether a text field is empty
	 * @method
	 * @memberof Experigen.trial
	 * @param obj jQuery/CSS selector for the text field
	 */
	that.checkEmpty = function (obj) {

		if ($(obj).val().match(/^\s*$/)) {
			$(obj).val("");
			alert(Experigen.settings.strings.emptyBoxMessage);
			$(obj).focus();
			return false;
		} else {
			return true;
		}
	}


	/**
	 * Generates a button in the DOM that will advance the experiment.
	 * @method
	 * @memberof Experigen.trial
	 * @param [obj] {Object|String} A collection of options, or simply the label of the button.
	 * @param [obj.label] {String} The label of the button. By default it is taken from {@link Experigen.settings}.string.continueButton
	 * @param [obj.disable=false] {boolean} If true, the button will be disabled after used.
	 * @param [obj.hide=false] {boolean} If true, the button will be hidden after used.
	 */

	that.continueButton = function (obj) {

		var str = ""

		if (typeof obj==="string") {
			obj = {label: obj}
		}
		if (!obj) {
			obj = {};
		}
		if (!obj.label) {
			obj.label = Experigen.settings.strings.continueButton;
		}

		str += '<input type="button" value="' + obj.label + '" ';
		var spec = [];
		if (obj.hide===true) {
			spec.push("hide:true");
		}
		if (obj.disable===true) {
			spec.push("disable:true");
		}
		spec = spec.length ? ",{" + spec.join(",") + "}" : "";		
		str += 'onClick="Experigen.screen().continueButtonClick(this' + spec + ');">'
		return str
	}

	/**
	 * Forwards the experiment: calls {@link Experigen.trial.advance} or {@link Experigen.advance} as needed
	 * @method
	 * @memberof Experigen.trial
	 */
	that.continueButtonClick = function (caller, spec) {

		var comingFrom = Experigen.screen().findCaller(caller);
		if (comingFrom && comingFrom.attr("class")==="trialpartWrapper") {
			Experigen.screen().advance(spec);
		} else {
			Experigen.advance(caller);
		}
	
	}
	


	for(var i = 0; i < Experigen.screenplugins.length; i++){
		Experigen.screenplugins[i](that);
	}

	return that;
}
