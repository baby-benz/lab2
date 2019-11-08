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
*	Encapsulates all the functionality in the "Screenshot" tab.
*/
tv.screenshot = (function ($, ko, tv) {
	var refreshCount = 0;
	
	var viewModel = {
		imageUrl: ko.observable(""),
		imageWidth: ko.observable(668),
		imageHeight: ko.observable(447),

		showInstructions: ko.observable(true),

		requestData: function () {
			$.ajax({
				url: 'module/screenshot/requestscreenshot.cmd',
				dataType: 'tvResult'
			});
		}
	};

	var refresh = function () {
		var newUrl = 'module/screenshot/screenshot.image?count=' + refreshCount++;
		var img = new Image();

		img.onload = function () {
			viewModel.imageWidth('auto');
			viewModel.imageHeight('auto');
			viewModel.imageUrl(newUrl);
			viewModel.showInstructions(false);
		};
		img.src = newUrl;
	};

	/**
	*	Public interface
	*/
	return {
		refresh: (!!PF.Screenshot) ? refresh : $.noop,
		bind: function(htmlElement) {
			ko.applyBindings(viewModel, htmlElement);
		}
	};
})(jQuery, window.ko, window.tv);