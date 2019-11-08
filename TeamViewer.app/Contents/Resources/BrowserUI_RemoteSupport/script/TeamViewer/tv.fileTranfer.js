/*
* Copyright (C) 2005-2015 TeamViewer GmbH. All rights reserved.
*
* This is unpublished proprietary source code of TeamViewer
* GmbH. The contents of this file may not be disclosed to third
* parties, copied or duplicated in any form, in whole or in part,
* without the prior written permission of TeamViewer GmbH.
* For further regulations see the file "license.txt".
*/


/**
*	Contains event handlers for the UI.
*/
tv.fileTransfer = (function ($, ko, tv) {

	var showMessage = function (jSonStringifiedData) {
		var data = null;
		try {
			data = $.parseJSON(jSonStringifiedData);
		} catch (e) {
			tv.logger("tv.remoteControl.showMessage error parsing JSON string");
		}

		if (data) {
			var message = '';
			var timeout = data.timeout || 20 * 1000;
			var type = data.msgType || 0;

			switch (data.msgTextType) {
				case 0: /* unknown reason */
					message = TL['JS_RS_sessionDenied'];
					break;

				case 1: /* session denied by user */
					message = TL['JS_RS_sessionDeniedByUser'];
					break;

				case 2: /* denied by access control */
					message = TL['JS_RS_fileTransferDeniedByAC'];
					break;

				default:
					message = 'unknown message';
					tv.logger('tv.fileTransfer: unknown message ID ' + String(data.msgTextType));
			}

			tv.bubbleMessage.show(type, message, timeout);
		}
		
	};

	/**
	*	Public interface
	*/
	return {
		showMessage: showMessage
	};
})(jQuery, window.ko, window.tv);