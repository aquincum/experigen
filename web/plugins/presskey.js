/** BUGGY YET */

Experigen.registerPlugin({
	extendtrial: function(trial) {
		trial.attachKey = function(keysbuttons){
			$(document).on("keyup", function(event){
				if(keysbuttons[event.which]){
					$(keysbuttons[event.which]).click();
					$(document).off("keyup");
				}
			});
		};
	}
});
