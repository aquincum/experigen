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
					sendRequest: function(request, innercb){
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
						$.ajax(Experigen.AMT.pipe, {
							data: {awsURL: url, _render: "json"}, 
							dataType: "jsonp",
							jsonp: "_callback",
							crossDomain: true, 
							xhrFields: {"withCredentials":true}
						}).done(function(result){
							innercb(result.value.items[0]);
						}).fail(function(jx, stat, err){
							console.log("Error sending request to AMT: " + stat + ", " + err);
						});

					},
					
					sign: function(request){
						var hmac = Experigen.AMT.prehashed;
						hmac.update("AWSMechanicalTurkRequester" + request["Operation"] + request["Timestamp"]);
						return CryptoJS.enc.Base64.stringify(hmac.finalize());
					}
					
				};
				$.ajax("plugins/amt/amtsettings.js", 
					   {dataType: "json"})
					.done(function(result){
						var pre = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, "unused");
						pre._iKey.words = result._iKey.words;
						pre._iKey.sigBytes = result._iKey.sigBytes;
						pre._oKey.words = result._oKey.words;
						pre._oKey.sigBytes = result._oKey.sigBytes;
						pre._hasher._hash.words = result._hasher._hash.words;
						pre._hasher._hash.sigBytes = result._hasher._hash.sigBytes;

						Experigen.AMT.prehashed = pre;
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
