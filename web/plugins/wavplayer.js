/**
 * @file The plugin for playing WAV files using Flash.
 */

Experigen.addScreenPlugin(function(trial) {


	/** 
	 * Inserts a wavPlayer sound play button (WAVs) to the DOM and to the Experigen.trial model.
	 * @method
	 * @memberof Experigen.trial
	 * @param obj {Object|String} A collection of options, or simply the file name of the sound.
	 * @param [obj.label] {String} The label of the button. By default, thaken from {@link Experigen.settings}.strings.soundButton
	 * @param [obj.soundID] {boolean} An ID for the sound, by default the trial number + rank of the sound.
	 * @param [obj.soundFile] {String} The file name of the sound.
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
		var advance = true;
		Experigen.screen().soundbuttons.push({id: soundID, presses: 0, file: soundFile, limited: limited, maxRepeat: maxRepeat, advance: advance});
		
		var str = "";
		str += '<input type="button" ';
		str += ' id="' + soundID +'"';
		str += ' value="' + label + '"';
		str += ' onClick="Experigen.screen().playWAVSound(\'' + obj.soundFile + '\',this);"';
		str += ' style="margin-left: 10px;"'
		str += '>';
		return str;
	};


	/**
	 * The wavPlayer way to play a sound (WAVs). Called with a sound
	 * file name. Invoked by the WAV sound button.  @method @memberof
	 * Experigen.trial
	 */
	var playWAVSound = function (soundfile, caller) {
		// play the sound
		wp.doPlay(soundfile);
		if(Experigen.screen().soundbuttons[0].advance)
			wp.getPlayer().attachHandler("PLAYER_STOPPED","Experigen.screen().advance()")
		for (i=0; i<Experigen.screen().soundbuttons.length; i+=1) {
			if (Experigen.screen().soundbuttons[i].file == soundfile) {
				Experigen.screen().soundbuttons[i].presses += 1;
				if(Experigen.screen().soundbuttons[i].limited){
					if (Experigen.screen().soundbuttons[i].maxRepeat <= Experigen.screen().soundbuttons[i].presses){
						$("#" + Experigen.screen().soundbuttons[i].id).attr("disabled","disabled");
						$("#" + Experigen.screen().soundbuttons[i].id).attr("title","You can only listen to the sound "+Experigen.screen().soundbuttons[i].maxRepeat+" times");
					}
				}
			}
		}
		
		// find who called it, so the screen can advance 
		// when the sound is done playing
		Experigen.screen().findCaller(caller);
	};

	trial.makeWAVSoundButton = makeWAVSoundButton;
	trial.playWAVSound = playWAVSound;
	
});

/**
 * The WavPlayer handler
 * @class
 * @param _pid A DOM ID for the element.
 * @param path Path to the flash.
 */
