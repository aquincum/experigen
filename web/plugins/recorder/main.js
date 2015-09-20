/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/* Daniel Szeredi 2015
   
   Minor changes, not polluting the global space.
   Brought drawBuffer() over from audiodisplay.js
*/


window.AudioContext = window.AudioContext || window.webkitAudioContext;

var RecorderMain = (function (window){

	var audioContext = new AudioContext();
	var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null,
	analyserNode = null;
	var rafID = null;
	var analyserContext = null;
	var canvasWidth, canvasHeight;
	var recIndex = 0;
	var soundURL;
	var soundFileName;

	function drawBuffer( width, height, context, data ) {
		var step = Math.ceil( data.length / width );
		var amp = height / 2;
		context.fillStyle = "silver";
		context.clearRect(0,0,width,height);
		for(var i=0; i < width; i++){
			var min = 1.0;
			var max = -1.0;
			for (j=0; j<step; j++) {
				var datum = data[(i*step)+j]; 
				if (datum < min)
					min = datum;
				if (datum > max)
					max = datum;
			}
			context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
		}
	}

	/* TODO:

	   - offer mono option
	   - "Monitor input" switch
	*/
	function saveAudio() {
		audioRecorder.exportWAV( doneEncoding );
		// could get mono instead by saying
		// audioRecorder.exportMonoWAV( doneEncoding );
	}

	function gotBuffers( buffers) {
		var canvas = document.getElementById( "wavedisplay" );

		drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

		// the ONLY time gotBuffers is called is right after a new recording is completed - 
		// so here's where we should set up the download.
		audioRecorder.exportMonoWAV( doneEncoding, "audio/wav" );
	}

	//original download script
	//function doneEncoding( blob ) {
	//    Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
	//    recIndex++;
	//}


	function doneEncoding(blob) {
		
		soundURL = (window.URL || window.webkitURL).createObjectURL(blob);
		//alert(soundURL);
		var fileType = 'audio'; // or "audio"
		var fileName = soundFileName || Experigen.userCode + Experigen.screen()['item'] + '.wav';  // or "wav"  Experigen.screen()[i]

		var formData = new FormData();
		formData.append(fileType + '-filename', fileName);
		formData.append(fileType + '-blob', blob);
		formData.append('experimentName',Experigen.settings.experimentName);
		formData.append('userFileName',Experigen.userFileName);
		formData.append('userCode',Experigen.userCode);
		formData.append('sourceurl',encodeURIComponent(window.location)); //Experigen.settings.databaseServer);

		xhr(Experigen.settings.databaseServer + 'whatsinmyhash.cgi', formData)
		xhr(Experigen.settings.databaseServer + 'soundwrite.cgi', formData)//, function (fName) {
		//	    window.open(location.href); //+ fName
		//	    alert(location.href);
		//	});

		function xhr(url, data, callback) {
			var request = new XMLHttpRequest();
			//	    request.onreadystatechange = function () {
			//	        if (request.readyState == 4 && request.status == 200) {
			//	            callback(location.href + request.responseText);
	        
			//	        }
			//	    };
			request.open('POST', url);
			request.send(data);
		}
	}

	function toggleRecording( e ) {
		if (e.classList.contains("recording")) {
			// stop recording
			audioRecorder.stop();
			e.classList.remove("recording");
			audioRecorder.getBuffers( gotBuffers );
		} else {
			// start recording
			if (!audioRecorder)
				return;
			e.classList.add("recording");
			audioRecorder.clear();
			audioRecorder.record();
		}
	}

	function toggleButton(location) // no ';' here
	{
		var elem = document.getElementById("recordButton");
		//alert(filename);
		if (elem.value=="Stop Recording"){ 
    		elem.value = "Done!";
    		cancelAnalyserUpdates();
    		analyserContext = null;
    		$("#recordButton").hide()
    		$("#analyser").hide()
    		createCanvas("wavedisplay",location);
    		toggleRecording(elem);
    		//alert("I am an alert box!" + $("#analyser").id)

    		Experigen.screen().continueButtonClick(elem);
    	}
		else {elem.value = "Stop Recording";
    		  createCanvas("analyser",location);
    		  updateAnalysers();
    		  toggleRecording(elem);
    		 }
	}

	function soundCheckButton(location,filename) 
	{
		var elem = document.getElementById("soundCheck");
		//alert(filename);
		if (elem.value=="Stop Recording"){ 
    		
    		cancelAnalyserUpdates();
			analyserContext = null; //I guess this is what resets the analyser???
			$("#recordButton").hide() // Does this do anything??
			var analyser = document.getElementById("analyser");
    		analyser.parentNode.removeChild(analyser);
			
			
			
    		if (i==2){
	    		elem.value = "Continue";
	    		createCanvas("wavedisplay",location);
	    		
	    	}
			else{
	    		elem.value = "Record"
	    		
	    		ID=i.toString();
	    		//alert(ID);
	    		$("#"+ID).hide(); //Hide the old text 
	    		
	    		i++;
	    		
	    		text=document.createElement("div");
    			
	    		var trialpartWrappers = document.getElementsByClassName("trialpartWrapper");
	    		recordWrapper = trialpartWrappers[trialpartWrappers.length -location];
	    		recordWrapper.appendChild(text);
	    		
	    		text.id=i.toString();
	    		//alert(text.id);
	    		//alert(wordPlayList[2]);
	    		text.innerHTML=wordPlayList[i];
	    		
	    		recordWrapper.appendChild(document.createElement("p"));
    			
 		   		elem.value = "Record";
    			
   		 		createCanvas("wavedisplay",location);

	    	}
			
	    	toggleRecording(elem);

	    }
		else if (elem.value=="Continue"){
			elem.value="Play";
			
			ID=i.toString();
			$("#"+ID).hide(); //Hide the last word
			
    		var wavedisplay = document.getElementById("wavedisplay");
    		wavedisplay.parentNode.removeChild(wavedisplay);
    		
    		Experigen.screen().continueButtonClick(elem);
			
		}
		else if (elem.value=="Play") {
    		soundURL=Experigen.settings.databaseServer + "storage/" + Experigen.settings.experimentName + "/" + Experigen.userCode + "soundCheck.wav";
			if(soundManager){
				var mysound=soundManager.createSound({
					id: "test",
					url: soundURL,
					autoPlay: false, 
					autoLoad: true,
					onfinish:function() {
						Experigen.screen().advance();
					}
				});
			//alert(mysound.url);
			//alert(soundManager.canPlayURL(soundURL));
				mysound.play();
			}
			else {
				var aud = $('<audio id="schkAudio">').append('<source src=' + soundURL + '>');
				$("body").append(aud);
				aud.play();
				aud.oncanplay = aud.play;
			}
			soundURL=null;
			soundFileName=null;
			Experigen.screen().advance();
    		
    	}
		else if (elem.value=="Record") {
    		elem.value = "Stop Recording";


    		var wavedisplay = document.getElementById("wavedisplay");
    		wavedisplay.parentNode.removeChild(wavedisplay);
    		
    		
    		createCanvas("analyser",location);
    		updateAnalysers();
    		if (i==whichWordToRecord[1]){
    			//alert(whichWordToRecord[1]);
    			
    			
    			rightanswer=document.createElement("input");
    			rightanswer.type="hidden";
    			rightanswer.id="rightanswer";
    			rightanswer.value=wordPlayList[whichWordToRecord[1]];
    			
    			var trialpartWrappers = document.getElementsByClassName("trialpartWrapper");
    			recordWrapper = trialpartWrappers[trialpartWrappers.length -location];
    			recordWrapper.appendChild(rightanswer);
    			
    			//alert(rightanswer.value)
    			
    			soundFileName=Experigen.userCode + "soundCheck.wav";
	    		toggleRecording(elem);
	    	}
			else {
	    		soundFileName=Experigen.userCode + "unusedsoundcheck" + i.toString() +".wav";
	    		toggleRecording(elem);
	    	}
    	}
		
		else { // If the button is new: show the first word, and change the button to say "Record"
    		i=0; // initialize the i for iteration (gets incremented in the "Stop Recording" case)
    		wordPlayList=["cannery", "canary", "canopy"].sort(function(){
				return .5 - Math.random();
			}); // randomize array of test words
			//alert(wordPlayList);
			
			whichWordToRecord=[0,1,2].sort(function(){
				return .5 - Math.random();
			}); //randomly select a word to actually record and playback
			
    		text=document.createElement("div")
    		
    		var trialpartWrappers = document.getElementsByClassName("trialpartWrapper");
    		recordWrapper = trialpartWrappers[trialpartWrappers.length -location];
    		recordWrapper.appendChild(text);
    		
    		text.id=i.toString();
    		text.innerHTML=wordPlayList[i];
    		//alert(text.id);
    		recordWrapper.appendChild(document.createElement("p"));
    		
    		elem.value = "Record";
    		
    		createCanvas("wavedisplay",location);
    		
			//   	for (var i = 0; i = wordPlayList.length; ++i) {		}
    	}
	}


	function convertToMono( input ) {
		var splitter = audioContext.createChannelSplitter(2);
		var merger = audioContext.createChannelMerger(2);

		input.connect( splitter );
		splitter.connect( merger, 0, 0 );
		splitter.connect( merger, 0, 1 );
		return merger;
	}

	function cancelAnalyserUpdates() {
		window.cancelAnimationFrame( rafID );
		//alert(rafID)
		rafID = null;
	}

	function createCanvas(ID,location) {
		var canvas = document.createElement("canvas");
		var trialpartWrappers = document.getElementsByClassName("trialpartWrapper");
		// this part is a kludge.  have to change the constant in this if the recorder div is somewhere other than next-to-last
		recordWrapper = trialpartWrappers[trialpartWrappers.length -location];
		//alert(recordWrapper.id)
		recordWrapper.appendChild(canvas);
		canvas.id=ID;
		canvas.width="1024";
		canvas.height="500";
	}

	function updateAnalysers(time) {
		if (!analyserContext) {
			var canvas = document.getElementById("analyser");
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
			analyserContext = canvas.getContext('2d');
		}

		// analyzer draw code here
		{
			var SPACING = 3;
			var BAR_WIDTH = 1;
			var numBars = Math.round(canvasWidth / SPACING);
			var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

			analyserNode.getByteFrequencyData(freqByteData); 

			analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
			analyserContext.fillStyle = '#F6D565';
			analyserContext.lineCap = 'round';
			var multiplier = analyserNode.frequencyBinCount / numBars;

			// Draw rectangle for each frequency bin.
			for (var i = 0; i < numBars; ++i) {
				var magnitude = 0;
				var offset = Math.floor( i * multiplier );
				// gotta sum/average the block, or we miss narrow-bandwidth spikes
				for (var j = 0; j< multiplier; j++)
					magnitude += freqByteData[offset + j];
				magnitude = magnitude / multiplier;
				var magnitude2 = freqByteData[i * multiplier];
				analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
				analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
			}
		}
		
		rafID = window.requestAnimationFrame( updateAnalysers );
	}

	function toggleMono() {
		if (audioInput != realAudioInput) {
			audioInput.disconnect();
			realAudioInput.disconnect();
			audioInput = realAudioInput;
		} else {
			realAudioInput.disconnect();
			audioInput = convertToMono( realAudioInput );
		}

		audioInput.connect(inputPoint);
	}

	function gotStream(stream) {
		inputPoint = audioContext.createGain();

		// Create an AudioNode from the stream.
		realAudioInput = audioContext.createMediaStreamSource(stream);
		audioInput = realAudioInput;
		audioInput.connect(inputPoint);

		//    audioInput = convertToMono( input );

		analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		inputPoint.connect( analyserNode );

		audioRecorder = new Recorder( inputPoint );

		zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect( zeroGain );
		zeroGain.connect( audioContext.destination );
		updateAnalysers();
	}

	function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

		navigator.getUserMedia(
			{
				"audio": {
					"mandatory": {
						"googEchoCancellation": "false",
						"googAutoGainControl": "false",
						"googNoiseSuppression": "false",
						"googHighpassFilter": "false"
					},
					"optional": []
				},
			}, gotStream, function(e) {
				alert('Error getting audio');
				console.log(e);
			});
	}

	return {
		soundCheckButton: soundCheckButton,
		toggleButton: toggleButton,
		toggleRecording: toggleRecording,
		initAudio: initAudio
	};
	
})(window);
