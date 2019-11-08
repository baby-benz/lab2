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
*	Contains event handlers for the UI.
*/
tv.remoteControl = (function ($, ko, tv) {

	var remoteControlClicked = function () {
		$.ajax({
			url: 'event/mainEvents/remoteControlClicked.cmd'
		});
	};

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
			/* data.msgTextType is defined in the enum ScreenModuleMessageType in file RemoteSupportUiMessageDefinitions.h */
			switch (data.msgTextType) {
				case 0: /* unknown reason - Unknown*/
					message = TL['JS_RS_sessionDenied'];
					break;

				case 1: /* session denied by user - DeniedByUser*/
					message = TL['JS_RS_sessionDeniedByUser'];
					break;

				case 2: /* screen grabbing failed - ScreenGrabbingFailed*/
					message = TL['JS_RS_screenGrabbingFailed'];
					break;

				case 3: /* denied by access control - DeniedByAccessControl */
					message = TL['JS_RS_sessionDeniedByAC'];
					break;

				case 4: /* is being installed - ExpansionTriggered */
					message = TL['JS_RS_addOnInstalling'];
					break;

				case 5: /* installation failed -  ExpansionFailed*/
					message = TL['JS_RS_addOnInstallFailed'];
					
					tv.bubbleMessage.remove(TL['JS_RS_addOnInstalling']);
					break;

				case 6: /* installation timed out - ExpansionTimeout */
					message = TL['JS_RS_addOnInstallTimedout'];

					tv.bubbleMessage.remove(TL['JS_RS_addOnInstalling']);
					break;
				case 7: /* Erroneous screen grab configuration - ErroneousScreenGrabConfiguration */
					message = TL['JS_RS_erroneousScreenGrabConfiguration'];
					break;

				default:
					message = 'unknown message';
					tv.logger('tv.remoteControl: unknown message ID ' + String(data.msgTextType));
			}

			tv.bubbleMessage.show(type, message, timeout);
		}
		
	};

	/**
	*	Public interface
	*/
	return {
		remoteControlClicked: remoteControlClicked,
		showMessage: showMessage
	};
})(jQuery, window.ko, window.tv);