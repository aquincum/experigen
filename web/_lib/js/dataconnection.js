// Changes: encoding protocol and pathname to the upload sourceurl field; allowing spaces in resource fields
// connection to local text files and to the database

/**
 * @file Handling data connections between the server and the client side
*/

/**
 * Loads the user codes assigned by the server to Experigen.userFileName and
 * randomize the first 3 characters of Experigen.userCode
 */
Experigen.loadUserID = function () {
	var that = this; // Experigen

	var sURL = Experigen.settings.sourceHtml ? Experigen.settings.sourceHtml : (window.location.protocol + "//" + window.location.hostname + window.location.pathname);
	var jsonp_url = this.settings.databaseServer + "getuserid.cgi?experimentName=" + this.settings.experimentName  + "&sourceurl=" + encodeURIComponent(sURL); // we get
	
	if (this.settings.online) {
		// online mode: connect to the database server
		$.ajax({
			dataType: 'jsonp',
			url: jsonp_url,  
			success: function (data) {
				that.userFileName = data;
				var code =  String.fromCharCode(65 + Math.floor(Math.random()*26)) + String.fromCharCode(65 + Math.floor(Math.random()*26)) + String.fromCharCode(65 + Math.floor(Math.random()*26));
				that.userCode = code + that.userFileName;	
				
				that.load();
				//console.debug(data);
			}
		});

	} else {
		// offline mode

		// find device name
		if (!$.totalStorage('deviceName')) {
			var name =  String.fromCharCode(65 + Math.floor(Math.random()*26)) + String.fromCharCode(65 + Math.floor(Math.random()*26)) + String.fromCharCode(65 + Math.floor(Math.random()*26));
			$.totalStorage('deviceName',name);
		}
		// find record of last file name, add 1 to that
		if (!$.totalStorage('fileName')){
			$.totalStorage('fileName', {});
		}
		var fileName = $.totalStorage('fileName');
		if (fileName && !fileName[this.settings.experimentName]) {
			fileName[this.settings.experimentName] = 0;
			$.totalStorage('fileName',fileName);
		} 
		fileName[this.settings.experimentName] += 1;
		$.totalStorage('fileName',fileName);
		this.userFileName = $.totalStorage('fileName')[this.settings.experimentName];
		var code =  String.fromCharCode(65 + Math.floor(Math.random()*26)) + String.fromCharCode(65 + Math.floor(Math.random()*26)) + String.fromCharCode(65 + Math.floor(Math.random()*26));
		this.userCode = code + this.userFileName;	
		this.load();
		// create interface for managing local data
		this.manageLocalData();
	}
}


/**
 * the method called when sending information to the server. Sends a given form
 * element from the DOM in a JSON serialized way.
 * @param formObj The form element in the DOM to send the server
 * @returns {boolean} true, if the AJAX request succeeds
*/
Experigen.sendForm = function (formObj) {
	
	if (this.settings.online) {
		// online mode	
		var jsonp_url = this.settings.databaseServer + "dbwrite.cgi?" + formObj.serialize();
		$.ajax({
			dataType: 'jsonp',
			url: jsonp_url,  
			success: function (data) {
				//console.debug(data);
				return true;
			}
		});

	} else {
	
		//offline mode --- write locally if object, send to server if string
		if (typeof formObj==="string") {
			
			var jsonp_url = this.settings.databaseServer + "dbwrite.cgi?" + formObj;
			$.ajax({
				dataType: 'jsonp',
				url: jsonp_url,  
				success: function (data) {
					//console.debug(data);
					return true;
				}
			});
			
		} else {
			formObj.append('<input type="hidden" name="deviceName" value="' + $.totalStorage('deviceName') + '">');
			formObj.append('<input type="hidden" name="localTime" value="' + Date().toString() + '">');
			var experiment = $.totalStorage(this.settings.experimentName) || [];
			experiment.push(formObj.serialize());
			$.totalStorage(this.settings.experimentName, experiment);
		}

	}
}


/**
 * A wrapper around a simple AJAX request to a page.
 * @param spec {Object} An object with three fields: url, wait, destination.
 *    url -- the URL the request goes to;
 *    wait -- false if asynchronic request;
 *    destination -- a jQuery/CSS selector the data will be loaded to;
 * @returns {Object} an object with two fields: key, table
 *    key -- the array of the key (1st) field;
 *    table -- the array of items
 */
Experigen.loadText = function (spec) {
	var url = spec.url;
	var wait = spec.wait;
	var destination = spec.destination;
	
	$.ajax({
		url: url,
		success: function (data) {
			$(destination).html(data);
		},
		async: !wait,
		error: function() {
			console.error("Error! Footer not found.");
		}
	});
}



/**
 * The method that loads the resources to an array of items.
 * @param name The URL of the resource file
*/
Experigen.loadResource = function (name) {

	var key = "";
	var items = [];
	
	$.ajax({
		url: name,
		success: function(data) {
			var lines = data.split(/[\n\r]/); // split by newline
			var fields = lines[0].replace(/\s+$/, '').split("\t"); // split first line by tab separators

			// saving the first line as field names
			key = fields[0]; // for now, the "key" for a tab-delimited file is always the first before the file's first tab
			if (!fields.uniqueNonEmpty()) { // the key has to be unique and non-empty
				console.error("Field names in " + name + " must be unique and non-empty!");
				return false;
			}

			// loading items
			var keys = []; // these are saved to be evaluated by uniqueNonEmpty()
			LINE: for (var i=1; i<lines.length; i++) { // for each line
				if (lines[i].match(/^\s*$/)) { // If the line starts with whitespace, ignore it
					continue LINE;
				}
				// var line = lines[i].replace(/\s+$/, '').split("\t"); // COMMENTED IT OUT BECAUSE OF TAB SEP FILES WITH SPACES IN FIELDS
				var line = lines[i].split("\t"); // split line by tabs
				keys.push(line[0]); // save the key
				var frame = {}; // the item to save
				for (var j=0; j<line.length; j++) {
					frame[ fields[j] ] = line[j];
				}
				//console.log(frame);
				items.push(frame); // save
			}
			if(!keys.uniqueNonEmpty()) {
				console.error("In " + name + ", the values of the first column must be unique and non-empty!");
				return false;
			}
			return true;
		},
		async: false,
		error: function() {
			console.error("The file " + name + " wasn't found.");
			return false;
		}
	});
	
	return {table: items, key: key};
}
