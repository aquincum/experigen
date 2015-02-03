/**
 * @file
 * A plugin for enabling repeated playback of sound files
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

		that.finishPlaying = function() {
			Experigen.screen().playing = false;
			$('input:button').first().removeAttr('disabled'); //!
			Experigen.screen().advance();
		};

		that.playOneWAVSound = function(soundfileid, isi, n) {
			Experigen.lastPlay = (new Date()).getTime();
			var audiotag = $("#audio" + soundfileid)[0];
			audiotag.onplay = function(){ Experigen.screen().registerSoundPlay(audiotag,isi);};
			audiotag.play();
			audiotag.oncanplay = audiotag.play;

			n = n - 1;
			console.log("Stopped or first; n="+n+", playing="+JSON.stringify(Experigen.screen().playing));
			if (n === 0) {
				audiotag.onended = Experigen.screen().finishPlaying;
			}
			else {
				audiotag.onended = function(){
					Experigen.screen().playOneWAVSound(soundfileid,isi,n);
				};
			}
		};


		that.playNTimesWAVSound = function (id, isi, n, caller) {
			// play the sound
			if(Experigen.screen().playing) return;
			Experigen.screen().playing = true;
			$('input:button').first().attr('disabled','disabled'); //!
			//		Experigen.wpHID = wp.getPlayer().attachHandler("PLAYER_STOPPED","console.log('Empty stop')");
			Experigen.lastPlay = (new Date()).getTime()-isi;
			Experigen.screen().playOneWAVSound(id,isi,n);
			
			for (i=0; i<Experigen.screen().soundbuttons.length; i+=1) {
				if (Experigen.screen().soundbuttons[i].id == id) {
					Experigen.screen().soundbuttons[i].presses += 1;
				}
			}
			// find who called it, so the screen can advance 
			// when the sound is done playing
			Experigen.screen().findCaller(caller);
		};




		that.makeNTimesWAVSoundButton = function (obj) {
			Experigen.screen().playing = false;

			var label = obj.label || Experigen.settings.strings.soundButton;
			var soundID  = obj.soundID || (Experigen.screen()[Experigen.resources.items.key]||"") + Experigen.screen().trialnumber + Experigen.screen().soundbuttons.length;
			var soundFile = Experigen.settings.folders.sounds + obj.soundFile;
			var isi = obj.isi || 500;
			var n = obj.n || 3;
			obj.soundFile = (aFile+bFile+xFile);
			var advance = true;
			if (obj.advance===false) {
				advance = false;
			}
			Experigen.screen().soundbuttons.push({id: soundID, presses: 0, file: obj.soundFile}); //?

			var str = "";
			str += '<input type="button" ';
			str += ' id="' + soundID +'"';
			str += ' value="' + label + '"';
			str += ' onClick="Experigen.screen().playNTimesWAVSound(\'' + soundID + '\',' + isi + ',' + n + ',' + this);"';
			str += ' onerror="Experigen.screen().handleWAVError;"';
			str += ' style="margin-left: 10px;"';
			str += '>';
			str += '<audio src="' + soundFile + '" ';
			str += 'id="audio' + soundID + 'a" ';
			str += 'preload="auto" ';
			str +=  '>';
			str += '<p>Your browser does not support the <code>audio</code> element.</p>';
			str += '</audio>';
			return str;
		};
	}
});
