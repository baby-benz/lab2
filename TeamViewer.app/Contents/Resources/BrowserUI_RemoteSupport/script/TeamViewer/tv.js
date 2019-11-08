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
*	Holds all the utilitary functions used in the html5 client.
*/
var tv = (function ($, moment, locale, TL) {

	var maxStackSize = 15;
	var tabsControl = null;

	/* Repair JSON.stringify() if necesaary */
	if (typeof JSON === 'undefined') {
		window.JSON = {
			stringify: function (data) {
				return $.toJSON(data);
			}
		};
	}

	/**
	*	Right-alings a string to a certain number of characters.
	*	
	*	@param {string, Object}	text	String or object to be padded.
	*	@param {number} length			Length that the final string should have.
	*	@param {string}	filler			Character that will be used to fill the necessary spaces.
	*/
	var padLeft = function (text, length, filler) {
		return stringPadding(text, length, filler, true);
	};

	/**
	*	HTML Encodes the input string, preventing any possible XSS attack.
	*/
	var htmlEncode = function (text) {

		/* Simple agorith, push the text as text, extract the text as html */
		return $('<div/>').text(text).html();
	};

	var htmlDecode = function (text) {

		/* Simple agorith, push the text as html, extract the html as text */
		return $('<div/>').html(text).text();
	};

	/**
	*	Right-alings a string to a certain number of characters.
	*	
	*	@param {string, Object}	text	String or object to be padded.
	*	@param {number} length			Length that the final string should have.
	*	@param {string}	filler			Character that will be used to fill the necessary spaces. Optional. Default value is a white ' ' space.
	*/
	var padRight = function (text, length, filler) {
		return stringPadding(text, length, filler, false);
	};

	var stringPadding = function (text, length, filler, left) {

		length = Number(length);

		if (typeof text === 'undefined' || isNaN(length)) {
			return text;
		}

		if (typeof text !== 'string') {
			text = String(text);
		}

		if (text.length >= length) {
			return text;
		}

		if (typeof filler !== 'string') {
			filler = ' ';
		}
		else {
			filler = filler.charAt(0);
		}

		var finalLength = length - text.length;
		var tmpArray = [];

		for (var i = 0; i < finalLength; i++) {
			tmpArray[i] = filler;
		}

		if (left) {
			tmpArray.push(text);
		}
		else {
			tmpArray.unshift(text);
		}

		return tmpArray.join('');
	};

	var createDateString = function (milliSecondsString) {
		var timeString = '';
		var parsedMilliseconds = parseInt(milliSecondsString, 10);
		if (!isNaN(parsedMilliseconds)) {
			var date = new Date(parsedMilliseconds);
			timeString = moment(date).format(locale.shortDateFormat);
		}
		return timeString;
	};

	var parseTimeFromUTC = function (milliSecondsString, includeSeconds) {
		var timeString = '';
		var parsedMilliseconds = parseInt(milliSecondsString, 10);
		if (!isNaN(parsedMilliseconds)) {
			var date = new Date(parsedMilliseconds);
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();
			timeString = padLeft(hours, 2, '0') + ':' + padLeft(minutes, 2, '0') + (includeSeconds ? ':' + padLeft(seconds, 2, '0') : '');
		}

		return timeString;
	};

	var createTimeString = function (milliSecondsString, includeSeconds) {
		var timeString = '';
		var parsedMilliseconds = parseInt(milliSecondsString, 10);

		if (!isNaN(parsedMilliseconds)) {

			var seconds = Math.floor(parsedMilliseconds / 1000);

			var days = Math.floor(seconds / 86400);
			seconds = seconds - days * 86400;

			var hours = Math.floor(seconds / 3600);
			seconds = seconds - hours * 3600;

			var minutes = Math.floor(seconds / 60);
			seconds = seconds - minutes * 60;

			var result = [minutes + TL.JS_RS_minute_abbreviation];
			
			if (hours) {
				result.unshift(hours + TL.JS_RS_hour_abbreviation);
			}

			if (days) {
				result.unshift(days + TL.JS_RS_day_abbreviation);
			}

			return result.join(' ');
		}

		return timeString;
	};

	var createNowString = function () {
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();

		return padLeft(hours, 2, '0') + ':' + padLeft(minutes, 2, '0');
	};

	var createSizeString = function (bytes) {
		var sizeString = '';
		var parsedBytes = parseInt(bytes, 10);
		if (!isNaN(bytes)) {
			var kilobytes = bytes / 1024;
			var megabytes = kilobytes / 1024;
			var gigabytes = megabytes / 1024;

			if (gigabytes > 1) {
				sizeString = gigabytes.toFixed(2) + ' GB';
			}
			else if (megabytes > 1) {
				sizeString = megabytes.toFixed(2) + ' MB';
			}
			else if (kilobytes > 1) {
				sizeString = kilobytes.toFixed(2) + ' KB';
			}
			else {
				sizeString = bytes.toFixed(2) + ' B';
			}
		}
		return sizeString;
	};

	/**
	*	Limits the size of a string to a maximum length. It wil cut the string only if its length exceeds the maximum allowed.
	*/
	var cutString = function (text, maxLength) {

		if (typeof text === 'string' && typeof maxLength === 'number') {

			if (text.length > maxLength) {

				return text.substr(0, maxLength);
			}
		}

		return text;
	};

	/**
	*	Creates the stack trace from an arguments array-like object.
	*	
	*	@param originalArgs {arguments} This needs to be the unmutated arguments passed to the functions whose stack trace is needed.
	*	@returns an array with the stack trace, 0 is the closest caller.
	*/
	var getStackTrace = function (originalArgs) {

		var stack = [];
		var size = 0;

		if (typeof originalArgs !== 'undefined') {

			while (originalArgs.caller && size++ < maxStackSize) {
				stack.push({ name: originalArgs.caller.name, trace: originalArgs.caller.toString() });
				originalArgs = originalArgs.caller;
			}
		}

		return stack;
	};

	/**
	*	Writes to the TeamViewer log file.
	*
	*	@param {string} message		Message to be written to the log.
	*	@param {string} level		Log level. The level can be any of this values: 'Info', 'Debug', Verbose', 'Error', 'Warning'. The default value is 'Info' if no value is supplied.
	*/
	var writeLog = function (message, level) {

		/* Make sure we always have a level */
		if (typeof level !== 'string') {
			level = 'info';
		}

		/* Call TeamViewer to save the log. */
		$.ajax({
			url: 'logging/writePostedString.cmd?level=' + level,
			type: 'POST',
			data: message,
			ignoreErrors: true
		});
	};

	/**
	*	Catches errors produced by the onError event.
	*/
	var errorTrap = function (sMsg, sUrl, sLine) {

		tv.writeLog(sMsg + ', url: ' + sUrl + ', line: ' + sLine, 'Error');
		return false;
	};

	/**
	*	Shows a notification using the console.
	*/
	var notify = function (message, type) {

		/* Show the console debug information */
		if (window.console && typeof console.log === 'function') {

			if (type === 'error') {
				console.error(message);
			}
			else if (type === 'warning') {
				console.warn(message);
			}
			else {
				console.log(message);
			}
		}
		else {
			logger(message, type);
		}
	};

	/* Generic ajax error handler. */
	var handleAjaxError = function (jqXHR, textStatus, errorThrown) {

		if (jqXHR.ignoreErrors) {
			return;
		}

		var stackTrace = jqXHR.stackTrace;
		var caller = stackTrace.pop();
		var message = (errorThrown && errorThrown.message) ? errorThrown.message : errorThrown;

		notify(jqXHR.status + '(' + jqXHR.statusText + '): ' + message + '<br/><br/><b>url:</b> ' + jqXHR.url + '<br/><br/><b>stackTrace: </b>' + caller.trace, 'error');
	};

	/* Helper function that returs a GET param value or null if not found */
	var getUrlParam = function(paramName) {
		var results = new RegExp('[\\?&]' + paramName + '=([^&#]*)').exec(window.location.href);
		if (results && results.length > 1) {
			return results[1];
		} else {
			return null;
		}
	};

	/**
	*	Produces output to the debug tab.
	*	
	*	@param {string} text	Text to be written.
	*	@param {string} title	Title of the entry. Optional.
	*/
	var logger = function (text, title) {

		if (typeof title === 'undefined') {
			title = '*';
		}

		if (typeof text !== 'string') {
			text = JSON.stringify(text);
		}

		$('#debugOut').prepend($('<div style="border-bottom: 1px solid black"></div>').text('[' + title + '] ' + (new Date().toTimeString()) + ':').append($('<div></div>').text(text)));
	};	

	/* Trick jquery ajax to make the things that we need */
	$.ajaxSetup({
		error: handleAjaxError,
		beforeSend: function (jqXHR, settings) {

			jqXHR.url = settings.url;
			jqXHR.stackTrace = getStackTrace(arguments.callee);
			jqXHR.ignoreErrors = settings.ignoreErrors;
		}
	});

	/* Include our own converter to handle the TV customized ajax results */	
	$.ajaxSettings.converters['text tvResult'] = $.parseJSON;

	/* Hack ajax calls so every tvResult type get wrapped by the global event handlers */
	$.ajaxPrefilter('tvResult', function (options, originalOptions, jqXHR) {

		/* Provide our own success function that knows how to interpret the TV response */
		options.success = function (data) {			

			if (data.result === 'Success') {

				/* Invoke the success handler, if there was a handler defined */
				if (typeof originalOptions.success === 'function') {
					originalOptions.success(data.content);
				}				
			}
			else if (data.result === 'Error') {

				/* Fire a generic error bubble, and forget. */
				tv.bubbleMessage.show(tv.bubbleMessage.BubbleTypes.Warning, data.message || TL.JS_RS_GenericErrorMessage);
			}
			else if (data.result === 'TryLater') {

				/* Retry the original operation after 1 second. */
				setTimeout(function () {
					$.ajax(originalOptions);
				}, 1000);
			}
		};
	});

	/* Catch all the errors produced in the windowobject */
	window.onerror = errorTrap;

	/**
	*	Public interface
	*/
	return {
		/* Deprecated */
		createDateString: createDateString,
		createTimeString: createTimeString,
		parseTimeFromUTC: parseTimeFromUTC,
		createNowString: createNowString,
		createSizeString: createSizeString,
		cutString: cutString,
		notify: notify,
		logger: window.PF.Debug ? logger : $.noop,
		writeLog: window.PF.TeamViewerRunning ? writeLog : logger,
		htmlEncode: htmlEncode,
		htmlDecode: htmlDecode,
		dialogs: {},
		getUrlParam: getUrlParam,
		switchTabByIndex: function (tabIndex) {
			if (tabsControl) {
				tabsControl.click(Number(tabIndex));
			} else {
				logger("tv.switchTab: TabControl not initialized yet.");
			}
		},
		switchTabById: function(tabId) {
			var $tabPanel = $("#" + tabId);
			if ($tabPanel) {
				tv.switchTabByIndex($tabPanel.index());
			}
		},
		setTabsControl: function(tabControlParam) {
			tabsControl = tabControlParam;
		}
	};
})(jQuery, window.moment, window.LOCALE, window.TL);

