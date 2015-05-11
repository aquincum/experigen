/**
 * @file A plugin that loads the SoundManager, the so far default plugin for 
 * MP3 playback
 */

$.getScript("../_lib/soundman/script/soundmanager2-nodebug-jsmin.js", function () {
	$.getScript("../_lib/soundman/config.js", function(){
		Experigen.registerPlugin({
			onload: function(callback){
				soundManager.reboot();
				soundManager.onready(function(){
					if(callback) callback();
				});
			},
			stopload: true,
			extendtrial: function (that){

				/**
				 * The soundManager way to play a sound (no WAVs). Called with a soundID. Invoked by
				 * the sound button.
				 * @method
				 * @memberof Experigen.trial
				 */
				that.playSound = function (soundID, caller) {
					// play the sound
					soundManager.play(soundID);
					for (i=0; i<Experigen.screen().soundbuttons.length; i+=1) {
						if (Experigen.screen().soundbuttons[i].id === soundID) {
							Experigen.screen().soundbuttons[i].presses += 1;
						}
					}
					// find who called it, so the screen can advance 
					// when the sound is done playing
					Experigen.screen().findCaller(caller);
				}

				/** 
				 * Inserts a soundManager sound play button (no WAVs) to the DOM and to the Experigen.trial model.
				 * @method
				 * @memberof Experigen.trial
				 * @param obj {Object|String} A collection of options, or simply the file name of the sound.
				 * @param [obj.label] {String} The label of the button. By default, thaken from {@link Experigen.settings}.strings.soundButton
				 * @param [obj.soundID] {boolean} An ID for the sound, by default the trial number + rank of the sound.
				 * @param [obj.soundFile] {String} The file name of the sound.
				 * @param [obj.advance] {boolean} Whether to advance on play.
				 * @param [obj.soundFile2] {String} An optional 2nd sound file for 2 sound buttons next to each other
				 */
				that.makeSoundButton = function (obj) {

					if (typeof obj==="string") {
						obj = {soundFile: obj}
					}
					var label = obj.label || Experigen.settings.strings.soundButton;
					var soundID  = obj.soundID || Experigen.screen().trialnumber + Experigen.screen().soundbuttons.length;
					soundID = "_" + soundID; // force all sounds to start with a non-numeric character
					var soundFile = Experigen.settings.folders.sounds + obj.soundFile;
					var advance = true;
					if (obj.advance===false) {
						advance = false;
					}
					Experigen.screen().soundbuttons.push({id: soundID, presses: 0, file: soundFile});
					
					var soundFile2 = "";
					if (obj.soundFile2) {
						soundFile2 = Experigen.settings.folders.sounds + obj.soundFile2;
					}
					var soundID2  = soundID + "_2";
					
					soundManager.createSound({
						id: soundID,
						url: soundFile,
						autoPlay: false, 
						autoLoad: true,
						onfinish:function() {
							if (advance) {
								if (soundFile2 === "") {
									Experigen.screen().advance();
								} else {
									soundManager.play(soundID2);
								}
							}
						}
					});
					if (soundFile2 != "") {
						soundManager.createSound({
							id: soundID2,
							url: soundFile2,
							autoPlay: false, 
							autoLoad: true,
							onfinish:function() {
								if (advance) {
									Experigen.screen().advance();
								}
							}
						});
					}
					var str = "";
					str += '<input type="button" ';
					str += ' id="' + soundID +'"';
					str += ' value="' + label + '"';
					str += ' onClick="Experigen.screen().playSound(\'' + soundID + '\',this);"'
					str += ' class="soundbutton"'
					str += '>';
					return str;
				}
				


			}
			
		});
	});
});
