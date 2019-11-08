/*
* Copyright (C) 2005-2013 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/

/* Main entry point of the application */
(function ($, ko, tv, TL, PF) {
	var tabsControl = null;
	var appMode = "full";

	/* Process the page and translates everything */
	var localizeTexts = function () {

		var translate = function (elem, attrName, setter) {

			var keyName = elem.attr(attrName);

			if (typeof keyName !== 'undefined') {
				var txt = TL[keyName];

				if (typeof txt === 'string') {
					setter.call(elem, txt);
					return true;
				}
			}
		};

		/* Find all that needs localization */
		$('.tl, script > .tl').each(function (index, item) {
			var elem = $(item);

			/* Translate the inner text */
			translate(elem, 'data-tl-html', elem.html);

			/* Translate the title */
			translate(elem, 'data-tl-title', function (txt) { elem.attr('title', txt); });
		});
	};

	/* Sets up the bindings for the controls */
	var setUpBindings = function () {

		tv.setTabsControl(tabsControl);

		// Bubble messages
		tv.bubbleMessage.bind($('.bubbleMessagesContainer')[0]);

		// Screenshot
		if (PF.Screenshot) {
			tv.screenshot.bind($('#tabScreenshot')[0]);
        }

		// Screensharing
		if (PF.ScreenSharing) {
			tv.screensharing.bind($('#tabScreenSharing')[0]);
		}

		/* Dashboard */
		
		// Device Information
		ko.applyBindings(tv.deviceInfo.getVM(), $('#DeviceInfoTable')[0]);

		// Monitoring
		if (PF.Monitoring) {
			tv.monitoring.bind($('#monitoring')[0]);
			tv.monitoring.bind($('#wlanMonitor')[0]);

			/* Pass the tabs api to the monitoring object. */
			tv.monitoring.setTabsApi(tabsControl);
		}

		// partial remote wnd
		ko.applyBindings({}, $('#partialRemoteWndMockup')[0]);

		/* Apps */
		if (PF.Apps) {
			tv.appList.bind($('#InstalledApplicationsList')[0]);
		}

		/* Processes */
		if (PF.Processes) {
			tv.processList.bind($('#RunningProcessesTable')[0]);
		}

		/* System Log  */
		if (PF.SystemLog) {

			// Log	
			ko.applyBindings(tv.log.getVM(), $('#Log')[0]);
		}

	};

	// Creates Tabs and sets up event handlers
	var setUpTabs = function () {

		/* Remove the tabs not listed in the PF object */
		$('#tabsWrapper > ul.tabs > li[data-pf-name]').each(function (index, elem) {

			var wrapper = $(elem);
			var targetPF = PF[wrapper.attr('data-pf-name')];
			var targetDIV = $(wrapper.find('a').attr('href'));

			/* Check if the PF has been passed by TeamViewer */
			if (targetPF === false || targetPF === null || typeof targetPF === 'undefined') {

				/* Remove both thing from the DOM */
				targetDIV.remove();
				wrapper.remove();
			}
		});

		/* Draw the tabs */
		$('#tabsWrapper > ul.tabs').tabs('.tab-content');

		tabsControl = $('#tabsWrapper > ul.tabs').data('tabs');

		/* Initialize the Bindings */
		setUpBindings();

		/* Initialize the Tabs */
		tv.settings.init();

		/* Populate the other tabs in a background "thread" */
		setTimeout(function () {
			if (PF.TeamViewerRunning) {
				tv.appList.requestData(true);
				tv.processList.requestData(true);
				tv.settings.requestWlanData();
				tv.log.requestData(true);
			} else {
				// This is for tests in a browser without TeamViewer
				tv.monitoring.getData();
				tv.deviceInfo.getData();
				tv.appList.getData(true);
				tv.processList.getData(true);
				tv.settings.getWlanData();
				tv.log.getData(true);
			}
		}, 50);

	};


	/**
	*	Initialize the client event-loop.
	*/
	$(function () {
		tv.logger(LOCALE, 'LOCALE');

		/* Apply the translations */
		localizeTexts();

		/*add rtl class to parent iff  rtlLanguage is true*/
		if (LOCALE.rtlLanguage) {
			$("html").addClass("rtl");
		}

		/* Apply a root class that helps CSS implement specific browser-hacks */
		$('html').addClass(window.isIE ? 'ie' : 'mac');

		var appModeParam = tv.getUrlParam("appMode");

		switch (appModeParam) {
			case 'chatOnly':
				appMode = appModeParam;
				// Chat	binding
				tv.chat.bind($('#chatWrapper')[0]);
				break;

			case 'tabsOnly':
				appMode = appModeParam;
				// Tabs initilization
				setUpTabs();
				break;

			default:
				appMode = 'full';
				// Chat	binding
				tv.chat.bind($('#chatWrapper')[0]);

				// Tabs initilization
				setUpTabs();
		}

		$('html').addClass(appMode);
		
		/* Bind the mouse visual effects to the buttons */
		if (window.isIE7) {
			$('.ui-button').not($('.ui-menu').find('.ui-button')).on('mousedown', tv.mousedown).on('mouseup', tv.mouseup).on('mouseleave', tv.mouseup);
			$('#InstalledApplicationsList, #RunningProcessesTable, #settingsTable, #Log').on('mousedown', '.ui-button', tv.mousedown).on('mouseup', '.ui-button', tv.mouseup).on('mouseleave', '.ui-button', tv.mouseup);
		}

		if (window.supportsVML) {
			/* 
				Try to fix the DPI issues in Sandboxed - IE 
				We should manually canculate the current zooming and apply the CSS rule to the VML elements
			*/
			if (PF.TeamViewerRunning) {
				var scaling = screen.deviceXDPI / 96;
				$('.meter-arc').css('zoom', scaling);
			}
		}

		/* Log the Provided Features */
		tv.logger(PF, 'Provided Features');

		if (PF.TeamViewerRunning) {
			/* Notify the host app that the DOM is available */
			$.getJSON('event/mainEvents/pageLoadComplete.cmd?appMode=' + appMode);
		}
		
		
	});
})(jQuery, window.ko, window.tv, window.TL, window.PF);