function WavPlayer(_pid,path)
{
	this.pid = _pid;
	this.path = path || "./";
	var that = this;

	/**
	 * Appends the flash in a 1x1 object to the page.
	 * @method
	 */
	this.appendFlash = function () {
		var str = "";
		str += '<div class="scaleWrapper">';
		str += '<div id="InfoFile"></div>';
		str += '<div id="InfoSound"></div>';
		str += '<div id="InfoState" hidden=true></div>';
		str += '<object    classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"';
		str += '		width="1"';
		str += '	height="1"';
		str += '	id="' + this.pid + '"';
		str += '	align="middle">';
//		str += '<param name="movie" value="' + this.path + 'wavplayer.swf?gui=none&h=20&w=300&"/>';
		str += '<param name="movie" value="' + this.path + 'wavplayer.swf?gui=none&"/>';
		str += '<param name="allowScriptAccess" value="always" />';
		str += '<param name="quality" value="high" />';
		str += '<param name="scale" value="noscale" />';
		str += '<param name="salign" value="lt" />';
		str += '<param name="bgcolor" value="#dddddd"/>';
//		str += '<embed src="' + this.path + 'wavplayer.swf?gui=none&h=20&w=300&"';
		str += '<embed src="_lib/wavplayer/wavplayer.swf?gui=none&"';
//		str += '	   bgcolor="#dddddd"';
		str += '	   bgcolor="' + $("#main").css("background-color") + '"';
		str += '	   width="1"';
		str += '	   height="1"';
		str += '	   name="' + this.pid + '"';
		str += '	   quality="high"';
		str += '	   gui="none"';
		str += '	   align="middle"';
		str += '	   scale="noscale"';
		str += '	   allowScriptAccess="always"';
		str += '	   type="application/x-shockwave-flash"';
		str += '	   pluginspage="http://www.macromedia.com/go/getflashplayer"';
		str += '/>';
		str += '</object>';
		$('body').append(str);
	}
	this.getPlayer = function() {
		var obj = document.getElementById(this.pid);
		if(obj == null){
			this.appendFlash();
			var obj = document.getElementById(this.pid);
		}
		if (obj.doPlay) return obj;
		for(i=0; i<obj.childNodes.length; i++) {
			var child = obj.childNodes[i];
			if (child.tagName == "EMBED") return child;
		}
	}
	/**
	 * Plays a WAV file
	 * @param fname The path to the WAV file
	 * @method
	 */
	this.doPlay = function(fname) {
		var player = this.getPlayer();
		player.doPlay(fname);
	}
	this.doStop = function() {
		var player = this.getPlayer();
		player.doStop();
	}
	this.setVolume = function(v) {
		var player = this.getPlayer();
		player.setVolume(v);
	}
	this.setPan = function(p) {
		var player = this.getPlayer();
		player.setPan(p);
	}
	this.SoundLen = 0;
	this.SoundPos = 0;
	this.Last = undefined;
	this.State = "STOPPED";
	this.Timer = undefined;
	this.getPerc = function(a, b) {
		return ((b==0?0.0:a/b)*100).toFixed(2);
	}
	this.FileLoad = function(bytesLoad, bytesTotal) {
		document.getElementById('InfoFile').innerHTML = "Loaded "+bytesLoad+"/"+bytesTotal+" bytes ("+this.getPerc(BytesLoad,BytesTotal)+"%)";
	}
	this.SoundLoad = function(secLoad, secTotal) {
		document.getElementById('InfoSound').innerHTML = "Available "+secLoad.toFixed(2)+"/"+secTotal.toFixed(2)+" seconds ("+this.getPerc(secLoad,secTotal)+"%)";
		this.SoundLen = secTotal;
	}
	this.InfoState = undefined;
	this.Inform = function() {
		if (this.Last != undefined) {
			var now = new Date();
			var interval = (now.getTime()-this.Last.getTime())/1000;
			this.SoundPos += interval;
			this.Last = now;
		}
		this.InfoState.innerHTML = this.State + "("+this.SoundPos.toFixed(2)+"/"+this.SoundLen.toFixed(2)+") sec ("+this.getPerc(this.SoundPos,this.SoundLen)+"%)";
	}
	this.SoundState = function(state, position) {
		if (position != undefined) this.SoundPos = position;
		if (this.State != "PLAYING" && state=="PLAYING") {
			this.Last = new Date();
			this.Timer = setInterval(Inform, 100);
			this.Inform();
		} else
		if (this.State == "PLAYING" && state!="PLAYING") {
			clearInterval(this.Timer);
			this.Timer = undefined;
			this.Inform();
		}
		this.State = state;
		this.Inform();
	}
	/**
	 * Initializes the WavPlayer, attaches it to the window, and sets up what needs to be set up.
	 * @method
	 */
	this.init = function() {
		var player = that.getPlayer();
		if (!player || !player.attachHandler) setTimeout(that.init, 100); // Wait for load
		else {
			player.attachHandler("progress", "FileLoad");
			player.attachHandler("PLAYER_LOAD", "SoundLoad");
			player.attachHandler("PLAYER_BUFFERING", "SoundState", "BUFFERING");
			player.attachHandler("PLAYER_PLAYING", "SoundState", "PLAYING");
			player.attachHandler("PLAYER_STOPPED", "SoundState", "STOPPED");
			player.attachHandler("PLAYER_PAUSED", "SoundState", "PAUSED");
			that.InfoState = document.getElementById('InfoState')
			that.Inform();
		}
	}
}


var wp = new WavPlayer("haxe","_lib/wavplayer/");
window.wp = wp;

wp.init();
