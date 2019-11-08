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
*	Encapsulates all the functionality in the "DevieInformation" section.
*/
tv.deviceInfo = (function ($, ko, tv, PF) {

	/* Setup viewmodel */
	var viewModel = new (function () {

		/* When VM has computed observables, we need a different approach because of the use of "this" */
		var self = this;

		self.os = ko.observable('');
		self.modelname = ko.observable('');
		self.resolutionwidth = ko.observable(0);
		self.manufacturer = ko.observable('');
		self.resolutionheight = ko.observable(0);
		self.imei = ko.observable('');
		self.hostname = ko.observable('');
		self.uuid = ko.observable('');
		self.language = ko.observable('');
		self.dpi = ko.observable('');
		self.serialnumber = ko.observable('');
		self.osversion = ko.observable('');

		self.resolution = ko.computed(function () {
			return self.resolutionwidth() + 'x' + self.resolutionheight();
		});

		self.PF = {
			os: ko.observable(false),
			modelname: ko.observable(false),
			manufacturer: ko.observable(false),
			imei: ko.observable(false),
			hostname: ko.observable(false),
			uuid: ko.observable(false),
			language: ko.observable(false),
			dpi: ko.observable(false),
			serialnumber: ko.observable(false),
			resolution: ko.observable(false),
			osversion: ko.observable(false)
		};
	})();

	var getViewModel = function () {
		return viewModel;
	};

	var getData = function () {
		$.ajax({
			url: 'deviceinfos/getdeviceinfos.cmd',
			dataType: 'tvResult',
			success: function (data) {

				if (data) {				

					tv.logger(data, 'tv.deviceInfo.getData()');

					if (typeof data.os !== 'undefined') {
						viewModel.os(data.os);
						viewModel.PF.os(true);
					}
					if (typeof data.modelname !== 'undefined') {
						viewModel.modelname(data.modelname);
						viewModel.PF.modelname(true);
					}
					if (typeof data.resolutionwidth !== 'undefined') {
						viewModel.resolutionwidth(data.resolutionwidth);
						viewModel.PF.resolution(true);
					}
					if (typeof data.resolutionheight !== 'undefined') {
						viewModel.resolutionheight(data.resolutionheight);
						viewModel.PF.resolution(true);
					}
					if (typeof data.manufacturer !== 'undefined') {
						viewModel.manufacturer(data.manufacturer);
						viewModel.PF.manufacturer(true);
					}
					if (typeof data.imei !== 'undefined') {
						viewModel.imei(data.imei);
						viewModel.PF.imei(true);
					}
					if (typeof data.hostname !== 'undefined') {
						viewModel.hostname(data.hostname);
						viewModel.PF.hostname(true);
					}
					if (typeof data.uuid !== 'undefined') {
						viewModel.uuid(data.uuid);
						viewModel.PF.uuid(true);
					}
					if (typeof data.language !== 'undefined') {
						viewModel.language(data.language);
						viewModel.PF.language(true);
					}
					if (typeof data.dpi !== 'undefined') {
						viewModel.dpi(Math.round(data.dpi));
						viewModel.PF.dpi(true);
					}
					if (typeof data.serialnumber !== 'undefined') {
						viewModel.serialnumber(data.serialnumber);
						viewModel.PF.serialnumber(true);
					}
					if (typeof data.osversion !== 'undefined') {
						viewModel.osversion(data.osversion);
						viewModel.PF.osversion(true);
					}
				}
			}
		});
	};

	/**
	*	Public interface
	*/
	return {
		getVM: getViewModel,

		/* Ensure the TV client cant call any callback here is no PF flag was set */
		getData: getData
	};
})(jQuery, window.ko, window.tv, window.PF);