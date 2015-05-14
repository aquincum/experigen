/**
 * @file The plugin for playing WAV files using HTML5.
 */

Experigen.registerPlugin({
	extendtrial: function (trial){

		/** 
		 * Inserts a wavPlayer sound play button (WAVs) to the DOM and to the Experigen.trial model.
		 * @method
		 * @memberof Experigen.trial
		 * @param obj {Object|String} A collection of options, or simply the file name of the sound.
		 * @param [obj.label] {String} The label of the button. By default, thaken from {@link Experigen.settings}.strings.soundButton
		 * @param [obj.soundID] {boolean} An ID for the sound, by default the trial number + rank of the sound.
		 * @param obj.soundFile {String} The file name of the sound.
		 * @param [obj.soundFileAlt] {String} The file name of the alternate sound.
		 * @param [obj.folder] {boolean} The folder to load the sound from.  By default, thaken from {@link Experigen.settings}.folders.sounds
		 * @param [obj.maxRepeat] {Number} How many times the sound play can be repeated by the subject.
		 * @param [obj.advance] {boolean} Whether to advance on play.
		 */
		var makeWAVSoundButton = function (obj) {
			if (typeof obj==="string") {
				obj = {soundFile: obj}
			}
			var maxRepeat;
			var limited;
			if (!obj.maxRepeat){
				maxRepeat = 0;
				limited = 0;
			}
			else{
				maxRepeat = obj.maxRepeat;
				limited = 1;
			}
			if (!obj.folder)
				obj.folder = Experigen.settings.folders.sounds;
			var advance = true;
			if (obj.advance===false) {
				advance = false;
			}

			var label = obj.label || Experigen.settings.strings.soundButton;
			var soundID  = obj.soundID || Experigen.screen().trialnumber + Experigen.screen().soundbuttons.length;
			var soundFile = obj.folder + obj.soundFile;
			obj.soundFile = soundFile;
			if(obj.soundFileAlt) obj.soundFileAlt = obj.folder + obj.soundFileAlt;
			Experigen.screen().soundbuttons.push({id: soundID, presses: 0, file: soundFile, limited: limited, maxRepeat: maxRepeat, advance: advance});

			var str = "";
			str += '<input type="button" ';
			str += ' id="' + soundID +'"';
			str += ' value="' + label + '"';
			str += ' onClick="Experigen.screen().playWAVSound(' + (Experigen.screen().soundbuttons.length-1) + ',this);"';
			str += ' onerror="Experigen.screen().handleWAVError;"';
			str += ' style="margin-left: 10px;"'
			str += '>';
			//	str += '<audio src="' + soundFile + '" ';
			str += '<audio ';
			str += 'id="audio' + soundID + '" ';
			str += 'preload="auto" ';
			str +=  '>';
			str += '<source src="' + soundFile + '">';
			if(obj.soundFileAlt)
				str += '<source src="' + obj.soundFileAlt + '">';
			//			str += '<p>Your browser does not support the <code>audio</code> element.</p>';
			str += '</audio>';
			return str;
		};

		var handleWAVError = function(event){
			var t = event.target;
			switch(t.error.code){
			case t.error.MEDIA_SRC_NOT_SUPPORTED:
				console.log("The video file is not supported.");
				break;
			case t.error.MEDIA_ERR_DECODE:
				alert("There is a decoding problem issue.");
				break;
			case t.error.MEDIA_ERR_NETWORK:
				alert("There is a network issue");
				break;
			}
			Experigen.screen().wavErrors = Experigen.screen().wavErrors ? Experigen.screen().wavErrors+1 : 1;
			if(Experigen.screen().wavErrors > 3){ // give up
				t.onerror = undefined;
				Experigen.screen().advance();
			}
			else{
				t.load();
				t.oncanplay = t.play;
			}
		};


		/**
		 * The wavPlayer way to play a sound (WAVs). 
		 * Invoked by the WAV sound button.  
		 * @param rank The rank of the soundbutton to play
		 * @method 
		 * @memberof Experigen.trial
		 */
		var playWAVSound = function (rank, caller) {
			// play the sound
			var sb = Experigen.screen().soundbuttons[rank]; // the soundbutton object
			var audiotag = $("#audio" + sb.id)[0]; // the audio tag
			if(sb.advance){
				audiotag.onended = function () {
					Experigen.screen().advance();
				};
			}
			audiotag.play();
			audiotag.oncanplay = audiotag.play; // if haven't fully loaded yet

			// attach advance if needed

			sb.presses += 1;
			if(sb.limited){
				if (sb.maxRepeat <= sb.presses){
					$("#" + sb.id).attr("disabled","disabled");
					$("#" + sb.id).attr("title","You can only listen to the sound "+sb.maxRepeat+" times");
				}
			}

			// find who called it, so the screen can advance 
			// when the sound is done playing
			Experigen.screen().findCaller(caller);
		};
		
		
		trial.makeWAVSoundButton = makeWAVSoundButton;
		trial.playWAVSound = playWAVSound;
		trial.handleWAVError = handleWAVError;
	}
});

