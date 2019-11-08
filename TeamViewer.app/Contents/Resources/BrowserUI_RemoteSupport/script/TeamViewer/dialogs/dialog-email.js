/*
* Copyright (C) 2005-2013 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/

(function ($, tv, ko, TL) {

	tv.dialogs.email = {
		title: TL.JS_RS_emailConfiguration,
		content: function () {
			return $('#eMailDialog').html();
		},
		open: function () {

			var dOptions = $(this).data('uiDialog').options;
			ko.applyBindings(dOptions.payload, this);
		},
		width: 700,
		height: 670,
		vTabs: true,
		valOptions: {
			submitHandler: function () {
				return false;
			},
			rules: {
				displayName: {
					required: true
				},
				eMailAddress: {
					required: true,
					email: true
				},
				sendServer: {
					required: true
				},
				receiveServer: {
					required: true
				},
				incommingServer: {
					required: true
				},
				outgoingServer: {
					required: true
				}
			},
			messages: {
			},
			ignore: '.ignore'
		},
		buttons: [
			{
				html: TL.JS_RS_install,
				click: function () {
					var me = this;
					var dOptions = $(this).data('uiDialog').options;
					var $form = $('form', me);

					if ($form.valid()) {

						// Spice up the data
						var data = ko.toJS(dOptions.payload.model);
						data.MMC_IN_PORT = Number(data.MMC_IN_PORT);
						data.MMC_OUT_PORT = Number(data.MMC_OUT_PORT);

						$.ajax({
							url: 'module/settings/addemail.cmd',
							type: 'POST',
							data: $.toJSON([data]),
							dataType: 'tvResult',
							contentType: 'application/json',
							success: function () {
								$(me).dialog('close');
							}
						});
					}
				},
				'class': 'right'
			},
			{
				html: TL.JS_RS_cancel,
				click: function () {
					$(this).dialog('close');
				},
				'class': 'right onlyTextDialogButton'
			}
		]
	};
})(jQuery, tv, ko, window.TL);