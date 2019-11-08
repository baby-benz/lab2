/*
* Copyright (C) 2005-2017 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/

/**
*	Encapsulates all the functionality in the "Screenshot" tab.
*/
tv.screensharing = (function ($, ko, tv) {
	var showInstructionStep1 = true;
	var showInstructionStep2 = false;
	var swapInstructionTimeout = 0;
	var deviceInfoVM = tv.deviceInfo.getVM();

	var currentInstructionText = ko.observable(TL['JS_RS_screenSharingInstructionsStep1']);
	var iOS12orHigher = ko.computed(function () {

		/* If we know the iOS version */
		if (deviceInfoVM.PF.osversion()) {

			var majorOSVersion = Number(deviceInfoVM.osversion().split('.')[0]);
			if (majorOSVersion >= 12) {
				return true;
			}
		}
		return false;
	});

	var viewModel = {
		showRequestButton: ko.observable(true),
		showInstructions: ko.observable(false),
		instructionsFileName: ko.computed(function () {

			/* New animation */
			if (iOS12orHigher()) {
				return 'images/startBroadcasting12.gif';
			}

			return 'images/startBroadcasting.gif';
		}),
		showOSUpgradeInstructions: ko.observable(false),
		instructionHtmlText: ko.computed(function () {

			/* No instructions for iOS12 */
			if (iOS12orHigher()) {
				showInstructionStep1 = false;
				showInstructionStep2 = false;
				return '';
			}
			return currentInstructionText();
		})
	};

	var updateInstructions = function (dataAsJsonString) {
		var data = JSON.parse(dataAsJsonString);
		viewModel.showInstructions(data.showInstructions);
		viewModel.showOSUpgradeInstructions(data.showOSUpgradeInstructions);
		viewModel.showRequestButton(data.showRequestButton);

		clearTimeout(swapInstructionTimeout);
		if (data.showInstructions) {
			swapSteps();
		}
	};

	var swapSteps = function () {
		if (showInstructionStep1) {

			swapInstructionTimeout = setTimeout(function () {
				showInstructionStep1 = false;
				showInstructionStep2 = true;
				currentInstructionText(TL['JS_RS_screenSharingInstructionsStep2']);
				swapSteps();
			}, 4470);
		}

		if (showInstructionStep2) {

			swapInstructionTimeout = setTimeout(function () {
				showInstructionStep1 = true;
				showInstructionStep2 = false;
				currentInstructionText(TL['JS_RS_screenSharingInstructionsStep1']);
				swapSteps();
			}, 3400);
		}
	};

	/**
	*	Public interface
	*/
	return {
		updateInstructions: (!!PF.ScreenSharing) ? updateInstructions : $.noop,
		bind: function (htmlElement) {
			ko.applyBindings(viewModel, htmlElement);
		}
	};
})(jQuery, window.ko, window.tv);
