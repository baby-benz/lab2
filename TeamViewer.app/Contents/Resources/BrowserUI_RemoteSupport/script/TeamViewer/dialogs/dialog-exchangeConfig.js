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

	tv.dialogs.exchange = {
		title: TL.JS_RS_exchangeConfiguration,
		content: function () {
			return $('#msExchangeDialog').html();
		},
		open: function () {
			var dOptions = $(this).data('uiDialog').options;
			ko.applyBindings(dOptions.payload, this);
		},
		valOptions: {
			rules: {
				submitHandler: function () {
					return false;
				},
				emailAddress: {
					required: true,
					email: true
				},
				domain: {
					required: false
				},
				username: {
					required: function (element) {
						// get the dialogOptions
						var dOptions = $(element).closest(".ui-dialog-content").data('uiDialog').options;
						return $.trim(dOptions.payload.model.MEC_DOMAIN()) != "";
					}
				},
				server: {
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
					var data = [dOptions.payload.model];

					if ($form.valid()) {
						$.ajax({
							url: 'module/settings/addexchange.cmd',
							type: 'POST',
							data: ko.toJSON(data),
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