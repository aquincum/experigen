/**
 * @file Creating buttons that don't advance, but reflect selection
 */


/**
 * And now we just register ourselves as a plugin to be loaded with every screen
 * The plugin function, which is inserted by {@link Experigen.make_into_trial} into the
 * methods of each {@link Experigen.trial}. It just adds the {@link makeVAS} function as
 * a member method of each screen.
 */
Experigen.registerPlugin({
	extendtrial: function (trial) {

        /**
		 * This function will actually be a member of an {@link Experigen.trial}.
		 * @param [obj] A collection of options
         * @param [obj.activecolor="#0000ee"] The color of the active button
		 * @param [obj.inactivecolor="#ffffff"] The color of the inactive button(s)
		 * @param [obj.buttons=["1",...,"7"]] {String[]} The labels of the buttons
         * @param [obj.edgelabels=none] {String[]} A 2-element array of labels of the edges on the side of the scale. By default, there is no label.
         * @param [obj.linebreaks=0] {Number} Number of line breaks (br's) placed after the scale
         * @param [obj.disable=false] {boolean} If true, the scale will be disabled after used. -- Do I need this?
         * @param [obj.hide=false] {boolean} If true, the scale will be hidden after used.
         * @param [obj.runextra=""] {String} A string of JS code to be run after the scale is used, after calling {@link Experigen.trial.continueButtonClick}()
		 * @returns The html for the scale to be included
		 */
        var makeSelectorScale = function(obj) {
            Experigen.screen().responses++;
            var newScale = new SelectorScale(Experigen.screen().responses, this.scales.length, obj);
			this.scales.push(newScale);
            return newScale.html();
        }

        /**
		 * A selector scale.
		 * @class
		 * @param response_no The rank of the Selector Scale within responses in the screen
		 * @param scale_no The rank of the Selector Scale within all Selector Scales in the screen
		 * @param [obj] A collection of options
		 * @param [obj.activecolor="#0000ee"] The color of the active button
		 * @param [obj.inactivecolor="#ffffff"] The color of the inactive button(s)
		 * @param [obj.buttons=["1",...,"7"]] {String[]} The labels of the buttons
         * @param [obj.edgelabels=none] {String[]} A 2-element array of labels of the edges on the side of the scale. By default, there is no label.
         * @param [obj.linebreaks=0] {Number} Number of line breaks (br's) placed after the scale
         * @param [obj.disable=false] {boolean} If true, the scale will be disabled after used. -- Do I need this?
         * @param [obj.hide=false] {boolean} If true, the scale will be hidden after used.
         * @param [obj.runextra=""] {String} A string of JS code to be run after the scale is used, after calling {@link Experigen.trial.continueButtonClick}()
         */
        var SelectorScale = function(response_no, scale_no, obj) {
            var that = this;
            this.n = response_no;
            this.scaleN = scale_no;
            var paramsobj = obj || {};
            this.activecolor = paramsobj.activecolor || "#0000ee";
            this.inactivecolor = paramsobj.inactivecolor || "#ffffff";
            this.buttons = paramsobj.buttons || ["1","2","3","4","5","6","7"];
            this.edgelabels = paramsobj.edgelabels || [''];
		    this.linebreaks = paramsobj.linebreaks || 0;
		    this.buttontype = "button";
		    this.disable = (paramsobj.disable) ? true  : false;
		    this.hide = (paramsobj.hide) ? true  : false;
            this.runextra = (paramsobj.runextra) ? obj.runextra : "";
            this.serverValues = paramsobj.serverValues || this.buttons;            


            /** Produces the HTML for the VAS
			 * @returns the HTML
			 */
			this.html = function() {
                var str = "<div class='scaleWrapper'>";
                str += "<div class='scaleEdgeLabel'>"+this.edgelabels[0]+"</div>";
                str += "<div class='sscale' id='sscale" + this.scaleN + "'";
                str += "name='response" + this.n + "'>";

                for (var i=0; i<this.buttons.length; i+=1) {
                    buttonID = this.scaleN + 'button' + i;
                    str += '<div class="scalebuttonWrapper">';
                    str += '<input type="' + this.buttontype + '" value="' + this.buttons[i] + '" ';
                    str += 'id="' + buttonID + '" ';
                    //str += 'name="sscale'+ Experigen.screen().responses + this.scaleN + '" ';
                    str += 'class="scaleButton"';
                    str += 'style="color:black; background-color:#FFFFFF;" ';
                    str += 'onclick="window.event;Experigen.screen().scales[' + that.scaleN + '].buttonClicked(\'' + buttonID + '\');"';

                    //continueButtonClick(this,{hide:' +  hide + ',disable:' + disable + '});' + runextra;

                    //if (obj.rightAnswer) {
                    //    str += 'Experigen.screen().feedbackOnText(this,\'' + obj.feedbackID + '\',\'' + obj.matchRegExpression + '\',\'' + obj.rightAnswer + '\',\'' + obj.feedbackWrong + '\',\'' + obj.feedbackMatch + '\',\'' + obj.feedbackRight + '\')';
                    //}
        
                    str += '></div>';
                    if (this.linebreaks>0 && (i+1)%this.linebreaks==0 && (i+1)!=this.buttons.length) { str += '<br>'}
                }

				str += "</div><div class='scaleEdgeLabel'>" + that.edgelabels[that.edgelabels.length-1] + "</div></div><p></p>";
				str += "<input type='hidden' name='response" +that.n+ "' value=0>";
                return str;
            };

            /** Event handler for clicks 
            * @param event {Event} The click event from the browser.
            */
            this.buttonClicked = function (btnToChange) {
                that.clicked = true;
                var changingButton = document.getElementById(btnToChange);
                var label = changingButton.value;
                // Setting the hidden response variable to the value. This will be sent to the server.
                document.forms["currentform"]["response"+that.n].value = label;
                //console.log(btnToChange);
                this.changeColor(btnToChange);
            };

            this.changeColor = function (btnToChange) {
                var changingButton = document.getElementById(btnToChange);
                changingButton.style.backgroundColor = "#0000ee"; // have to set a default?
                for (var i = 0; i < this.buttons.length; i++) {
                    otherBtnID = this.scaleN + 'button' + i
                    if (otherBtnID != btnToChange) {
                        var btn = document.getElementById(otherBtnID);
                        btn.style.backgroundColor = "#FFFFFF";
                    };
                };
            };


        };

        trial.makeSelectorScale = makeSelectorScale;
        trial.scales = [];

    },

    onadvance: function (lastScreen){
		//		if(!lastScreen) return true;
		var part = "#" + "part" + Experigen.screen().currentPart;
		var proceed = true;
		console.log(part);
		// each SelectorScale in our part
		$(part).find(".sscale").each(function(index){
			// get the index in SelectorScales
            var n = $(this).attr("id").match(/[0-9]+$/);
			if(!Experigen.screen().scales[n].clicked){
                proceed = false;
                alert("You have not selected any of the buttons.");
			}
		});
        return proceed;
    }
});