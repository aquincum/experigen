// Changes:
// 1. attemptNumber field uploaded
// 2. source url can be manually changed (Experigen.settings.sourceHtml)
// 3. sections: by default the whole experiment is 1 section, but if set manually,
//       the progress bar will only represent progress in the section.
// 4. plugins


/*  
//future encapuslation
Experigen = function () {

	var settings = Experigen.settings;
	var initialize = Experigen.initialize;

	return {
		settings: settings,
		initialize: initialize
	}
}(); */

/**
 * @file This file sets up the Experigen-level globals.
 */

/** {Experigen.trial} The list of screens in the experiment*/
Experigen._screens = [];
Experigen.STATIC = "instructions";
Experigen.TRIAL = "trial";
Experigen.VERSION = "0.1";
Experigen.audio = false;
/** A user ID number from the server, saved to results */
Experigen.userFileName = "";
/** A user ID code with 3 random letters concatenated with {@link Experigen.userFileName}
 * from the server, saved to results */
Experigen.userCode = "";
/** {Object} Fields to save to the spreadsheet. This is a hash of field names as keys and
 * booleans as values. if you  want to set a field to be saved, set that field name to true. */
Experigen.fieldsToSave = {};
/** Resources are loaded to this hash */
Experigen.resources = [];
/** {Number} The index of the current screen in the experiment.*/
Experigen.position = -1;
Experigen.initialized = false;
Experigen.trackTimes = false;

/** {Function[]} Plugin modules that can be loaded from an external plugin js file.*/
Experigen.plugins = [];

if (Experigen.settings.online===undefined) {
	Experigen.settings.online = true; // set to true for old settings files
}

/** Let it go */
Experigen.launch = function () {
	var that = this;
	
	/** Load plugins*/
	for(var i = 0; i < this.settings.plugins.length; i++){
		var pluginfile = this.settings.folders.plugins + this.settings.plugins[i] + ".js";
		$.getScript(pluginfile).done(function(d,status,jqxhr) {
			console.log("Loading " + this.url + ": status " + status);
		}).fail(function(d,status,jqxhr){
			console.log("Loading " + this.url + " failed for some reason, status " + status);
		});
	}

	$(document).ready(function(){
		$('body').append('<div id="mainwrapper"><div id="main">' + that.settings.strings.connecting + '</div></div><div id="footer"></div>');
		that.loadUserID();

		// prepare to catch the return key when
		// the participant is typing in a textbox
		// (which would naturally be focused)
		$.expr[':'].focus = function(a){ return (a == document.activeElement); }
		$(document).keydown(function(event) {
			if ($(".:focus") && $(".:focus").attr("type")) {
				if ($(".:focus").attr("type")==="text" && event.keyCode===13) {
					event.preventDefault();
					$(".:focus").change();
					if (Experigen.screen()) {
						Experigen.screen().findCaller($(".:focus"));
						var spec = {};
						if (/textInputDisable/.test($(".:focus").attr("class"))) {
							spec.disable = true;
						}
						Experigen.screen().advance(spec);
					}
				}
			}
		});

	});
}

Experigen.load = function () {

	var that = this, 
	stopload = false,
	waiting = 0;
	$("#main").html(this.settings.strings.loading);
	$(document).attr("title",this.settings.strings.windowTitle);

	this.resources["items"] = this.loadResource(this.settings.items);
	this.fieldsToSave[this.resources.items.key] = true;
	this.fieldsToSave["trialnumber"] = true;

	for (var resource in this.settings.otherresources) {
		this.resources[resource] = this.loadResource(this.settings.otherresources[resource]);
	}

	this.loadText({destination: "#footer", url: this.settings.footer, wait: true});

	this.progressbar = new this.New_progressbar(this);
	this.progressbar.initialize();

	for(var i = 0, l = Experigen.plugins.length; i < l; i++){
		if(Experigen.plugins[i].onload){
			var f = Experigen.plugins[i].onload;
			
			if(Experigen.plugins[i].stopload) {
				stopload = true;
				waiting ++;
			}
			f(function(){
				if(stopload) waiting --;
				if(stopload && waiting === 0){
					that.initialize();
					that.initialized = true;
					that.advance();
				}
			});
		}
	}
	if (!stopload) {
		this.initialize();
		this.initialized = true;
		this.advance();
	}
}

