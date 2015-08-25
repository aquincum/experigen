/**
 * @file
 * A plugin for enabling repeated playback of sound files, related to wavhtml5
 */


Experigen.registerPlugin({
	extendtrial: function(that) {
		that.handleWAVError = function(event){
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
		that.registerSoundPlay = function (audiotag,isi){
			audiotag.pause();
			audiotag.onplay = audiotag.oncanplay = null;
			var now = (new Date()).getTime(),
			d = now-Experigen.lastPlay;
			console.log("Playing, d="+d);
			if (d < isi){
				setTimeout(function(){
					audiotag.play();
				},isi-d);
			}
			else {
				audiotag.play();
			}
		};

		that.finishPlaying = function(id) {
			// find soundbutton
			var sb, sbs = Experigen.screen().soundbuttons;
			for (i = 0; i < sbs.length; i+=1) {
				if (sbs[i].id == id) {
					sb = sbs[i];
					break;
				}
			}

			Experigen.screen().playing = false;
			$('input:button#'+id).removeAttr('disabled'); //!
			if (sb.advance) {
				Experigen.screen().advance();
			}
			if(sb.limited){
				if (sb.maxRepeat <= sb.presses){
					$("#" + sb.id).attr("disabled","disabled");
					$("#" + sb.id).attr("title","You can only listen to the sound "+sb.maxRepeat+" times");
				}
			}
		};

		that.playOneWAVSound = function(soundfileid, isi, n, which, soundlen) {
			Experigen.lastPlay = (new Date()).getTime();
			var idx = which % soundlen;
			var audiotag = $("#audio" + soundfileid + "x" + idx)[0];
			console.log("n="+n+", which="+which+", idx="+idx)
			audiotag.onplay = function(){ Experigen.screen().registerSoundPlay(audiotag,isi);};
			audiotag.play();
			audiotag.oncanplay = audiotag.play;
			
			which = which + 1;
			console.log("Stopped or first; idx="+idx+", playing="+JSON.stringify(Experigen.screen().playing));
			if (which === n) {
				audiotag.onended = function() {
					Experigen.screen().finishPlaying(soundfileid);
				};
			}
			else {
				audiotag.onended = function(){
					Experigen.screen().playOneWAVSound(soundfileid,isi,n,which,soundlen);
				};
			}
		};


		that.playNTimesWAVSound = function (id, isi, n, caller) {
			// find soundbutton
			var sb, sbs = Experigen.screen().soundbuttons;
			for (i = 0; i < sbs.length; i+=1) {
				if (sbs[i].id == id) {
					sb = sbs[i];
					break;
				}
			}
			// play the sound
			if(Experigen.screen().playing) return;
			Experigen.screen().playing = true;
			$('input:button#'+id).attr('disabled','disabled'); //!
			//		Experigen.wpHID = wp.getPlayer().attachHandler("PLAYER_STOPPED","console.log('Empty stop')");
			Experigen.lastPlay = (new Date()).getTime()-isi;
			Experigen.screen().playOneWAVSound(id,isi,n,0,sb.file.length);
			
			sb.presses += 1;

			// find who called it, so the screen can advance 
			// when the sound is done playing
			Experigen.screen().findCaller(caller);
		};


		/**
		 * This function inserts the HTML for multiple playback.
		 * @param obj {Object} A collection of options
		 * @param [obj.label] {String} The label of the button. By default, taken from {@link Experigen.settings}.strings.soundButton
		 * @param [obj.soundID] {boolean} An ID for the sound, by default the trial number + rank of the sound.
		 * @param [obj.soundFile] {String|Object} Either a filename, in which case the same 
		 * file will be played n times, or an array of filenames, in which case the sound played
		 * will be circulated through the array. 
		 * @param [obj.n] {Number} How many repetitions in the playback. If soundFile is an array, default n is length of array.
		 * @param [obj.isi] {Number} Guaranteed minimum ISI in ms. Default is 500.
		 * @param [obj.maxRepeat] {Number} How many times playback can be repeated by the subject.
		 */
		that.makeNTimesWAVSoundButton = function (obj) {
			Experigen.screen().playing = false;
			var i;
			var label = obj.label || Experigen.settings.strings.soundButton;
			var soundID  = obj.soundID || (Experigen.screen()[Experigen.resources.items.key]||"") + Experigen.screen().trialnumber + Experigen.screen().soundbuttons.length;
			var soundFile = typeof soundFile === "string" ? [obj.soundFile] : obj.soundFile;
			for(i = 0; i < soundFile.length; i++){
				soundFile[i] = Experigen.settings.folders.sounds + soundFile[i];
			}
			var isi = obj.isi || 500;
			var n;
			if(obj.n){
				n = obj.n
			}
			else {
				n = (soundFile.length == 1) ? 3 : soundFile.length;
			}
			var autoplay = obj.autoplay || false;
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
			var advance = true;
			if (obj.advance===false) {
				advance = false;
			}
			Experigen.screen().soundbuttons.push({id: soundID, presses: 0, file: soundFile, advance: advance, limited: limited, maxRepeat: maxRepeat}); //?

			var str = "";
			str += '<input type="button" ';
			str += ' id="' + soundID +'"';
			str += ' value="' + label + '"';
			var playcode = 'Experigen.screen().playNTimesWAVSound(\'' + soundID + '\',' + isi + ',' + n + ', this);'
			str += ' onClick="' + playcode + '"';
			str += ' onerror="Experigen.screen().handleWAVError;"';
			str += ' style="margin-left: 10px;"';
			str += '>';
			for(i = 0; i < soundFile.length; i++){
				str += '<audio src="' + soundFile[i] + '" ';
				str += 'id="audio' + soundID + 'x' + i + '" ';
				str += 'preload="auto" ';
				if (autoplay){
					str += ' oncanplay="' + playcode + '"';
				}
				str +=  '>';
			}
			str += '</audio>';
			return str;
		};
	}
});
