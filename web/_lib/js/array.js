/**
 * @file This file expands the Array type of JavaScript. It adds some
 * functions which are especially useful for Experigen. Most of
 * these functions are used with a resource array: a list of items, which
 * are key-value pairs of field-value names.
 */


/**
 * Additional Array methods
 * @scope _global_
 * @name Array
 * @class
 */

/**
 * Returns the subset of the data, where the field matches the criterion.
 * @param field Name of the field
 * @param criterion The criterion the field has to match
 * @returns {Array} The filtered array
*/
Array.prototype.subset = function (field, criterion) {
	var arr = new Array();
	for (var i=0 ; i<this.length ; i++) {
		if(this[i][field] === criterion) {
			arr.push(this[i]);
		}
	}
	return arr;
}

/**
 * Returns the subset of the data, where the field does not match the criterion.
 * @param field Name of the field
 * @param criterion The criterion the field must not match
 * @returns {Array} The filtered array
*/
Array.prototype.exclude = function (field, criterion) {
	var arr = new Array();
	for (var i=0 ; i<this.length ; i++) {
		if(this[i][field] !== criterion) {
			arr.push(this[i]);
		}
	}
	return arr;
}

/**
 * Returns the subset of the data without a given block passed to the function. An
 * item will be excluded if all fields are completely matched OR if the key field of the
 * items resource is matched
 * @param excludeArray {Array} The block of items to be excluded
 * @returns {Array} The filtered array
*/
Array.prototype.excludeBlock = function (excludeArray) {
	var newArray = [];
	for (var i=0; i<this.length; i++) {
		var found = false;
		for (var j=0; j<excludeArray.length; j++) {
			if (this[i]===excludeArray[j]) {
				found = true;
			} else {
				if(Experigen && Experigen.resources && Experigen.resources.items && this[i][Experigen.resources.items.key]===excludeArray[j][Experigen.resources.items.key]) {
					found = true;
				}
			}
		}
		if (!found) {
			newArray.push(this[i]);
		}
	}
	return newArray;
}

/**
 * Merge field-value arrays.
 * @param arrays {...Array} Any number of arrays to be merged
 * @returns {Array} The merged array
*/
Array.prototype.interleave = function () {
	var newArray = [];
	var args = Array.prototype.slice.call(arguments, 0); // turn "arguments" into a real array (of arrays)
	args.unshift(this); // add the current array as the first member in the array of arrays
	var maxLen = $.map( args , function(val, i) { return val.length; } ).sort().reverse()[0]; // find the length of the longest array

	for (var i=0; i<maxLen; i++) {
		for (var j=0; j<args.length; j++) {
			if (args[j][i]) {
				newArray.push(args[j][i]);
			}
		} 
	}
	return newArray;
}

/**
 * Returns the first i members of the array
 * @param [i=1] {Number} Default=1
 * @returns {Array} The first i members
*/
Array.prototype.chooseFirst = function (i) {
		if (!i) {
			return this.slice(0,1);
		} else {
			return this.slice(0,i);
		}
}

/**
 * Returns the members but the first i members of the array
 * @param [i=1] {Number} Default=1
 * @returns {Array} The remaining members
*/
Array.prototype.excludeFirst = function (i) {
		if (!i) {
			return this.slice(1,this.length);
		} else {
			return this.slice(i,this.length);
		}
}

/**
 * Randomly samples the array
 * @param i {Number} How many members from the array to sample
 * @returns {Array} The resulting array
*/
Array.prototype.chooseRandom = function (i) {
	var arr = this;
	return arr.shuffle().chooseFirst(i);
}


/**
 * Pairs up an array of items with a plain array or variable by adding its values
 * to a new field. If the argument is an array, it will be cycled through the items.
 * @param field {String} The name of the new field
 * @param arr {Array|*} The array or object to put in the new field
 * @returns {Array} The paired array.
 * @example 
 * // typical use to pair up views with items
 * var experimentBlock = items.pairWith("view", "stimulus.ejs");
 * @example
 * var arr = [];
 * for(var i = 0; i < 10; i++) 
 *   arr[i] = {"number": i};
 * arr.pairWith("parity", ["odd","even"]);
 * // result: [{number: 1, parity: "odd"}, {number: 2, parity: "even"}, 
 * // {number: 3, parity: "odd"}, {number: 4, parity: "even"}, 
 * // ... {number: 10, parity: "even"}]
*/
Array.prototype.pairWith = function (field, arr) {

	if (arr===undefined || arr===null) { console.error("Can't pair with empty list!"); return false; }
	if (Object.prototype.toString.apply(arr)!=='[object Array]') { arr = [arr];}

	/// clone this
	var newArray = [];
	for (var i=0; i<this.length; i+=1) {
		newArray.push(jQuery.extend(true, {}, this[i]));
	}

	var arrPosition = 0;
	for (var i=0 ; i<newArray.length ; i++) {
		newArray[i][field] = arr[arrPosition];
		arrPosition++;
		if(arrPosition>=arr.length) arrPosition=0;
	}
	if (Experigen) { 
		Experigen.fieldsToSave[field] = true; 
	}
	return newArray;
}


/**
 * Randomize the order of items in the array.
 * @returns {Array} The resulting array.
*/
Array.prototype.shuffle = function () {
	var arr  = new Array();
	for (var i=0 ; i<this.length ; i++) {
		arr.push(this[i]);
	}
	for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
	return arr;
}


/**
 * Tests whether the array is unique and doesn't have empty elements
 * @returns {boolean}
*/
Array.prototype.uniqueNonEmpty = function () {
	
	var noempties = true;
	var hash = {};
	for (var i=0 ; i<this.length ; i++) {
		if (!this[i] || this[i]=="") {
			noempties = false;
		} else {
			hash[this[i]] = "1";
		}
	}
	var hashlength=0;
	for (i in hash) {hashlength++};
	return (this.length===hashlength && noempties);
}

/**
 * Repeats the array.
 * @param num {Number} The array is repeated num times.
 * @returns {Array} The resulting array.
*/
Array.prototype.repeat = function (num) {

	var newArray = [];
	for (var i=0; i<num; i++) {
		newArray = newArray.concat(this);
	}
	return newArray;
}


String.prototype.repeat = function (num) {

	var newArray = [];
	for (var i=0; i<num; i++) {
		newArray.push(this.toString());
	}
	return newArray;
}

Boolean.prototype.repeat = function (num) {

	var newArray = [];
	for (var i=0; i<num; i++) {
		newArray.push(this==true);
	}
	return newArray;
}


Number.prototype.repeat = function (num) {

	var newArray = [];
	for (var i=0; i<num; i++) {
		newArray.push(parseFloat(this));
	}
	return newArray;
}



