/** STILL BUGGY */

if(Experigen.settings.online){
	var jsonp_url = Experigen.settings.databaseServer + "getuserid.cgi?experimentName=" + Experigen.settings.experimentName  + "&sourceurl=" + encodeURIComponent(window.location.protocol + "//" + window.location.hostname + window.location.pathname); // we get the user ID based from the server
	var innerLoad = function(data){
		if(Experigen.userFileName === ""){
			setTimeout(function(){ innerLoad(data); }, 500);
			return;
		}
		Experigen.userFileName = data;
		
		var code = "", i, s = {};
		if (Experigen.settings.pluginsettings)
			s = Experigen.settings.pluginsettings.expanded_usercode || {};

		var nChars = s.nChars || 6;

		for(i = 0; i < nChars; i++){
			code +=  String.fromCharCode(65 + Math.floor(Math.random()*26));
		}
		Experigen.userCode = code + Experigen.userFileName;
		$("input[name='userCode']").val(Experigen.userCode);
	};
	$.ajax({
		dataType: 'jsonp',
		url: jsonp_url,  
		success: innerLoad
	});
}

