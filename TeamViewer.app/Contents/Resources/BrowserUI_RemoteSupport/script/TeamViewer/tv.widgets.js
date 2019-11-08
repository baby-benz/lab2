
tv.hideShowEventBinder = function (data, e) {
	var $target = $(e.currentTarget);

	var $header = $(e.currentTarget).closest('tr');
	var groupName = $target.attr('data-group');
	var $tbody = $('tbody.'+groupName);

	$tbody.toggleClass('tg-opened tg-closed');
	$header.toggleClass('tg-opened tg-closed');
};

/**
*	Handles the onmousedown event of a button/anchor
*/
tv.mousedown = function (eventObject) {
	$(eventObject.target).addClass('ui-state-active');
};

/**
*	Handles the onmousedown event of a button/anchor
*/
tv.mouseup = function (eventObject) {
	$(eventObject.target).removeClass('ui-state-active');
};

tv.stringFormat = function (msg) {

	var retvar = msg;
	$(arguments).each(function(i, item) {
		item = tv.htmlEncode(item);		
		if (i > 0) {
			if (msg.search(/\{0\}/g) >= 0) {
				retvar = retvar.replace('{' + (i - 1) + '}', item);
			} else {
				retvar = retvar.replace('{' + i + '}', item);
			}
		}
	});
	return retvar;
};

