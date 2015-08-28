/**
 * @file A plugin which enables recording sounds from the subject's
 * microphone. The plugin is built around Claire Moore-Cantwell's
 * pre-plugin plugin, which used code by Chris Wilson and Matt
 * Diamond. For more info, see the scripts in recorder/
 *
 * There are still problems which have to be discussed when employed
 * in real life: cross-origin issues, server capability to hold
 * large amount of data.
*/

// TODO: require.jsify this whole mess
$.getScript("plugins/recorder/recorder.js", function () {
	$.getScript("plugins/recorder/main.js", function(){
		Experigen.registerPlugin({
			onload: function(callback){
				RecorderMain.initAudio();
				if(callback) callback();
			},
			stopload: true,
			extendtrial: function(that){
				that.makeRecorder = function (obj) {
					var loc=obj.location || 4;
					
					var filename=Experigen.userCode + obj.filename + '.wav' || Experigen.userCode + Experigen.screen()['item'] + '.wav';
					//alert(filename);
					
					var str="";
					str += '<style> ';
					str +='	canvas {  display: inline-block; background: #202020; width: 30%; height: 16%; box-shadow: 0px 0px 10px blue; }';
					str+='	</style>';

					str += '<p> <input type="button" ';
					str += ' id="recordButton"';
					str += ' value="Record"';
					str += ' onClick=RecorderMain.toggleButton('+loc+',"'+filename+'");'
					str += ' class="soundbutton"'
					str += '> </p>';
					

					
					return str;
				};
				that.soundCheck = function (obj) {
					var loc=obj.location || 3;
					
					var filename=Experigen.userCode + obj.filename + '.wav' || Experigen.userCode + Experigen.screen()['item'] + '.wav';
					//alert(filename);
					
					var str="";
					str += '<style> ';
					str +='	canvas {  display: inline-block; background: #202020; width: 30%; height: 16%; box-shadow: 0px 0px 10px blue; }';
					str+='	</style>';
					
					str += '<p> <input type="button" ';
					str += ' id="soundCheck"';
					str += ' value="Begin Sound Check"';
					str += ' onClick=RecorderMain.soundCheckButton('+loc+',"'+filename+'");'
					str += ' class="soundbutton"'
					str += '> </p>';
					

					
					return str;
				}
					

			}
		});
	});
});
