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
*	Encapsulates all the functionality in the "Log" tab.
*/
tv.log = (function ($, ko, tv, PF) {

	/* Constants */
	var SORT_FIELD = 'data-sort-field';
	var ASC = 'asc';
	var DESC = 'desc';

	/* Maps the log level with a human-readable name */
	var logLevels = {};
	logLevels['0'] = 'unknown';
	logLevels['100'] = 'debug';
	logLevels['200'] = 'info';
	logLevels['300'] = 'warning';
	logLevels['400'] = 'error';
	logLevels['500'] = 'critical-error';


	/* Maps the field names with the comparers */
	var comparers = {
		levelRaw: tv.query.compare.number,
		pid: tv.query.compare.number,
		msg: tv.query.compare.string,
		timestamp: tv.query.compare.number,
		procname: tv.query.compare.string
	};

	/*	Setup the ViewModel with a self calling function
		because we need to used computed observables. */
	var viewModel = new (function () {

		/* VM pointer */
		var self = this;

		/* Item container */
		self.entries = new ko.observableArray();

		/* Initial sorting configuration. */
		self.sortField = ko.observable('timestamp');
		self.sortDir = ko.observable(DESC);

		/* Handles the click event on the column header, that trigger sorting */
		self.sort = function (viewModel, event) {
			var field = $(event.target).closest('th').attr(SORT_FIELD);

			var currentField = self.sortField();
			var currentDir = self.sortDir();

			if (currentField === field) {
				currentDir = currentDir === ASC ? DESC : ASC;
			}
			else {
				currentDir = ASC;
			}

			self.sortField(field);
			self.sortDir(currentDir);

			self.performSort();
		};

		/* Defines the sorting algorithm */
		self.performSort = function () {

			var field = self.sortField();
			var direction = self.sortDir();

			/* Get the comparer */
			var comparer = comparers[field];

			/* Do the comparison */
			if (direction === ASC) {
				self.entries.sort(function (pivot, item) {
					return comparer(pivot[field], item[field]);
				});
			}
			else {
				self.entries.sort(function (pivot, item) {
					return comparer(item[field], pivot[field]);
				});
			}
		};
	})();

	var getViewModel = function () {
		return viewModel;
	};

	var parseEntry = function (elementData) {

		return {
			level: logLevels[elementData.MSL_LOGLEVEL],
			levelRaw: elementData.MSL_LOGLEVEL,
			pid: elementData.MSL_PID,
			msg: elementData.MSL_MSG,
			time: tv.parseTimeFromUTC(elementData.MSL_TIMESTAMP, true),
			timestamp: elementData.MSL_TIMESTAMP,
			procname: elementData.MSL_PROCESSNAME
		};
	};

	var requestData = function (complete) {

		$.ajax({
			url: 'module/systemlog/requestsystemlog.cmd',
			dataType: 'tvResult',
			data: { complete: complete }
		});
	};

	var getData = function (complete) {

		/* Make sure we parse the true in the right way */
		complete = complete === true || complete === 'true';

		/* Make the ajax call for getting the log list from the server */
		$.ajax({
			url: 'module/systemlog/getsystemlog.cmd',
			data: { complete: complete },
			dataType: 'tvResult',
			success: function (data) {

				tv.logger(data, 'tv.log.getData(' + complete + ')');

				if (data) {

					/* Map the JSON objects to our viewmodel data structure */
					var newEntries = $.map(data, function (elementData) {
						return parseEntry(elementData);
					});

					/* Limit the array to the first 50 entries for refresh */
					if (!complete) {

						var length = newEntries.length;
						var maxItems = 50;

						if (length > maxItems) {

							tv.logger('Cuttig the Log from ' + length + ' to ' + maxItems + ' items');

							var startIndex = (newEntries[0].timestamp > newEntries[length - 1].timestamp) ? 0 : length - maxItems;
							newEntries = newEntries.splice(startIndex, maxItems);
						}
					}					

					/* Push item to the UI */
					if (complete) {
						/* Replace all the entries in the observable array */
						viewModel.entries(newEntries);
					}
					else {
						/* Batch-insert the entries in the observable array */
						viewModel.entries.unshift.apply(viewModel.entries, newEntries);
					}

					/* Call the sorting algorithm */
					viewModel.performSort();
				}
			}
		});
	};

	/**
	*	Public interface
	*/
	return {
		getVM: getViewModel,
		requestData: (!!PF.SystemLog) ? requestData : $.noop,
		getData: (!!PF.SystemLog) ? getData : $.noop
	};
})(jQuery, window.ko, window.tv, window.PF);