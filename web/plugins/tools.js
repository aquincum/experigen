Experigen.tools = {}

Experigen.tools.checkItems = function(fnfield){
	var items = Experigen.resources["items"].table;
	var l = items.length, i;
	fnfield = fnfield || "Filename";
	for(i = 0; i < l; i++){
		$.ajax(Experigen.settings.folders.sounds + items[i][fnfield], {type: "HEAD"})
			.success( function(){
				console.log("CHECK");
			})
			.error( function(){
				console.log("Could not load " + items[i][fnfield]);
			})
	}
}
