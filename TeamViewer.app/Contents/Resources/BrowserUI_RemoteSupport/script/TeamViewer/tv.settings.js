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
*	Encapsulates all the functionality in the "Settings" tab.
*/
tv.settings = (function ($, ko, tv, PF) {

	var settings = new (function () {

		/* When VM has computed observables, we need a different approach because of the use of "this" */
		var self = this;

		self.wlanSettings = new ko.observableArray();
		self.hasSettings = new ko.computed(function () {
			return self.wlanSettings().length > 0;
		});
	})();

	var $table;
	var model;

	/* small hack. We have to keep a global reference to the edited wlan
	 * if we receive a wifi related error, we will use it
	  */
	var editedWlanSid = "";


	var setUpMenus = function () {

		/* Check if the device supports importing a mobile config file. */
		if (PF.Settings.MobileConfiguration) {

			/* Bind the click to the button */
			$('#btnImportIOS').click(importIosConfig);
		}
		else {

			/* Remove the button import ios config */
			$('#btnImportIOS').remove();
		}
	};

	var setUpTable = function () {
		$table = $('#settingsTable');
		renderTable(settings);
	};

	var renderTable = function (data) {
		tv.logger(data, 'Render Table');
		ko.applyBindings(data, $table[0]);
	};

	var init = function () {
		setUpMenus();
		setUpTable();
	};

	tv.enums = {};

	tv.enums.MMC = {
		MMC_EMAILAUTH_NONE: 30,
		MMC_EMAILAUTH_PASSWORD: 31,
		MMC_EMAILAUTH_CRAMMD5: 32,
		MMC_EMAILAUTH_NTLM: 33,
		MMC_EMAILAUTH_HTTPMD5: 34,

		MMC_POP: 50,
		MMC_IMAP: 51,

		MMC_GET_MAIL_CONFIGURATIONS: 101,
		MMC_ADD_MAIL_CONFIGURATION: 102,
		MMC_CHANGE_MAIL_CONFIGURATION: 103,
		MMC_REMOVE_MAIL_CONFIGURATION: 104
	};

	tv.enums.MEC = {
		MEC_GET_EXCHANGE_CONFIGURATIONS: 101,
		MEC_ADD_EXCHANGE_CONFIGURATION: 102,
		MEC_CHANGE_EXCHANGE_CONFIGURATION: 103,
		MEC_REMOVE_EXCHANGE_CONFIGURATION: 104
	};

	tv.enums.MWC = {
		// values for encryptions
		MWC_ANY: 20,
		MWC_OPEN: 21,
		MWC_WEP: 22,
		MWC_WPA_WPA2_PSK: 23,
		// functions
		MWC_GET_WIFI_CONFIGURATIONS: 101,
		MWC_ADD_WIFI_CONFIGURATION: 102,
		MWC_CHANGE_WIFI_CONFIGURATION: 103,
		MWC_REMOVE_WIFI_CONFIGURATION: 104
	};

	var wlanModel = function (wlanId) {
		var that = this;

		if (wlanId) {

			that.command = tv.enums.MWC.MWC_CHANGE_WIFI_CONFIGURATION;

			/* Search for the model	*/
			$.each(settings.wlanSettings(), function (k, v) {

				if (v.MWC_IDENTIFIER == wlanId) {
					that.model = {};

					for (var b in v) {
						that.model[b] = ko.observable(v[b]);

						/* Check for the presence of encryption type in the data sent by the device. 
						   This is needed for making this feature backwards-compatible.
						 */
						if (b === 'MWC_ENCRYPTION_TYPE') {
							that.model.MWC_ENCRYPTION_TYPE_PRESENT = true;
						}
					}

					/* Despite no password is sent by the device we need a field to bind to  */
					if (PF.Settings.WifiConfiguration.MWC_PASSWORD && typeof that.model.MWC_PASSWORD === 'undefined') {
						that.model.MWC_PASSWORD = ko.observable();
					}

					/* Despite no encryption type is sent by the device we need a field to bind to  */
					if (PF.Settings.WifiConfiguration.MWC_ENCRYPTION_TYPE){
						if (typeof that.model.MWC_ENCRYPTION_TYPE === 'undefined' || that.model.MWC_ENCRYPTION_TYPE() === tv.enums.MWC.MWC_ANY) {
							that.model.MWC_ENCRYPTION_TYPE = ko.observable(tv.enums.MWC.MWC_OPEN);
						}
					}					

					return false;
				}
			});

			if (!that.model) {
				throw ('Wlan with Id Not found');
			}
		}
		else {

			that.command = tv.enums.MWC.MWC_ADD_WIFI_CONFIGURATION;

			that.model = {};

			/* Only create in the model the members supported by the device (PF) */
			if (PF.Settings.WifiConfiguration.MWC_SSID) {
				that.model.MWC_SSID = ko.observable(); //!< (String) ssid of the wifi network
			}

			if (PF.Settings.WifiConfiguration.MWC_ENCRYPTION_TYPE) {
				that.model.MWC_ENCRYPTION_TYPE = ko.observable(tv.enums.MWC.MWC_OPEN); //!< (int) EncryptionType (example: MWC_OPEN or MWC_WEP)
			}

			if (PF.Settings.WifiConfiguration.MWC_PASSWORD) {
				that.model.MWC_PASSWORD = ko.observable(); //!< (String) the password
			}

			if (PF.Settings.WifiConfiguration.MWC_IDENTIFIER) {
				that.model.MWC_IDENTIFIER = ko.observable(); //!< (String) unique identifier of the configuration
			}
		}

		/* Only show the encription types supported by the device (PF) */
		that.securityTypes = [];

		/* Boolean computed flag that tells the UI if password is mandatory */
		that.model.needsPassword = ko.computed(function () {
			return that.model.MWC_ENCRYPTION_TYPE() !== tv.enums.MWC.MWC_OPEN;
		});

		/* We subscribe to this computed */
		that.model.needsPassword.subscribe(function (passwordNeeded) {			

			/* If no password is needed, clean the password field */
			if (!passwordNeeded) {
				that.model.MWC_PASSWORD('');
			}
		});

		/* Flag to tell if we might show or not the plain password */
		that.model.showPassword = ko.observable(false);

		/* Flag for implememting custom placeholder  */
		that.model.needsPlaceholder = ko.observable(that.model.MWC_ENCRYPTION_TYPE_PRESENT && that.model.needsPassword() && that.command === tv.enums.MWC.MWC_CHANGE_WIFI_CONFIGURATION);

		/* Event binder (click) for the fake placeholder */
		that.placeholderClicked = function () {
			/* Remove me */
			that.model.needsPlaceholder(false);

			/* Focus the element that is visible */
			$('.wlanPasswordToggle:visible input').focus();
		};

		/* Event binder (focus) for the fake placeholder */
		that.handleFocus = function () {
			/* Remove Placeholder */
			that.model.needsPlaceholder(false);
		};

		if (PF.Settings.WifiConfiguration.MWC_OPEN) {
			that.securityTypes.push({ value: tv.enums.MWC.MWC_OPEN, text: TL.JS_RS_wlanSec_open });
		}

		if (PF.Settings.WifiConfiguration.MWC_WEP) {
			that.securityTypes.push({ value: tv.enums.MWC.MWC_WEP, text: TL.JS_RS_wlanSec_wep });
		}

		if (PF.Settings.WifiConfiguration.MWC_WPA_WPA2_PSK) {
			that.securityTypes.push({ value: tv.enums.MWC.MWC_WPA_WPA2_PSK, text: TL.JS_RS_wlanSec_wpaWpa2Psk });
		}
	};

	var exChangeModel = function (exchangeId) {
		var that = this;

		that.model = {};

		/* Only create in the model the members supported by the device (PF) */
		if (PF.Settings.ExchangeConfiguration.MEC_EMAILADDRESS) {
			that.model.MEC_EMAILADDRESS = ko.observable(); //(String)  full email adress of the account
		}

		if (PF.Settings.ExchangeConfiguration.MEC_HOSTADDRESS) {
			that.model.MEC_HOSTADDRESS = ko.observable(); //(String)  ExchangeServer adress
		}

		if (PF.Settings.ExchangeConfiguration.MEC_USERNAME) {
			that.model.MEC_USERNAME = ko.observable(); //(String)  username of the exchange account
		}

		if (PF.Settings.ExchangeConfiguration.MEC_USERPW) {
			that.model.MEC_USERPW = ko.observable(); //(String)  password for the user
		}

		if (PF.Settings.ExchangeConfiguration.MEC_USESSL) {
			that.model.MEC_USESSL = ko.observable(); //(Boolean) use ssl
		}

		if (PF.Settings.ExchangeConfiguration.MEC_DOMAIN) {
			that.model.MEC_DOMAIN = ko.observable(); //(String)  Domainname
		}

		that.command = tv.enums.MEC.MEC_ADD_EXCHANGE_CONFIGURATION;
	};

	var emailModel = function (emailId) {
		var that = this;

		that.model = {};

		/* Only create in the model the members supported by the device (PF) */
		if (PF.Settings.MailConfiguration.MMC_ACCOUNT_TYPE) {
			that.model.MMC_ACCOUNT_TYPE = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_ADDRESS) {
			that.model.MMC_ADDRESS = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_ACCOUNT_NAME) {
			that.model.MMC_ACCOUNT_NAME = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_IN_AUTH) {
			that.model.MMC_IN_AUTH = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_IN_HOSTNAME) {
			that.model.MMC_IN_HOSTNAME = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_IN_USERNAME) {
			that.model.MMC_IN_USERNAME = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_IN_USERPW) {
			that.model.MMC_IN_USERPW = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_IN_PORT) {
			that.model.MMC_IN_PORT = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_IN_USESSL) {
			that.model.MMC_IN_USESSL = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_OUT_AUTH) {
			that.model.MMC_OUT_AUTH = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_OUT_HOSTNAME) {
			that.model.MMC_OUT_HOSTNAME = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_OUT_USERNAME) {
			that.model.MMC_OUT_USERNAME = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_OUT_USERPW) {
			that.model.MMC_OUT_USERPW = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_OUT_PORT) {
			that.model.MMC_OUT_PORT = ko.observable();
		}

		if (PF.Settings.MailConfiguration.MMC_OUT_USESSL) {
			that.model.MMC_OUT_USESSL = ko.observable();
		}

		that.model.MMC_OUT_SAMEPW = ko.computed(function () {
			return that.model.MMC_OUT_USERPW() === that.model.MMC_IN_USERPW();
		});

		that.command = emailId ? tv.enums.MMC.MMC_CHANGE_MAIL_CONFIGURATION : tv.enums.MMC.MMC_ADD_MAIL_CONFIGURATION;

		that.simpleSsl = ko.computed({
			read: function () {
				return that.model.MMC_OUT_USESSL() || that.model.MMC_IN_USESSL();
			},
			write: function (v) {
				that.model.MMC_OUT_USESSL(v);
				that.model.MMC_IN_USESSL(v);
			}
		});

		that.simpleUsername = ko.computed({
			read: function () {
				return that.model.MMC_OUT_USERNAME() || that.model.MMC_IN_USERNAME();
			},
			write: function (v) {
				that.model.MMC_IN_USERNAME(v);
				that.model.MMC_OUT_USERNAME(v);
			}
		});

		that.simplePassword = ko.computed({
			read: function () {
				return that.model.MMC_OUT_USERPW() || that.model.MMC_IN_USERPW();
			},
			write: function (v) {
				that.model.MMC_OUT_USERPW(v);
				that.model.MMC_IN_USERPW(v);
			}
		});

		that.accountTypes = [];
		if (PF.Settings.MailConfiguration.MMC_POP) {
			that.accountTypes.push({ value: tv.enums.MMC.MMC_POP, text: TL.JS_RS_emailTypes_pop });
		}
		if (PF.Settings.MailConfiguration.MMC_IMAP) {
			that.accountTypes.push({ value: tv.enums.MMC.MMC_IMAP, text: TL.JS_RS_emailTypes_imap });
		}

		that.identifyTypes = [];
		if (PF.Settings.MailConfiguration.MMC_EMAILAUTH_NONE) {
			that.identifyTypes.push({ value: tv.enums.MMC.MMC_EMAILAUTH_NONE, text: TL.JS_RS_emailAuthTypes_none });
		}
		if (PF.Settings.MailConfiguration.MMC_EMAILAUTH_PASSWORD) {
			that.identifyTypes.push({ value: tv.enums.MMC.MMC_EMAILAUTH_PASSWORD, text: TL.JS_RS_emailAuthTypes_password });
		}
		if (PF.Settings.MailConfiguration.MMC_EMAILAUTH_CRAMMD5) {
			that.identifyTypes.push({ value: tv.enums.MMC.MMC_EMAILAUTH_CRAMMD5, text: TL.JS_RS_emailAuthTypes_crammd5 });
		}
		if (PF.Settings.MailConfiguration.MMC_EMAILAUTH_NTLM) {
			that.identifyTypes.push({ value: tv.enums.MMC.MMC_EMAILAUTH_NTLM, text: TL.JS_RS_emailAuthTypes_ntlm });
		}
		if (PF.Settings.MailConfiguration.MMC_EMAILAUTH_HTTPMD5) {
			that.identifyTypes.push({ value: tv.enums.MMC.MMC_EMAILAUTH_HTTPMD5, text: TL.JS_RS_emailAuthTypes_httpMd5 });
		}
	};

	var importIosConfigModel = function () {
		var lock;
		var that = this;
		that.model = {};
		that.model.IOSCONFIG_URL = ko.observable();
		that.model.IOSCONFIG_FILE = ko.observable();

		/* Possible values: 'browse', 'download' */
		that.model.fileMode = ko.observable('browse');
		that.model.downloadUrl = 'http://www.teamviewer.com/link/?url=' + (window.isIE ? '576592' : '607334');

		that.fn = {};
		that.fn.chooseFile = function () {
			if (lock || that.model.fileMode() !== 'browse') {
				return;
			}

			lock = true;

			$.ajax({
				url: 'module/settings/pickconfigfile.cmd',
				data: { extension: 'mobileconfig' },
				type: 'GET',
				dataType: 'json',
				timeout: 360000, //increase timeout to 6 minutes
				complete: function () { lock = false; },
				success: function (data) {
					if (data.result === 'Success') {
						that.model.IOSCONFIG_FILE(data.content);
						tv.logger('Received config filepath: ' + that.model.IOSCONFIG_FILE());
					} else {
						tv.logger('Received no valid config filepath');
					}
				}
			});
		};

		that.fn.displayFilename = ko.computed(function () {
			var retvar = '';
			var text = that.model.IOSCONFIG_FILE();
			if (text) {
				text = text.split('\\');
				retvar = text[text.length - 1];
			}
			return retvar;
		});

		that.fn.downloadTool = function () {
			tv.chat.openUrl(that.model.downloadUrl);
		};
	};


	var importIosConfig = function () {
		tv.dialog.open(tv.dialogs.importConfigIos, new importIosConfigModel());
	};

	var addWlan = function () {
		tv.dialog.open(tv.dialogs.wlan, new wlanModel());
	};

	var editWlan = function (target) {
		var wlanId = $(target).attr('data-wlan-id');

		
		if (wlanId) {
			tv.logger('edit wlan: ' + wlanId);

			// search the wifi 
			$.each(settings.wlanSettings(), function(k, wifiModel) {
				if (wifiModel.MWC_IDENTIFIER == wlanId) {
					editedWlanSid = wifiModel.MWC_SSID;
				}
			});
				
			tv.dialog.open(tv.dialogs.wlan, new wlanModel(wlanId));
		} else {
			editedWlanSid = "";

			tv.logger('wlanId not found');
		}

	};

	var addEmail = function () {
		tv.dialog.open(tv.dialogs.email, new emailModel());
	};

	var addExchange = function () {
		tv.dialog.open(tv.dialogs.exchange, new exChangeModel());
	};

	var requestWlanData = function () {
		$.ajax({
			url: 'module/settings/requestwlanconfigs.cmd',
			dataType: 'tvResult'
		});
	};

	var requestEmailData = function () {
		$.ajax({
			url: 'module/settings/requestemailconfigs.cmd',
			dataType: 'tvResult'
		});
	};

	var requestExchangeData = function () {
		$.ajax({
			url: 'module/settings/requestexchangeconfigs.cmd',
			dataType: 'tvResult'
		});
	};

	var getWlanData = function () {

		$.ajax({
			url: 'module/settings/getwlanconfigs.cmd',
			dataType: 'tvResult',
			success: function (data) {

				tv.logger(data, 'tv.settings.getWlanData(' + data + ')');

				if (data) {
					settings.wlanSettings(data);
				}
			}
		});
	};

	var getEmailData = function () {
		tv.logger('getEmailData() not yet implemented');
	};

	var getExchangeData = function () {
		tv.logger('getExchangeData() not yet implemented');
	};

	/* Public interface */
	return {
		tableModel: model,
		editWlan: editWlan,
		addWlan: addWlan,
		addEmail: addEmail,
		addExchange: addExchange,

		/* Ensure the TV client cant call any callback here is no PF flag was set */
		requestWlanData: (PF.Settings && PF.Settings.WifiConfiguration && !!PF.Settings.WifiConfiguration.MWC_GET_WIFI_CONFIGURATIONS) ? requestWlanData : $.noop,
		getWlanData: (PF.Settings && PF.Settings.WifiConfiguration && !!PF.Settings.WifiConfiguration.MWC_GET_WIFI_CONFIGURATIONS) ? getWlanData : $.noop,

		requestEmailData: (PF.Settings && PF.Settings.MailConfiguration && !!PF.Settings.MailConfiguration.MMC_GET_MAIL_CONFIGURATIONS) ? requestEmailData : $.noop,
		getEmailData: (PF.Settings && PF.Settings.MailConfiguration && !!PF.Settings.MailConfiguration.MMC_GET_MAIL_CONFIGURATIONS) ? getEmailData : $.noop,

		requestExchangeData: (PF.Settings && PF.Settings.ExchangeConfiguration && !!PF.Settings.ExchangeConfiguration.MEC_GET_EXCHANGE_CONFIGURATIONS) ? requestExchangeData : $.noop,
		getExchangeData: (PF.Settings && PF.Settings.ExchangeConfiguration && !!PF.Settings.ExchangeConfiguration.MEC_GET_EXCHANGE_CONFIGURATIONS) ? getExchangeData : $.noop,

		init: (!!PF.Settings) ? init : $.noop,

		showMessage: function (jSonStringifiedData) {
			var data = null;
			try {
				data = $.parseJSON(jSonStringifiedData);
			} catch (e) {
				tv.logger("tv.settings.showMessage error parsing JSON string");
			}

			if (data) {
				var message = '';
				var timeout = data.timeout || 20 * 1000;
				var type = data.msgType || 0;

				switch (data.msgTextType) {
					case 0: /* config file is empty */
						message = TL['JS_RS_cfgFileEmpty'];
						break;

					case 1: /* config file is invalid */
						message = TL['JS_RS_cfgFileInvalid'];
						break;

					case 2: /* active wifi cannot be deleted */
						message = tv.stringFormat.apply(this, [TL['JS_RS_wifiInUse'], editedWlanSid]);
						break;

					case 3: /* wifi will not be added. Password is too short. */
						message = TL['JS_RS_wifiShortPassword'];
						break;

					default:
						message = 'unknown message';
						tv.logger('tv.setting: unknown message ID ' + String(data.msgTextType));
				}

				tv.bubbleMessage.show(type, message, timeout);
			}
		}
	};
})(jQuery, window.ko, window.tv, window.PF);