/**
 * Loads the next screen. This function calls screen.advance() for the first time.
 * @param callerButton The button that called the advance.
*/
Experigen.advance = function(callerButton) {

	var that = this;
	var html = "";
	
	/* setting up the hidden form to send. onSubmit='return false;' so that the
	 * form does not really gets sent automatically.
	 */
	var prefix = "<form id='currentform' onSubmit='return false;'>" 
			   + "<input type='hidden' name='userCode' value='" + this.userCode + "'>"
			   + "<input type='hidden' name='userFileName' value='" + this.userFileName + "'>"
			   + "<input type='hidden' name='experimentName' value='" + this.settings.experimentName + "'>"
			   + "<input type='hidden' name='attemptNumber' value='" + this.attemptNumber + "'>";
	
	if(!Experigen.settings.sourceHtml)
			   prefix += "<input type='hidden' name='sourceurl' value='" + encodeURIComponent(window.location.protocol + "//" + window.location.hostname + window.location.pathname) + "'>";
	else
			   prefix += "<input type='hidden' name='sourceurl' value='" + encodeURIComponent(Experigen.settings.sourceHtml) + "'>";
			   

	var suffix = "</form>";

	if (callerButton) callerButton.disabled = true;
	this.position++;
	this.progressbar.advance();

	var screen = this.screen();

	// the call to make_into_trial
	this.make_into_trial(screen);

	switch (screen.screentype) {
		case this.STATIC:

			var fileType = screen.url.match(/\.[a-zA-Z]+$/);
			if (fileType) { fileType = fileType[0]; };
			switch (fileType) {

				case ".html":
					$.get(screen.url, function(data) {
						$("#main").html(prefix + data + suffix);
						$("#main").find(':input[type!="hidden"]').first().focus();
					});
					screen.advance();
					break;

				case ".ejs":
					html = new EJS({url: screen.url}).render(screen);
					$("#main").html(prefix + html + suffix);
					$("#main").find(':input[type!="hidden"]').first().focus();
					screen.advance();
					break;

				default:
					$("#main").html(this.settings.strings.errorMessage);

			}
			break;

		case this.TRIAL:
			if (screen.view) {
				html = new EJS({url: this.settings.folders.views + screen.view}).render(screen);
				$("#main").html(prefix + html + suffix);
				screen.advance();
			} else {
				$("#main").html(this.settings.strings.errorMessage);
			}
			break;
		default:
			$("#main").html(this.settings.strings.errorMessage);
	}
	// hide local interface
	if (screen.trialnumber===2) {
		if ($("#localStorageAccess")) {
			$("#localStorageAccess").hide();
		}
	}

}

/**
 * Adds an array of screens as trial screens to the experiment.
 * @param arr {Experigen.trial[]} array of screens
 * @returns Experigen
 */
Experigen.addBlock = function (arr) {
	for (var i=0 ; i<arr.length ; i++) {
		arr[i].trialnumber = this._screens.length+1;
		arr[i].screentype = this.TRIAL;
		this._screens.push(arr[i]);
	}
	return this;
}

/**
 * Retrieves the resource with a given name.
 * @param rname {String} name of the resource
 * @returns The resource table
 */
Experigen.resource = function (rname) {
	if (this.resources && this.resources[rname]) {
		return this.resources[rname].table;
	}
}


/**
 * Adds one static screen to the experiment. Can be called with simply the view
 * name or with a screen object.
 * @param obj {Object|String} The screen object or the view file name.
 * @returns Experigen
 */
Experigen.addStaticScreen = function (obj) {

	if (typeof obj=="string") {
		obj = {url: this.settings.folders.views + obj};
	}
	obj.screentype = this.STATIC;
	obj.trialnumber = this._screens.length+1;
	this._screens.push(obj);

	return this;
}

/**
 * Returns the current screen
 * @returns {Experigen.trial} the current screen
 */
Experigen.screen = function () {
	return this._screens[this.position];
}

/**
 * Just a helper function to be used in the Console: lists all the screens within Experigen
 * to the console log.
 */
Experigen.printScreensToConsole = function () {
	for (var i=0; i<this._screens.length; i++) {
		console.log(this._screens[i]);
	}
}


/**
 * Records a response and forwards the experiment to the next screen.
 * @param callerbutton The button the request was made from.
 */
Experigen.recordResponse = function (callerbutton) {
	this.sendForm($("#currentform"));
	this.advance(callerbutton);
}

/**
 * The progress bar.
 * @constructor
 * @param that {Experigen} Experigen
 */
