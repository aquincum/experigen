/**
 * @file 
 * A plugin to deal with Amazon Mechanical Turk
 * Only the External Question part
 */

Experigen.registerPlugin({
	onload: function(callback) {
		Experigen.AMT = {
			submit: function(extraparams, innercb){
				var url = Experigen.AMT.sandbox ?
					"https://workersandbox.mturk.com/mturk/externalSubmit?" :
					"https://www.mturk.com/mturk/externalSubmit?";
				
				var params = extraparams || {};
				params["assignmentId"] = Experigen.AMT.assignmentId;
				
				$.ajax(url, {
					type: "POST",
					data: params
				}).fail(function(a,b,c){
					console.log(a,b,c);
					if (innercb)
						innercb({error: 1, errorInfo: [a,b,c]});
				}).done(function(result){
					console.log("Posting to AMT succeeded. " + result);
					if (innercb)
						innercb({error: 0});
				});
			},
		};
		Experigen.AMT.sandbox = false;
		if(Experigen.settings.pluginsettings)
			if(Experigen.settings.pluginsettings.sandbox)
				Experigen.AMT.sandbox = Experigen.settings.pluginsettings.sandbox;


		// parse URL, invoked immediately
		(function parseURL(){
			var url = window.location.href;
			var args = url.slice(url.indexOf('?' + 1)).split('&');
			for(var i = 0; i < args.length; i++){
				var pair = args[i].split('=');
				if(pair[0] in ["assignmentId", "turkSubmitTo", "workerId", "hitId"]){
					Experigen.AMT[pair[0]] = pair[1];
				}
			}
		})(); // invoke immediately

		if(callback) callback();
	}
});