tv.dialog = (function($, tv, TL) {

	/* Constants */
	var YESNO = 'yesNo';
	var MESSAGE = 'message';
	var DESTROY = 'destroy';
	var BODY = 'body';
	var WIDGET_OVERLAY_SELECTOR = '.ui-widget-overlay';
	var TRANSPARENT_CLASS = 'moreTransparent';
	var UIDIALOG = 'uiDialog';	


	var that = this;

	var defaultClose = function() {
		//this is the dialog content div
		$(this).dialog(DESTROY);
		$(this).remove();
	};

	var isSubDialog = function() {
		return ($('body').find(WIDGET_OVERLAY_SELECTOR).length > 0);
	};

	var defaultOptions = {
		autoOpen: false,
		width: 500,
		minWidth: 400,
		minHeight: 200,
		resizable: false,
		closeOnEscape: false,
		modal: true,
		draggable: false,
		ajaxError: null
	};

	var addOverlayBehaviour = function(diaOptions) {

		if (isSubDialog()) {
			var originalCloseHandler = diaOptions.close || function() {
			};
			var originalOpenHandler = diaOptions.open || function() {
			};

			diaOptions.open = function() {
				originalOpenHandler.call(this);
				$(WIDGET_OVERLAY_SELECTOR).addClass(TRANSPARENT_CLASS);
			};

			diaOptions.close = function() {
				originalCloseHandler.call(this);
				if ($(WIDGET_OVERLAY_SELECTOR).length <= 1) {
					$(WIDGET_OVERLAY_SELECTOR).removeClass(TRANSPARENT_CLASS);
				}
			};
		}
	};

	var defaultAfterOpen = function() {
		var dialog = this;
		if (!dialog.options.preventOverlayClose) {
			$(WIDGET_OVERLAY_SELECTOR).click(function() {
				dialog.close();
			});
		}
	};


	var addDefaultOpen = function(dOptions, $dDiv) {

		var originalOpen = dOptions.open;
		dOptions.open = function() {
			var dObj = $dDiv.data(UIDIALOG);
			if (typeof originalOpen === 'function') {
				originalOpen.apply(this, arguments);
			}
			if (dOptions.valOptions) {
				$dDiv.find('form').validate(dOptions.valOptions);
			}

			defaultAfterOpen.call(dObj);
			if (typeof dOptions.afterOpen === 'function') {
				dOptions.afterOpen.call(dObj);
			}
		};
	};


	var openMessageDialog = function(options) {
		var title = options.title || TL.JS_RS_Message;
		var buttonName = options.buttonName || TL.JS_RS_ok;

		var dialogOptions = {
			modal: true,
			closeOnEscape: false,
			draggable: false,
			close: function() {
				if (typeof options.callback === 'function') {
					options.callback.call(this, options);
				}
				$dialog.remove();
			},
			title: title,
			buttons: [
				{
					html: buttonName,
					click: function() {
						$(this).dialog('close');
					},
					'class': 'right EnterKey'
				}
			],
			dialogClass: 'msgDialog',
			resizable: false
		};

		var dOptions = $.extend(true, dialogOptions, options);


		var $dialog = $('<div>').html(options.msg);

		addDefaultOpen(dOptions, $dialog);
		addOverlayBehaviour(dOptions);

		$dialog.dialog(dOptions);
	};


	var openYesNoDialog = function(options) {
		var $dialog = options.element;
		var finalOptions = {};
		var yesNoDefaultOptions = {
			title: TL.JS_RS_pleaseConfirm,
			width: 400,
			height: 220,
			closeOnEscape: false,
			modal: true,
			autoOpen: true,
			draggable: false,
			buttons: [
				{
					html: options.noText || TL.JS_RS_no,
					click: function() {
						if (options.noCallback) {
							options.noCallback.apply(this, arguments);
						}
						$dialog.dialog('close');
					},
					'class': 'right onlyTextDialogButton EscapeKey'
				},
				{
					html: options.yesText || TL.JS_RS_yes,
					click: function() {
						if (options.yesCallback) {
							options.yesCallback.apply(this, arguments);
						}
						$dialog.dialog('close');
					},
					'class': 'right EnterKey'
				}
			],
			dialogClass: 'yesNoDialog',
			resizable: false
		};

		$.extend(true, finalOptions, defaultOptions);
		$.extend(true, finalOptions, yesNoDefaultOptions);
		$.extend(true, finalOptions, options);

		$dialog.html(options.msg);

		addOverlayBehaviour(finalOptions);
		addDefaultOpen(finalOptions, $dialog);
		$dialog.dialog(finalOptions);
	};

	var addVTabs = function(dOptions) {
		if (dOptions.vTabs) {
			//var opt = typeof dOptions.vTabs === "object" ? dOptions.vTabs : null;
			var $element = $("ul.vTabsContainer", dOptions.element);
			$element.tabs('.vTabPanels > div.vTabContent');
			dOptions.dialogClass = dOptions.dialogClass ? dOptions.dialogClass + ' vTabsDialog' : 'vTabsDialog';
		}
	};

	var getEmptyContainerDiv = function(options) {
		//this uid is used to identify elements and dialogs
		var $dDiv = $('<div>');
		$dDiv.addClass('tv_dialog');
		return $dDiv;
	};

	var runPreBuild = function(dOptions) {
		if (typeof dOptions.preBuild === 'function') {
			dOptions.preBuild(dOptions);
		}
	};


	var getDataFromUrl = function(dOptions) {

		var defaultSuccess = function(data) {
			dOptions.payload = data;
		};

		$.ajax({
			async: false,
			url: dOptions.dataUrl,
			data: dOptions.payload,
			type: 'POST',
			dataType: 'json',
			success: typeof dOptions.dataSuccess === 'function' ? function(data) { dOptions.dataSuccess(data, dOptions); } : defaultSuccess,
			error: typeof dOptions.dataError === 'function' ? dOptions.dataError : null
		});
	};

	var openHtmlDialog = function(options) {

		var $dDiv = options.element;

		var originalAutoOpen = true;
		//i need this because i don't want jQuery Ui to open the dialog directly
		if (options.autoOpen === false) {
			originalAutoOpen = false;
		}
		delete options.autoOpen;

		//copy default dialogOptions and merge it with the options
		var dOptions = {};
		$.extend(true, dOptions, defaultOptions, options);

		addOverlayBehaviour(dOptions, $dDiv);
		addDefaultOpen(dOptions, $dDiv);

		if (dOptions.dataUrl) {

			// dataUrl can be a function. In this case we call the function to evaluate the URL.
			if (typeof dOptions.dataUrl === 'function') {
				dOptions.dataUrl = dOptions.dataUrl(dOptions);
			}

			// In case no URL was returned from the callback, we dont make an ajax call.
			if (dOptions.dataUrl) {
				getDataFromUrl(dOptions);
			}
		}
		if (typeof dOptions.content === 'function') {
			dOptions.content = dOptions.content(dOptions);
		}

		if (!dOptions.content) {
			return;
		}

		$dDiv.html(dOptions.content);
		dOptions.$dDiv = $dDiv;

		addVTabs(dOptions);

		runPreBuild(dOptions);
		$dDiv.dialog(dOptions);
		//$dDiv.on('dialogclose', tv.route.resetRoute);
		var dObj = $dDiv.data(UIDIALOG);

		//events ausführen/binden
		$dDiv.bind('dialogclose', defaultClose);

		if (originalAutoOpen !== false) {
			dObj.open();
		}

		return $dDiv;
	};


	var open = function(options, payload) {
		var optionsClone = {};
		$.extend(true, optionsClone, options);
		optionsClone.payload = payload;
		optionsClone.element = getEmptyContainerDiv.call(that, optionsClone);
		switch (optionsClone.dialogType) {
		case MESSAGE:
			openMessageDialog.call(that, optionsClone);
			break;
		case YESNO:
			openYesNoDialog.call(that, optionsClone);
			break;
		default:
			openHtmlDialog.call(that, optionsClone);
			break;
		}
		return $(optionsClone.element);
	};

	/**
	*	Quick opens a messgae dialog.
	*/
	var message = function (text, title) {		
		open({
			dialogType: MESSAGE,
			msg: text,
			title: title || TL.JS_RS_message
		});
	};

	/**
	*	Public interface
	*/
	return {
		open: open,
		message: message
	};
})(jQuery, tv, window.TL);