/*
* Copyright (C) 2005-2013 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/

/**
*	Defines the TV query namespace
*/
tv.query = (function () {

	/* Set the flag to true if localeCompare is supported by the String object */
	var localeCompareSupported = typeof String.prototype.localeCompare === 'function';

	/* Holds the basic sorting predicates */
	var compare = {
		string: function (left, right) {
			return left.toLowerCase().localeCompare(right.toLowerCase());
		},
		number: function (left, right) {
			return (left === right) ? 0 : (left < right) ? -1 : 1;
		},
		boolean: function (left, right) {
			return (left === right) ? 0 : left ? -1 : 1;
		}
	};
	/* Hack the date comparison. */
	compare.date = function (left, right) {
		return compare.number(left.getTime(), right.getTime());
	};
	/* Expose an inverted compare function for numbers */
	compare.numberInverted = function (left, right) {
		return compare.number(right, left);
	};


	/**
	*	Finds all the corresponding item ocurrences in an array that satisfy a predicate.
	*/
	var search = function (array, predicate, maxResults) {

		if (typeof array === 'undefined' || typeof predicate !== 'function') {
			return;
		}

		var results = [];

		if (typeof maxResults !== 'number') {
			maxResults = array.length;
		}

		for (var i = 0; i < array.length; i++) {

			var currentItem = array[i];

			if (predicate.apply(currentItem, [currentItem]) === true) {
				results.push({
					index: i,
					item: currentItem
				});

				if (results.length === maxResults) {
					break;
				}
			}
		}

		return results;
	};

	/**
	*	Finds the first item in an array that satisfies a predicate.
	*/
	var first = function (array, predicate) {

		var tempResults = search(array, predicate, 1);

		if (tempResults.length === 1) {

			/* Return the object unwrapped from the array */
			return tempResults[0];
		}

		/* No results, then return undefined */
		return;
	};

	/**
	*	Implements sorting for arrays.
	*/
	var sort = function (array, predicate) {

		/* Proof parameters */
		if (typeof array !== 'object' || typeof predicate !== 'function') {
			return;
		}

		/* Try to sort the array with the native implementation */
		if (typeof array.sort === 'function') {
			array.sort(predicate);
		}
	};

	/**
	*	Public interface
	*/
	return {
		search: search,
		first: first,
		sort: sort,
		compare: compare,
		localeCompareSupported: localeCompareSupported
	};
})();