Experigen.New_progressbar = function (that) {
	
	var adjust = that.settings.progressbar.adjustWidth || 4;
	var visible = that.settings.progressbar.visible;
	var percentage = that.settings.progressbar.percentage;
	var sectionBreaks = [];
	
	/**
	 * @lends Experigen.new_progressbar.prototype
	 */
	return { 
		/** Initializes the progress bar */
		initialize : function() {
			if (visible) {
				$("#progressbar").html('<div id="progress_bar_empty"><img scr="_lib/js/spacer.gif" width="1" height="1" alt="" border=0></div><div id="progress_bar_full"><img scr="_lib/js/spacer.gif" width="1" height="1" alt="" border=0></div><div id="progress_text">&nbsp;</div>');
				this.advance();
			}
		},
		/** Advances the progress bar by one*/
		advance : function () {
			var min = 0;
			for(var i = 0, l = sectionBreaks.length; i < l && sectionBreaks[i] <= that.position; i++){
				min = sectionBreaks[i];
			}

			var max = (i === l && min == sectionBreaks[i-1]) ? that._screens.length : sectionBreaks[i];
		
			if (visible) {
				$("#progress_bar_empty").width((max-min-(that.position+1))*adjust +  "px");
				$("#progress_bar_full").width((that.position-min+1)*adjust + "px");
				if (percentage) {
					$("#progress_text").html( Math.floor(100*(that.position-min+1)/(max-min)) + "%");
				} else {
					$("#progress_text").html((that.position-min+1) + "/" + (max-min));
				}
			}
		},
		/**
		 * Adds a section break for the progress bar. By default, it
		 * inserts a section break at the end of the screens.
		 * @param [where=Experigen.position]
		 * @example
		 * Experigen.addStaticScreen("intro.ejs");
		 * Experigen.addBlock(trainingBlock);
		 * Experigen.progressbar.addSectionBreak();
		 * Experigen.addStaticScreen("ratingintro.ejs");
		 * Experigen.addBlock(ratingBlock);
		 */
		addSectionBreak : function(where){
			if(where === undefined){
				where = Experigen._screens.length;
			}
			sectionBreaks.push(where);
		}
	}
};

Experigen.manageLocalData = function () {

	var html = '<div id="localStorageAccess" style="position:absolute; bottom: 0px; left: 0px; cursor:pointer;" onClick="$(\'#localStorageInterface\').toggle()">O</div>';
	$('body').append(html);

	html = '<div id="localStorageInterface" style="display:none; background: white; margin: 30px auto; padding: 30px; width: 500px; position:relative;">'
		+ '<input type="button" style="margin: 30px;" value="I am on a laptop, send the data on this computer to the server" onClick="Experigen.synchLocalData()"><br>'
		+ '<input type="button" style="margin: 30px;" value="I am on an iDevice, email me the data" onClick="Experigen.emailLocalData()" disabled=true><br>'
		+ '<input type="button" style="margin: 30px;" value="erase the data on this computer" onClick="if(confirm(\'Are you sure? No undo!\')) Experigen.eraseLocalData();">'
		+ '<div style="position:absolute; top:0px;right:2px;cursor:pointer;" onClick="$(\'#localStorageInterface\').toggle()">X</div>'
		+ '</div>';

	$('body').append(html);

};

Experigen.synchLocalData = function () {
	var data = $.totalStorage(Experigen.settings.experimentName);
	for (var i=0; i<data.length; i=i+1) {
		this.sendForm(data[i]);
	}
};

Experigen.emailLocalData = function () {

};

Experigen.eraseLocalData = function () {
	$.totalStorage(Experigen.settings.experimentName,'');
};


/**
 * Adds a plugin to the set of plugins, which will be available on the screen/trial level.
 * @param plugin {Function} A plugin with the following methods available: extendtrial, onload,
 * onadvance, onresponse
 * @param [plugin.extendtrial] {Function} A function called at the creation of a {@link Experigen.trial}.
 * You can define functions here that will be available from the trial. Its one argument is the trial
 * object to be extended.
 * @param [plugin.onload] {Function} A function called at the loading of the experiment. Its argument
 * is a callback function that it calls after finishing.
 * @param [plugin.onadvance] {Function} A function called at each Experigen.advance. Its one argument is
 * a boolean that tells you whether it's the final advance on the screen (before sending data) or not.
 * Returns a boolean: if it returns false, the advancement will be stopped.
 * @param [plugin.onresponse] {Function} A function called at the response to a scale. Its arguments,
 * scaleNo and buttonNo are shared with {@link Experigen.trial.recordResponse}.
 * @param [plugin.stopload] {boolean} If set to true, the loading of the experiment will be stopped
 * while the onload part of the plugin is loading (until the callback returns).
 */
Experigen.registerPlugin = function(plugin){
	Experigen.plugins.push(plugin);
}

