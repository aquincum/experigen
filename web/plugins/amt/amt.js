/**
 * @file 
 * A plugin to deal with Amazon Mechanical Turk
 */
$.getScript("_lib/amt/hmac-sha1.js", function () {
	$.getScript("_lib/amt/enc-base64-min.js", function () {
		Experigen.registerPlugin({
			var _prehashed, _accessKey; // private variables
			onload: function(callback) {
				Experigen.AMT = {
					pipe: "http://pipes.yahoo.com/pipes/pipe.run?_id=c56aace2b039989e4445a943ef10cd5c",
					sendRequest: function(request, innercb, n){
						if(n === undefined) n = 30;
						request["AWSAccessKeyId"] = _accessKey;
						request["Version"] = "2014-08-15";
						var now = new Date();
						var timestamp = now.toISOString().split(".")[0] + "Z";
						request["Timestamp"] = timestamp;
						request["Signature"] = Experigen.AMT.sign(request);
						console.log(request);
						var url = Experigen.AMT.sandbox ?
							"https://mechanicalturk.sandbox.amazonaws.com/?Service=AWSMechanicalTurkRequester" :
							"https://mechanicalturk.amazonaws.com/?Service=AWSMechanicalTurkRequester";
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
								innercb({Error: err});
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
						var pre = _prehashed;
						var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, "unused");
						hmac._iKey.words = pre._iKey.words.slice();
						hmac._iKey.sigBytes = pre._iKey.sigBytes;
						hmac._oKey.words = pre._oKey.words.slice();
						hmac._oKey.sigBytes = pre._oKey.sigBytes;
						hmac._hasher._hash.words = pre._hasher._hash.words.slice();
						hmac._hasher._hash.sigBytes = pre._hasher._hash.sigBytes;
						hmac = hmac.update("AWSMechanicalTurkRequester" + request["Operation"] + request["Timestamp"]);
						return CryptoJS.enc.Base64.stringify(hmac.finalize());
					},

					submit: function(extraparams){
						var url = Experigen.AMT.sandbox ?
							"https://workersandbox.mturk.com/mturk/externalSubmit?" :
							"https://www.mturk.com/mturk/externalSubmit?";
						
						var params = extraparams || {};
						params["assignmentId"] = Experigen.AMT.assignmentId;
						
						$.ajax(url, {
							type: "POST",
							data: params
						}).fail(function(a,b,c){
							alert("Posting to Amazon Mechanical Turk failed. Try again?");
							console.log(a,b,c);
						}).done(function(result){
							console.log("Posting to AMT succeeded. " + result);
						});
					},

					grantBonus: function(amount, reason, innercb){
						var urt = (new Date()).now.toISOString() + Experigen.userCode;
						this.sendRequest({Operation: "GrantBonus",
										  WorkerId: this.workerId,
										  AssignmentId: this.assignmentId,
										  "BonusAmount.1.Amount": amount,
										  "BonusAmount.1.CurrencyCode": "USD",
										  Reason: escape(reason),
										  UniqueRequestToken: urt
									}, function jumimuh(result){
										innercb();
									});
					}

				};
				Experigen.AMT.sandbox = false;
				if(Experigen.settings.pluginsettings)
					if(Experigen.settings.pluginsettings.sandbox)
						Experigen.AMT.sandbox = Experigen.settings.pluginsettings.sandbox;

				$.ajax("plugins/amt/amtsettings.js", 
					   {dataType: "json"}
					  ).done(function(result){
						  _prehashed = result;
						  _accessKey = result.ak;
					  }).fail(function(x,stat,err){
						  console.log("Error loading credentials from amtsettings.js.");
						  console.log(stat);
						  console.log(err);
					  });
				

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

	});
});
