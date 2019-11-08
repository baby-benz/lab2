/*
* Copyright (C) 2005-2015 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/

/**
* @module bubbleMessage
* Encapsulates all the functionality for displaying bubble messages.
*/
tv.bubbleMessage = (function ($, ko, tv, PF) {

	var bubbleTypes = {
		Info: 0,
		Warning: 1,
		Error: 2,
		Success: 3
	};

	var bubbles = ko.observableArray([]);

	/*
	 * Creates or 'resets'(auto close timer for duplicate bubbles) a bubble VM
	 */
	var showBubble = function (type, msg, timeout) {

		var bubbleVm,
			bubbleVmSearch = tv.query.first(bubbles(), function (bubble) {
			return bubble.message === msg && bubble.type === type;
		});

		if (bubbleVmSearch) {
			bubbleVm = bubbleVmSearch.item;
			clearTimeout(bubbleVm.timeoutId);
		} else {
			bubbleVm = {
				type: type,
				message: msg,
				timeout: timeout || 20 * 1000,
				timeoutId: 0,
				panelType: getPanelType(type)
			};
			bubbles.push(bubbleVm);
		}

		bubbleVm.timeoutId = setTimeout(function () {
			bubbles.remove(bubbleVm);
		}, bubbleVm.timeout);
	};

	/*
	 * Removes the bubbles with the text = msg
	 */
	var removeBubble = function(msg) {
		bubbles.remove(function (bubble) {
			var toBeRemoved = bubble.message === msg;
			if (toBeRemoved) {
				clearTimeout(bubble.timeoutId);
			}
			return toBeRemoved;
		});
	};


	var getPanelType = function(type) {
		switch (type) {
		case bubbleTypes.Info:
			return "informationPane";

		case bubbleTypes.Warning:
			return "warningPane";

		case bubbleTypes.Error:
			return "errorPane";

		case bubbleTypes.Success:
			return "successPane";

		default:
			return "informationPane";
		}
	};

	/**
	*	Public interface
	*/
	return {
		BubbleTypes: bubbleTypes,
		show: showBubble,
		remove: removeBubble,
		bind: function (htmlElement) {
			ko.applyBindings({
				bubbles: bubbles,
				closeBubble: function (bubbleViewModel) {
					bubbles.remove(bubbleViewModel);
				}
			}, htmlElement);
		}
	};
})(jQuery, window.ko, window.tv, window.PF);