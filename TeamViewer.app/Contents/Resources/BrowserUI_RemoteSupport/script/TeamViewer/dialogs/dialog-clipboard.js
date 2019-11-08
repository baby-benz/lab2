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

    tv.dialogs.clipboard = {
        dialogClass: "copyToClipboard",
		title: TL.JS_RS_clipboard,
		content: function () {
			return $('#clipboardDialog').html();
		},
		open: function () {
			ko.applyBindings({}, this); //binding needed for translation;
		},
		valOptions: {
			rules: {
				clipboardTextArea: {
					required: true
				}
			},
			ignore: ".ignore"
		},
		minWidth: 270,
		width: 270,
		height: "auto",
		buttons: [
			{
				html: TL.JS_RS_send,
				click: function () {

					/* Get context variables */
					var me = this;
					var $form = $('form', me);

					/* Send data only if the form has been validated */
					if ($form.valid()) {

						$.ajax({
							url: 'module/clipboard/sendtext.cmd',
							dataType: 'tvResult',
							type: 'POST',
							data: $('#clipboardTextArea', this).val(),
							success: function () {
								$(me).dialog('close');
								tv.chat.textCopied();
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