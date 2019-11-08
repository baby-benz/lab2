/*
* Copyright (C) 2005-2013 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/

(function ($, tv, ko, TL, PF) {

	tv.dialogs.wlan = {
		title: TL.JS_RS_wifi,
		content: function () {
			return $('#wlanDialog').html();
		},
		open: function () {
			var dOptions = $(this).data('uiDialog').options;
			ko.applyBindings(dOptions.payload, this);
		},
		valOptions: {
			submitHandler: function () {
				return false;
			},
			rules: {
				displayName: {
					required: true
				},
				accountType: {
					required: true
				},
				password: {
					required: true
				},
				plainPassword: {
					required: true
				}
			},
			ignore: '.ignore'
		},
		width: 500,
		height: 310,
		preBuild: function (dOptions) {			

			if (dOptions.payload.command === tv.enums.MWC.MWC_CHANGE_WIFI_CONFIGURATION) {
				/* Change the text of the OK button, to Save */
				dOptions.buttons[0].html = TL.JS_RS_save;

				/* Push the "Delete button" if command == MWC_CHANGE_WIFI_CONFIGURATION	and if the Device supports the feature (PF). */
				if (PF.Settings.WifiConfiguration.MWC_REMOVE_WIFI_CONFIGURATION) {

					/* Push the delete button */
					dOptions.buttons.unshift({
						html: TL.JS_RS_delete,
						click: function () {

							var parentDialog = this;

							tv.dialog.open({
								dialogType: 'yesNo',
								yesText: TL.JS_RS_delete,
								noText: TL.JS_RS_cancel,
								title: TL.JS_RS_deleteWifiConfirm,
								msg: tv.stringFormat(TL.JS_RS_confirm_DeleteWlan, dOptions.payload.model.MWC_SSID()),
								yesCallback: function () {
									var me = this;
									var data = [dOptions.payload.model];

									$.ajax({
										url: 'module/settings/removewlan.cmd',
										type: 'POST',
										data: ko.toJSON(data),
										dataType: 'tvResult',
										contentType: 'application/json',
										success: function () {
											$(me).dialog('close');
											$(parentDialog).dialog('close');
										}
									});
								}
							});
						},
						'class': 'floatLeft onlyTextDialogButton'
					});
				}
			}
		},
		buttons: [
			{
				html: TL.JS_RS_install,
				click: function () {
					var me = this;
					var dOptions = $(me).data('uiDialog').options;
					var $form = $('form', me);
					var cmdUrl = (dOptions.payload.command === tv.enums.MWC.MWC_CHANGE_WIFI_CONFIGURATION) ? 'module/settings/changewlan.cmd' : 'module/settings/addwlan.cmd';

					/* Send data only if the form has passed validation */
					if ($form.valid()) {

						var data = [ko.toJS(dOptions.payload.model)];

						$.ajax({
							url: cmdUrl,
							type: 'POST',
							dataType: 'tvResult',
							data: $.toJSON(data),
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
})(jQuery, tv, ko, window.TL, window.PF);