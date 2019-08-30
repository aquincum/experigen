(function (){

Experigen.setCookie = function (name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

Experigen.getCookie = function (name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
    return null;
};


// Attempts at eligibility counter
Experigen.getEligCount = function () {

	var eligCount = 0;
	var eligStr = Experigen.getCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "elig");
	if (eligStr) {
		eligCount = parseInt(eligStr);
	}

	return eligCount;
}

Experigen.increaseEligCount = function () {

	var oldElig = Experigen.getEligCount();
	var newElig = oldElig + 1 
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "elig",newElig,30);
}


// Block-related cookie
Experigen.getBlocksDone = function () {
	
	var rv = [];
	var blocks = Experigen.getCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "blocks");
	if (blocks) {
		rv = blocks.split('.');
	}
	
	return rv;
}

Experigen.addBlockDone = function(block) {
	var blocks = Experigen.getBlocksDone();
	var out = blocks.concat(block).join('.');
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "blocks",out,30);
}


// Version-related cookie
Experigen.getVsDone = function () {
	var vs = Experigen.getCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "vs");
	if (vs === null) {
		var vsStr = "";
	} else {
		var vsStr = vs;
	};

	return vsStr
}

Experigen.setVsDone = function(vs) {
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "vs",vs,30);
}
	
	
Experigen.clearCookies = function() {
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "blocks","",-1);
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "fail","",-1);
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "elig","",-1);
	Experigen.setCookie(Experigen.settings.pluginsettings.accesscontrol.cookieprefix + "vs","",-1);
}
})();
