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
*	Encapsulates all the functionality for the Chat.
*/
tv.chat = (function ($, ko, tv, TL) {
	var MSG_TYPE_REGULAR = 0;
	var MSG_TYPE_INFO = 1;
	var MSG_TYPE_GUI = 2;

	/* This will hold the template for chat element that launches URL */
	var urlContainer = $('<div><a class="urlLauncher" href="#"></a></div>');
	var urlLauncher = urlContainer.find('a');
	var urlFindRegex = /(https?:\/\/){0,1}[a-z]([a-z\d]|-(?![-.])|\.(?![-.]))*\.[a-z]{2,5}/gi;

	/* Define the chat view model */
	var viewModel = {
		currentMessage: ko.observable(''),

		getTemplateToUse: function (msgVM) {
			var template = '';

			switch (msgVM.type) {
				case MSG_TYPE_REGULAR:
				case MSG_TYPE_GUI:
					template = 'chatTemplate';
					break;

				case MSG_TYPE_INFO:
					template = 'chatTemplateInfo';
					break;

				default:
					template = 'chatTemplate';
			}

			return template;
		},

		sendPressed: function (viewModel, eventObj) {
			// The send button must handle keypress in the following way:
			// ENTER/SPACE:	send chat message, focus message input field		

			if (eventObj.type === 'keypress') {
				if (eventObj.which === 13 || eventObj.which === 32) {
					postMessage();
				}
			} else {
				postMessage();
			}

			$inputControl.focus();
		},

		nudgeClicked: function () {
			$.ajax({
				url: 'module/nudge/sendnudge.cmd',
				dataType: 'tvResult',
				success: function () {
					// push the NudgeSent message
					displayMessage({ message: TL.JS_RS_nudgeSent, sender: '' }, true, MSG_TYPE_INFO);
				}
			});
		},

		copyToClipboardClicked: function () {
			tv.dialog.open(tv.dialogs.clipboard);
		},

		// The chat message text must handle keypress in the following way:
		// ENTER:	send chat message		
		// TAB:		default onblur
		// SHIFT + ENTER:	new line
		msgKeyPressed: function (viewModel, eventObj) {

			/* Delete the chat message footer as soon as the user starts typing. */
			viewModel.hasFooter(false);

			/* Send the chat message if the enter key was pressed. */
			if (eventObj.which === 13 && !eventObj.shiftKey) {
				postMessage();
				return false;
			}

			return true;
		},

		/* Array of messages that will be displayed in the UI */
		messages: new ko.observableArray([]),

		/* Chat footer. Fixed text, independant from the main mesages array */
		footer: {
			chatMsgInfo: '',
			content: TL.JS_RS_chat_instructions,
			isLocal: true,
			showTail: true
		},

		/* This will show/hide the chat footer. */
		hasFooter: ko.observable(window.PF.Chat)
	};

	/**
	*	Generates a url launcher based on a url text.
	*/
	var generateUrlLauncher = function (url) {

		/* Push the url into the element template */
		urlLauncher.attr('data-url', url).text(url);

		/* Return the HTML markup for the template */
		return urlContainer.html();
	};

	/**
	*	Searches for URLs in text and converts them into clickable "links".
	*/
	var urlizeText = function (chatText) {

		var encodedText;

		/* Just like preparing food for a baby we need to make HTML "puree" because IE cannot process line breaks and whitespaces. */
		if (window.isIE) {
			var lines = chatText.split('\n');

			for (var i = 0; i < lines.length; i++) {

				if (lines[i] !== '') {
					/* HTML encode the text. Do not allow any dirty hacking attempt */
					lines[i] = tv.htmlEncode(lines[i]);
				}
			}

			encodedText = lines.join('<br/>');
		}
		else {
			/* We just need to HTML encode the text. */
			encodedText = tv.htmlEncode(chatText);
		}

		/* Find and replace the URL occurrences by a custom <a> tag. */
		var words = encodedText.split(' ');

		var wordsWithUrls = $.map(words, function (val, idx) {
			if (val.match(urlFindRegex)) {
				return generateUrlLauncher(tv.htmlDecode(val));
			}

			return val;
		});

		/* Return the converted text */
		return wordsWithUrls.join(' ');
	};


	var createMessage = function (messageData, local, showTail, type) {
		return {
			chatMsgInfo: (local ? '' : messageData.sender + ' ') + tv.createNowString(),
			content: urlizeText(messageData.message),
			isLocal: local,
			showTail: ko.observable(showTail),
			type: type
		};
	};

	var $messagesContainer,
		$inputControl,
		scrollBarInitialized;

	var displayMessage = function (messageData, fromLocal, msgType) {

		if (fromLocal) {
			viewModel.hasFooter(false);
		}

		/* Update the 'showTail' ofservable in the last displayed message */
		var count = viewModel.messages().length;
		if (count > 0) {
			var prevLast = viewModel.messages()[count - 1];
			prevLast.showTail(prevLast.isLocal !== fromLocal || msgType === MSG_TYPE_INFO || prevLast.type === MSG_TYPE_GUI);
		}

		/* 	Hide the chat message footer is the number of messages reaches 2.
			The message count is compared to 1 because we push the message later in the array */
		if (count == 1) {
			viewModel.hasFooter(false);
		}

		/* Push the new message in the observable array */
		viewModel.messages.push(createMessage(messageData, fromLocal, true, msgType));

		createScrollbar();

		//Scroll down... only command no initialization
		if (scrollBarInitialized) {
			/*just scroll to the bottom. 5000 should be enough. 
			we tried to get the height of the last item but it is not easy to get the corret scroll size*/
			$messagesContainer.slimScroll({ scrollBy: 5000 });
		}
	};

	var createScrollbar = function () {

		var scroll = $messagesContainer.outerHeight(true) - $messagesContainer.parent().height();
		if (!scrollBarInitialized && scroll > 0) {
			$messagesContainer.slimScroll({
				start: 'bottom',
				height: ($messagesContainer.parent().height())
			});
			scrollBarInitialized = true;
		}
	};

	var timeoutResize;



	var sendMessage = function (message) {
		$.ajax({
			url: 'module/chat/sendchatmessage.cmd',
			type: 'POST',
			data: message,
			contentType: 'text/plain',
			dataType: 'tvResult'
		});
	};

	var postMessage = function () {

		var message = $.trim(viewModel.currentMessage());

		if (message !== '') {
			sendMessage(message);
			displayMessage({ message: message || message, sender: TL.JS_RS_chat_you }, true, MSG_TYPE_REGULAR);
		}

		viewModel.currentMessage('');
	};

	var getMessages = function () {
		$.ajax({
			url: 'module/chat/getchatmessages.cmd',
			dataType: 'tvResult',
			success: function (data) {
				if (typeof data !== 'undefined') {
					for (var i = 0; i < data.length; i++) {
						displayMessage(data[i], false, MSG_TYPE_REGULAR);
					}
				}
			}
		});
	};

	/**
	*	Callback for the TV host. It is called when the client knows that the chat module is started by the remote device.
	*/
	var started = function (sender) {
		displayMessage({ message: TL.JS_RS_chat_initial_message, sender: '' }, false, MSG_TYPE_GUI);
	};

	/**
	*	Invokes TV for opening a URL in the default user's browser.
	*/
	var openUrl = function (url) {

		/* Cure the URL so it doesnt break the Windows-Client */
		url = url.toLowerCase();

		if (!(url.indexOf('https://') === 0 || url.indexOf('http://') === 0)) {
			url = 'http://' + url;
		}

		tv.logger('OpenURL: ' + url);

		/* Invoke TV, fire and forget */
		$.ajax({
			url: 'module/chat/openchaturl.cmd',
			type: 'POST',
			contentType: 'text/plain',
			dataType: 'tvResult',
			data: url
		});
	};

	/**
	*	Public interface
	*/
	return {
		textCopied: function () {
			displayMessage({ message: TL.JS_RS_textCopied, sender: '' }, true, MSG_TYPE_INFO);
		},
		screenshotRequested: function () {
			displayMessage({ message: TL.JS_RS_screenshotRequested, sender: '' }, true, MSG_TYPE_INFO);
		},

		postMessage: (!!PF.Chat) ? postMessage : $.noop,
		displayMessage: (!!PF.Chat) ? displayMessage : $.noop,
		getMessages: (!!PF.Chat) ? getMessages : $.noop,
		started: (!!PF.Chat) ? started : $.noop,
		openUrl: (!!PF.Chat) ? openUrl : $.noop,
		bind: function (htmlElement) {
			ko.applyBindings(viewModel, htmlElement);

			$messagesContainer = $(htmlElement).find('.messagesList');
			$inputControl = $(htmlElement).find('textarea');

			/* Chat bubble. Process the click event of the URL placeholders */
			$messagesContainer.on('click', '.urlLauncher', function (e) {
				e.preventDefault();
				openUrl($(this).attr('data-url'));
			});

			$(window).on('resize', function () {
				if (timeoutResize) {
					clearTimeout(timeoutResize);
				}
				timeoutResize = setTimeout(function () {
					if (scrollBarInitialized) {
						$messagesContainer.slimScroll({ destroy: true });
						$messagesContainer.css('height', 'auto');
						scrollBarInitialized = false;
					}

					createScrollbar();
				}, 100);
			});

			/* Bring the focus to the message box after page initialization */
			$inputControl.focus();
		}
	};
})(jQuery, window.ko, window.tv, window.TL);