/**
 * @file 
 * A plugin to deal with Amazon Mechanical Turk
 */
$.getScript("_lib/amt/hmac-sha1.js", function () {
	$.getScript("_lib/amt/enc-base64-min.js", function () {
		Experigen.registerPlugin({
			onload: function(callback) {
				Experigen.AMT = {
					pipe: "http://pipes.yahoo.com/pipes/pipe.run?_id=c56aace2b039989e4445a943ef10cd5c",
					sendRequest: function(request, innercb, n){
						if(n === undefined) n = 30;
						request["AWSAccessKeyId"] = Experigen.AMT.accessKey;
						request["Version"] = "2014-08-15";
						var now = new Date();
						var timestamp = now.toISOString().split(".")[0] + "Z";
						request["Timestamp"] = timestamp;
						request["Signature"] = Experigen.AMT.sign(request);
						console.log(request);
						var url = "https://mechanicalturk.amazonaws.com/?Service=AWSMechanicalTurkRequester";
						for(x in request){
							if(request.hasOwnProperty(x)){
								url += "&" + x + "=" + request[x];
							}
						}
						console.log(url);
						var failresponse = function(err){
							if(n > 0){
								Experigen.AMT.sendRequest(request, innercb, n - 1);
							}
							else {
								console.log("Error sending request to AMT: " + err);
								innercb(err);
							}

						}
						$.ajax(Experigen.AMT.pipe, {
							data: {awsURL: url, _render: "json"}, 
							dataType: "jsonp",
							jsonp: "_callback",
							crossDomain: true, 
							xhrFields: {"withCredentials":true}
						}).done(function(result){
							if(result.value.items[0].OperationRequest.Errors){
								failresponse(result.value.items[0].OperationRequest.Errors.Error.Message);
							}
							else {
								innercb(result.value.items[0]);
							}
						}).fail(function(jx, stat, err){
							failresponse(stat + ", " + err);
						});

					},
					
					sign: function(request){
						var pre = Experigen.AMT.prehashed;
						var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, "unused");
						hmac._iKey.words = pre._iKey.words.slice();
						hmac._iKey.sigBytes = pre._iKey.sigBytes;
						hmac._oKey.words = pre._oKey.words.slice();
						hmac._oKey.sigBytes = pre._oKey.sigBytes;
						hmac._hasher._hash.words = pre._hasher._hash.words.slice();
						hmac._hasher._hash.sigBytes = pre._hasher._hash.sigBytes;
						hmac = hmac.update("AWSMechanicalTurkRequester" + request["Operation"] + request["Timestamp"]);
						return CryptoJS.enc.Base64.stringify(hmac.finalize());
					}
					
				};
				$.ajax("plugins/amt/amtsettings.js", 
					   {dataType: "json"})
					.done(function(result){
						Experigen.AMT.prehashed = result;
						Experigen.AMT.accessKey = result.ak;
					})
					.fail(function(x,stat,err){
						console.log("Error loading credentials from amtsettings.js.");
						console.log(stat);
						console.log(err);
					});
				
				if(callback) callback();
			}
		});

	});
});
