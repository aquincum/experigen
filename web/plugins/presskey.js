/** BUGGY YET 
 * update 11/1/15: not as buggy anymore
 */


Experigen.registerPlugin({
    extendtrial: function(trial) {
	trial.attachKey = function(keysbuttons){
	    $(document).on("keyup", function(event){
		if(keysbuttons[event.which] && $(keysbuttons[event.which]).is(":visible")){
		    $(keysbuttons[event.which]).click();
		}
		event.preventDefault();
		event.stopPropagation();
	    });
	};
    }
});
