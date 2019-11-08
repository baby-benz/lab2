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
*	Encapsulates all the functionality in the "Processes" tab.
*/
tv.processList = (function ($, ko, tv, PF) {

	/* Constants */
	var SORT_FIELD = 'data-sort-field';
	var ASC = 'asc';
	var DESC = 'desc';

	/* Maps the field names with the comparers */
	var comparers = {		
		pid: tv.query.compare.number,
		name: tv.query.compare.string,
		startTime: tv.query.compare.numberInverted,
		memoryUsedRaw: tv.query.compare.number
	};

	/* This variable will hold the DateTime.NOW point of reference for the "Runtime" column. */
	var lastUpdate = ko.observable(new Date().getTime());	

	/*	Setup the ViewModel with a self calling function because we need to used computed observables. */
	var viewModel = new (function() {
		
		var self = this;
		self.apps = new ko.observableArray();
		self.others = new ko.observableArray();

		/* Initial sorting configuration. */
		self.sortField = ko.observable('name');
		self.sortDir = ko.observable(ASC);

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
				self.apps.sort(function (pivot, item) {
					return comparer(pivot[field], item[field]);
				});

				self.others.sort(function (pivot, item) {
					return comparer(pivot[field], item[field]);
				});
			}
			else {
				self.apps.sort(function (pivot, item) {
					return comparer(item[field], pivot[field]);
				});

				self.others.sort(function (pivot, item) {
					return comparer(item[field], pivot[field]);
				});
			}
		};

		self.stopProcess = function(procViewModel, eventObj) {
			stopProcess(procViewModel.pid);
		};
	})();

	var requestData = function (complete) {

		$.ajax({
			url: 'module/processes/requestprocesslist.cmd',
			data: { complete: complete },
			dataType: 'tvResult'
		});
	};

	var parseEntry = function (elementData) {

		var pid = Number(elementData.MP_PID);

		/* Check if the device supports serving Process icons */
		if (PF.Processes.MP_FUNC_GETICON) {

			/* Trigger the image loading */
			setTimeout(function () {
				var imageLoader = new Image();
				imageLoader.onload = function () {
					refreshIcon(pid);
				};
				imageLoader.src = 'module/processes/' + pid + '.image';
			}, 50);
		}

		return new (function () {

			var self = this;
			self.pid = pid;
			self.name = elementData.MP_NAME;
			self.processType = elementData.MP_TYPE;
			self.startTime = new Date().getTime() - elementData.MP_STARTTIME * 1000;

			self.memoryUsed = ko.observable(tv.createSizeString(elementData.MP_MEMORY_USED * 1024));
			self.memoryUsedRaw = elementData.MP_MEMORY_USED;
			self.serviceCount = ko.observable(elementData.MP_SERVICE_COUNT);
			self.serviceCountRaw = elementData.MP_SERVICE_COUNT;

			self.runtime = ko.computed(function () {
				return tv.createTimeString(lastUpdate() - self.startTime, true);
			});
		})();
	};

	var removeProcess = function (pid) {

		pid = Number(pid);

		var sysRemoval = viewModel.others.remove(function (item) { return item.pid === pid; });
		var appsRemoval = viewModel.apps.remove(function (item) { return item.pid === pid; });

		tv.logger({ sysRemoved: sysRemoval, appsRemoved: JSON.stringify(appsRemoval) }, 'remove proc: ' + pid);
	};

	var getData = function (complete) {

		/* Correctly conver the complete flag into a boolean */
		complete = complete === true || complete === 'true';

		$.ajax({
			url: 'module/processes/getprocesslist.cmd',
			data: { complete: complete },
			dataType: 'tvResult',
			success: function (data) {

				if (data) {

					/*tv.logger(data, 'tv.processList.getData?complete=' + complete);*/

					if (data.started) {

						/* Parse all entries */
						var newItems = $.map(data.started, function (elementData) {
							return parseEntry(elementData);
						});

						/* Separate the entries into apps and services */
						var apps = [];
						var others = [];

						for (var i = 0; i < newItems.length; i++) {
							var currentItem = newItems[i];

							if (currentItem.processType === 1) {
								apps.push(currentItem);
							}
							else {
								others.push(currentItem);
							}
						}


						/* Apply the new apps and services to the UI */
						if (complete) {

							tv.logger('Making a full process arrays refresh');
							
							/* Push the new items in the models */
							viewModel.apps(apps);
							viewModel.others(others);
						}
						else {

							tv.logger('Appending ' + apps.length + ' new apps and ' + others.length + ' new procs into the processes arrays');

							/* Applications */
							if (apps.length > 0) {

								viewModel.apps.push.apply(viewModel.apps, apps);								
							}

							/* Services */
							if (others.length > 0) {

								viewModel.others.push.apply(viewModel.others, others);								
							}
						}

						viewModel.performSort();

						/* Patch the last update value so we dont get negative values */
						lastUpdate(new Date().getTime());
					}

					/* If the process has changed, find the items and refresh the observable properties. */
					if (data.altered) {

						$.each(data.altered, function (index, elementData) {
							updateExistingElement(index, elementData);
						});

						viewModel.performSort();
					}

					/* If the process has been removed, find and remove it from the array. */
					if (data.stopped) {

						$.each(data.stopped, function (index, elementData) {
							removeProcess(index);
						});
					}
				}
			}
		});
	};

	var updateExistingElement = function (index, elementData) {

		var array = (elementData.MP_TYPE === 1) ? viewModel.apps() : viewModel.others();
		var searchResults = tv.query.first(array, function (item) { return item.pid === Number(index); });

		if (searchResults) {

			var element = searchResults.item;

			if (elementData.MP_MEMORY_USED) {
				element.memoryUsed(tv.createSizeString(elementData.MP_MEMORY_USED * 1024));
				element.memoryUsedRaw = elementData.MP_MEMORY_USED;
			}
			if (elementData.MP_SERVICE_COUNT) {
				element.serviceCount(elementData.MP_SERVICE_COUNT);
				element.serviceCountRaw = elementData.MP_SERVICE_COUNT;
			}
		}
	};

	var refreshIcon = function (appId) {

		/* Prepare a smart image */
		var img = $('<img />').bind('error', function () {

			/* Get the error information */
			var me = $(this);
			var retries = Number(me.attr('retries')) + 1;
			var oldSrc = me.attr('src') + '?' + new Date().getTime();

			if (retries > 4) {
				tv.logger(oldSrc + ' could not be loaded after trying for ' + retries + ' times. It will never be shown :(');
				return;
			}

			me.attr('retries', retries);

			/* Retry the image loading after 250 milliseconds */
			setTimeout(function () {
				me.attr('scr', '').attr('src', oldSrc);
			}, 250);
		}).bind('load', function () {

			/* Push the image into the DOM */
			var placeholder = $('#RunningProcessesTable').find('.img-placeholder[pid="' + appId + '"]');
			placeholder.removeClass('img-placeholder').append(this);
		}).attr('retries', 0).attr('src', 'module/processes/' + appId + '.image');
	};

	/**
	*	Stops a process by its process id.
	*/
	var stopProcess = function (pid) {

		$.ajax({
			url: 'module/processes/stopprocess.cmd',
			data: { pid: pid },
			dataType: 'tvResult'
		});
	};

	/* Only refresh the running time if the right flag is present in window.PF */
	if (PF.Processes && PF.Processes.MP_STARTTIME) {
		/* This function will update the UI every 20 secs. Because of the "Runtime" column */
		setInterval(function () {
			lastUpdate(new Date().getTime());
		}, 20000);
	}

	/**
	*	Public interface
	*/
	return {
		requestData: (!!PF.Processes) ? requestData : $.noop,
		getData: (!!PF.Processes) ? getData : $.noop,
		refreshIcon: (!!PF.Processes) ? refreshIcon : $.noop,
		stopProcess: (!!PF.Processes) ? stopProcess : $.noop,
		removeProcess: (!!PF.Processes) ? removeProcess : $.noop,
		bind: function (htmlElement) {

			// Bind the table.
			ko.applyBindings(viewModel, htmlElement);

			// Running Process List
			var groupHeaders = $(htmlElement).find('tbody tr.tg-parent > td');	

			// Fix an issue with the colspan value of the tg-parent elements in the table.
			var cols = $(htmlElement).find('thead th').length;
			groupHeaders.attr('colspan', cols);
		},
		showMessage: function(jSonStringifiedData) {
			var data = null;
			try {
				data = $.parseJSON(jSonStringifiedData);
			} catch (e) {
				tv.logger("tv.appList.showMessage error parsing JSON string");
			}

			if (data) {
				var message = '';
				var timeout = data.timeout || 20 * 1000;
				var type = data.msgType || 0;

				switch (data.msgTextType) {
				case 0: /* stopping a proc failed */
					message = TL['JS_RS_processStopFailed'];
					break;

				case 1: /* own process cannot be stopped */
					message = TL['JS_RS_ownProcessCannotBeStopped'];
					break;

					default:
						message = 'unknown message';
						tv.logger('tv.processList: unknown message ID ' + String(data.msgTextType));
				}

				if (data.params) {
					var processIds = data.params.processIds;
					var processNames = [];

					$.each(processIds, function(index, pid) {
						var app = ko.utils.arrayFirst(viewModel.apps(), function (appModel) {
							return appModel.pid === pid;
						});

						if (app) {
							processNames.push(app.name);
						} else {
							// look in the other list

							var other = ko.utils.arrayFirst(viewModel.others(), function (otherModel) {
								return otherModel.pid === pid;
							});
							if (other) {
								processNames.push(other.name);
							}
						}
					});

					// templated string build
					message = tv.stringFormat.apply(this, [message, processNames.join(', ')]);
				}

				tv.bubbleMessage.show(type, message, timeout);
			}
		}
	};
})(jQuery, window.ko, window.tv, window.PF);