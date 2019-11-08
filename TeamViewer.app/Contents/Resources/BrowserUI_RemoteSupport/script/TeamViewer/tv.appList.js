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
*	Encapsulates all the functionality in the "Apps" tab.
*/
tv.appList = (function ($, ko, tv, PF) {
	/* Constants */
	var SORT_FIELD = 'data-sort-field';
	var ASC = 'asc';
	var DESC = 'desc';


	/* Maps the field names with the comparers */
	var comparers = {
		name: tv.query.compare.string,
		versionRaw: tv.query.compare.string,
		sizeRaw: tv.query.compare.number,
		dateRaw: tv.query.compare.date
	};

	/* Setup the ViewModel with a self calling function */
	var viewModel = new (function() {

		/* Point to our VM */
		var self = this;
		/* Holds the items. */
		self.installedApplications = new ko.observableArray();

		/* Defines the sorting configuration. */
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
				self.installedApplications.sort(function (pivot, item) {
					return comparer(pivot[field], item[field]);
				});
			}
			else {
				self.installedApplications.sort(function (pivot, item) {
					return comparer(item[field], pivot[field]);
				});
			}
		};

		self.uninstallApp = function (appViewModel, eventObj) {
			uninstallApplication(appViewModel.id);
		};
	})();	

	var parseElement = function (elementData, id) {

		/* Check if the device supports serving App icons */
		if (PF.Apps.MA_FUNC_GETICON) {

			/* Trigger the image loading */
			setTimeout(function () {
				var imageLoader = new Image();
				imageLoader.onload = function () {
					refreshIcon(id);
				};
				imageLoader.src = 'module/apps/' + id + '.image';
			}, 50);
		}

		return {
			id: id,
			name: elementData.MA_NAME,

			installDate: ko.observable(tv.createDateString(elementData.MA_INSTALL_DATE)),
			updateDate: ko.observable(tv.createDateString(elementData.MA_UPDATE_DATE)),
			versionName: ko.observable(tv.cutString(elementData.MA_VERSION_NAME, 10)),
			size: ko.observable(tv.createSizeString(elementData.MA_SIZE)),

			sizeRaw: elementData.MA_SIZE,
			dateRaw: new Date(elementData.MA_INSTALL_DATE),
			versionRaw: tv.cutString(elementData.MA_VERSION_NAME, 10) || ' '
		};
	};

	var requestData = function (complete) {
		$.ajax({
			url: 'module/apps/requestapplist.cmd',
			data: { complete: complete },
			dataType: 'tvResult'
		});
	};

	var getData = function (totalRefresh) {

		/* Correctly conver the complete flag into a boolean */
		totalRefresh = totalRefresh === true || totalRefresh === 'true';

		$.ajax({
			url: 'module/apps/getapplist.cmd',
			data: { complete: totalRefresh },
			dataType: 'tvResult',
			success: function (data) {

				tv.logger(data, 'tv.appList.getData(' + totalRefresh + ')');

				if (data) {

					if (data.installed) {

						var apps = [];

						$.each(data.installed, function (index, elementData) {
							apps.push(parseElement(elementData, index));
						});

						if (totalRefresh) {
							/* Insert all the items of the array at once. Replace any existent */
							viewModel.installedApplications(apps);
						}
						else {

							/* Push the new apps in the array */
							viewModel.installedApplications.push.apply(viewModel.installedApplications, apps);							
						}

						/* Sort the array */
						viewModel.performSort();
					}

					if (data.replaced) {
						$.each(data.replaced, function (index, elementData) {
							updateExistingElement(index, elementData);
						});

						/* Sort the array */
						viewModel.performSort();
					}
					if (data.removed) {
						$.each(data.removed, function (index, elementData) {
							removeApplication(index);
						});
					}
					if (data.dataChanged) {
						$.each(data.dataChanged, function (index, elementData) {
							updateExistingElement(index, elementData);
						});

						/* Sort the array */
						viewModel.performSort();
					}
				}
			}
		});
	};

	var updateExistingElement = function (index, elementData) {

		var searchResults = tv.query.first(viewModel.installedApplications(), function (item) {
			return item.id === index;
		});

		if (searchResults) {

			var element = searchResults.item;

			if (elementData.MA_INSTALL_DATE) {
				element.installDate(tv.createDateString(elementData.MA_INSTALL_DATE));
				element.dateRaw = new Date(elementData.MA_INSTALL_DATE);
			}
			if (elementData.MA_VERSION_NAME) {
				element.versionName(elementData.MA_VERSION_NAME);
				element.versionRaw = tv.cutString(elementData.MA_VERSION_NAME, 10);
			}
			if (elementData.MA_SIZE) {
				element.size(tv.createSizeString(elementData.MA_SIZE));
				element.sizeRaw = elementData.MA_SIZE;
			}
		}
	};

	var removeApplication = function (appId) {

		var removed = viewModel.installedApplications.remove(function (item) { return item.id === appId; });

		tv.logger(removed, 'Removed Apps');
	};

	var refreshIcon = function (appId) {

		/* Prepare a smart image */
		var img = $('<img />').bind('error', function () {

			/* Get the error information */
			var me = $(this);
			var retries = Number(me.attr('retries')) + 1;
			var oldSrc = me.attr('src') + '?' + new Date().getTime();

			if (retries > 4) {
				tv.logger(oldSrc + 'could not be loaded after trying ' + retries + ' times. Will never be shown here');
				return;
			}

			me.attr('retries', retries);

			/* Retry the image loading after 250 milliseconds */
			setTimeout(function () {
				me.attr('scr', '').attr('src', oldSrc);
			}, 250);
		}).bind('load', function () {
			/* Push the image into the DOM */
			var placeholder = $('#InstalledApplicationsList').find('.img-placeholder[appid="' + appId + '"]');
			placeholder.removeClass('img-placeholder').append(this);
		}).attr('retries', 0).attr('src', 'module/apps/' + appId + '.image');
	};

	var uninstallApplication = function (appId) {

		$.ajax({
			url: 'module/apps/uninstallapp.cmd',
			data: { appid: appId },
			dataType: 'tvResult'
		});
	};

	var installApp = function () {
		tv.dialog.open(tv.dialogs.installApp);
	};

	/**
	*	Public interface
	*/
	return {
		requestData: (!!PF.Apps) ? requestData : $.noop,
		getData: (!!PF.Apps) ? getData : $.noop,
		refreshIcon: (!!PF.Apps) ? refreshIcon : $.noop,
		uninstallApplication: (!!PF.Apps) ? uninstallApplication: $.noop,
		installApp: (!!PF.Apps) ? installApp : $.noop,
		removeApplication: (!!PF.Apps) ? removeApplication : $.noop,
		bind: function (htmlElement) {
			ko.applyBindings(viewModel, htmlElement);
		},
		showMessage: function (jSonStringifiedData) {
			var data = null;
			try {
				data = $.parseJSON(jSonStringifiedData);
			} catch (e) {
				tv.logger("tv.appList.showMessage error parsing JSON string");
			} 

			if (data) {
				var message = '';
				var timeout = data.timeout || 0;
				var type = data.msgType || 0;

				switch (data.msgTextType) {
					case 0: /* app uninstall failed */
						message = TL['JS_RS_appUninstallFailed'];
						break;

					case 1: /* own app cannot be uninstalled */
						message = TL['JS_RS_ownAppCannotBeUninstalled'];
						break;

					case 2: /* app uninstall canceled */
						message = TL['JS_RS_appUninstallCanceled'];
						break;
					
					default:
						message = 'unknown message';
						tv.logger('tv.remoteControl: unknown message ID ' + String(data.msgTextType));
				}

				if (data.params) {
					var appId = data.params.appId;
					var app = ko.utils.arrayFirst(viewModel.installedApplications(), function(appModel) {
						return appModel.id === appId;
					});
					var appName = app ? app.name : appId;
					// templated string build
					message = tv.stringFormat.apply(this, [message, appName]);
				}

				tv.bubbleMessage.show(type, message, timeout);
			}
		}
	};
})(jQuery, window.ko, window.tv, window.PF);