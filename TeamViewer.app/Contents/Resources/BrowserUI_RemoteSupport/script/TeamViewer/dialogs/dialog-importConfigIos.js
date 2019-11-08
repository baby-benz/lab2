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

	var downloadLinkMarkedUp = '<a class="downloadUtilityLink" href="#" style="color: #006; text-decoration: none;">' + TL.JS_RS_iPhoneConfigurationUtility + '</a>';

	tv.dialogs.importConfigIos = {
		title: TL.JS_RS_importIosConfiguration,
		content: function () {
			return $('#importConfigIosDialog').html();
		},
		open: function () {
			var dOptions = $(this).data('uiDialog').options;
			var model = dOptions.payload;

			/* Build the HTML markup for the Download iPhoneConfigurationUtility paragraph */
			model.downloadText = TL.JS_RS_iOS_configurationProfilesDownload.replace(/\{0\}/, downloadLinkMarkedUp);

			/* Apply the bindings */
			ko.applyBindings(model, this);

			$('.downloadUtilityLink').click(model.fn.downloadTool);
		},
		valOptions: {
			submitHandler: function () {
				return false;
			},
			rules: {
				importUrl: {
					required: true,
					url: true
				}
			},
			messages: {
				importUrl: {
					url: TL.JS_RS_valMsg_pleaseEnterCorrectUrl
				}
			},
			ignore: '.ignore'
		},
		width: 500,
		buttons: [
			{
				html: TL.JS_RS_install,
				click: function () {
					var me = this;
					var dOptions = $(this).data('uiDialog').options;
					var $form = $('form', me);
					var model = dOptions.payload.model;

					if (model.fileMode() === 'browse' && !model.IOSCONFIG_FILE()) {

						$('#importFileName').text(TL.JS_RS_pleaseChooseFile_error).addClass('error');						
						return;
					}

					if ($form.valid()) {
						var url = null;
						var data = null;
						if (model.IOSCONFIG_FILE()) {
							url = 'module/settings/uploadconfigfromfile.cmd';
							data = model.IOSCONFIG_FILE();
						} else {
							url = 'module/settings/uploadconfigfromurl.cmd';
							data = model.IOSCONFIG_URL();
						}
						$.ajax({
							url: url,
							type: 'POST',
							data: data,
							dataType: 'tvResult',
							contentType: 'text/plain',
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