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
*	Handles the updating and the parsing to ViewModels of the monitoring data.
*/
tv.monitoring = (function ($, ko, tv, PF, TL) {

	var currentValues = {};
	var refreshTimeout = 0;
	var tabsApi;
	var dashboardTabIndex;

	var getData = function () {
		$.ajax({
			url: 'module/monitoring/getmonitoringdata.cmd',
			dataType: 'tvResult',
			success: function (data) {
				if (data) {
					$.each(data, function (index, subArray) {
						if (subArray) {
							$.each(subArray, function (index, elementData) {								
								currentValues[elementData.monitor] = elementData;
							});
						}
					});

					/* Cancel any previous refresh fired */
					clearTimeout(refreshTimeout);

					/* Fire a new UI refresh in 150 ms */
					refreshTimeout = setTimeout(function () {
						refreshDashboard();
					}, 150);
				}
			}
		});
	};

	var refreshDashboard = function () {

		/* Don't refresh the Dashboard if we are not there */
		if (tabsApi.getIndex() !== dashboardTabIndex) {
			return;
		}

		$.each(currentValues, function (name) {

			var currentVal = currentValues[name];

			switch (currentVal.monitor) {
				case 1001: /* CPU usage per core */
					if (typeof currentVal.value === 'number') {
						cpuVM.cores([currentVal.value]);
					}
					else {
						cpuVM.cores(currentVal.value);
					}
					break;
				case 1002: /* CPU frequency */
					if (typeof currentVal.value === 'number') {
						cpuVM.frequency([currentVal.value]);
					}
					else {
						cpuVM.frequency(currentVal.value);
					}
					break;
				case 2001: /* Battery load */
					battVM.load(currentVal.value);
					break;
				case 2002: /* Battery state 1-charging 0-discharging */
					battVM.state(currentVal.value);
					break;
				case 2003: /* Battery temperature */
					battVM.temperature(Math.floor(currentVal.value));
					break;
				case 3001: /* RAM Usage */
					ramVM.counters(currentVal.value);
					break;
				case 5001: /* Internal storage use */
					storageVM.internal(currentVal.value);
					break;
				case 5002: /* External storage use */
					storageVM.sd(currentVal.value);
					break;
				case 5003: /* External storage flag */
					storageVM.hasExternal(currentVal.value);
					break;
				case 4001: /* WLAN Enabled */
					wlanVM.isOn(currentVal.value);
					break;
				case 4002: /* WLAN IP */
					wlanVM.ip(currentVal.value);
					break;
				case 4003: /* WLAN SSID */
					wlanVM.ssid(currentVal.value);
					break;
				case 4004: /* WLAN MAC-Address */
					wlanVM.mac(currentVal.value);
					break;
				case 6001: /* Bluetooth enabled */
					wlanVM.bluetooth(currentVal.value);
					break;
			}
		});

	};

	/**
	*	Calculates the path to draw a circle with a radius and a base60 angle as main input.
	*
	*	@param {number} r			Outer-radius of the circle.
	*	@param {number} angle		Angle of the circle to be drawn.
	*	@param {number} lineWidth	Width of the line.
	*	@param {[number, number]}	pos	Upper coordinate of the circle. Optional.
	*/
	var calculatePathSVG = function (r, angle, lineWidth, pos) {

		if (angle > 360) {
			angle = 360;
		}

		var x = function () {
			return r * Math.sin(angle * Math.PI / 180);
		};

		var y = function () {
			if (angle > 180) {
				return -1 * (r * Math.cos(angle * Math.PI / 180) + r);
			}
			return r - (r * Math.cos(angle * Math.PI / 180));
		};

		if (typeof pos === 'undefined') {
			pos = [
				r + 1 + lineWidth / 2,	/* Initial x-coord */
				lineWidth / 2			/* Initial y-coord */
			];
		}

		var svgPath = [
			'M ' + pos[0] + ',' + pos[1]	/* Move to pos[0], pos[1] */
		];

		if (angle < 180) {
			svgPath.push('a' + r + ',' + r + ' 0 0 1 ' + x() + ',' + y()); /* Draw the arc */
		}

		if (angle >= 180) {

			svgPath.push('a' + r + ',' + r + ' 0 1 1 0,' + 2 * r);		/* Draw the first full half */
		}

		if (angle > 180) {

			svgPath.push('a' + r + ',' + r + ' 0 0 1 ' + (x() - 1) + ',' + y()); /* Draw the from bottom middle to up */
		}

		return svgPath.join(' ');
	};

	/* Colors for the meters */
	var colors = {
		green: '#87c80f',
		orange: '#e8bf00',
		red: '#c75050'
	};

	var average = function (numArray) {

		if (numArray && numArray.length > 0) {

			var total = 0;

			for (var i = 0; i < numArray.length; i++) {
				total += numArray[i];
			}

			return total / numArray.length;
		}

		return 0;
	};

	/* Contains the VM that will be used to render the CPU meter */
	var cpuVM = new (function () {

		var self = this;

		/* observables needed to update the gauges */
		self.meterValues = {
			usageStartAngle: ko.observable(-1),
			usageEndAngle: ko.observable(-1),
			availableStartAngle: ko.observable(0),
			availableEndAngle: ko.observable(360),

			svgPath: ko.observable('M0,0'),
			strokeColor: ko.observable('grey')
		};
		
		/* CPU usage per cores */
		self.cores = ko.observable([]);

		/* CPU frequency in Mhz per cores */
		self.frequency = ko.observable([]);

		/* CPU usage: 0-100 % */
		self.averageUsage = ko.computed(function() {
			return Math.floor(100 * average(self.cores()));
		});

		// update the gauges values when the value changes
		self.averageUsage.subscribe(function (newValue) {
			var angle = Math.round(3.6 * newValue);

			// enforce min/max values
			angle = Math.min(angle, 360);
			angle = Math.max(angle, -360);

			self.meterValues.usageEndAngle(angle);
			self.meterValues.availableEndAngle(360);

			if (angle < 180) {
				self.meterValues.availableStartAngle(0);
			}
			else {
				self.meterValues.availableStartAngle(angle);
			}

			self.meterValues.svgPath(calculatePathSVG(32, angle, 8));
			self.meterValues.strokeColor(color(newValue));
		});

		/* CPU average frequency in Mhz */
		self.averageMhz = ko.computed(function () {
			return average(self.frequency());
		});

		/* CPU average frequency in 2 decimals (Ghz) or integer (Mhz) */
		self.frequencyAvg = ko.computed(function () {
			var avg = self.averageMhz();
			return (avg >= 1000) ? (avg / 1000).toFixed(2) : Math.floor(avg);
		});

		/* Units used for the CPU fequency: Mhz, Ghz */
		self.frequencyUnit = ko.computed(function () {
			var avg = self.averageMhz();

			return (avg >= 1000) ? 'Ghz' : 'Mhz';
		});
	})();

	/* Contains the VM that will be used to render the RAM meter */
	var ramVM = new (function () {

		var self = this;

		/* observables needed to update the gauges */
		self.meterValues = {

			usageStartAngle: ko.observable(-1),
			usageEndAngle: ko.observable(-1),

			availableStartAngle: ko.observable(0),
			availableEndAngle: ko.observable(360),

			svgPath: ko.observable('M0,0'),

			strokeColor: ko.observable('grey')

		};

		self.counters = ko.observable([0, 0]); // [0] = total, [1] = available. kB

		self.used = ko.computed(function () {
			var cvals = self.counters();

			if (cvals && cvals.length === 2) {
				return cvals[0] - cvals[1];
			}

			return 0;
		});

		self.installed = ko.computed(function () {
			var cvals = self.counters();

			if (cvals && cvals.length === 2) {
				return cvals[0];
			}

			return 0;
		});

		self.installedMB = ko.computed(function () {

			return Math.floor(self.installed() / 1024);
		});

		self.usage = ko.computed(function() {

			var installed = self.installed();
			var used = self.used();

			if (installed > 0) {
				return Math.floor(100 * used / installed);
			}

			return 0;
		});
		
		// update the gauges values when the value changes
		self.usage.subscribe(function (newValue) {
			setTimeout(function(){
				var angle = Math.round(3.6 * newValue);

				// enforce min/max values
				angle = Math.min(angle, 360);
				angle = Math.max(angle, -360);

				self.meterValues.usageEndAngle(angle);
				self.meterValues.availableEndAngle(360);

				if (angle < 180) {
					self.meterValues.availableStartAngle(0);
				}
				else {
					self.meterValues.availableStartAngle(angle);
				}

				self.meterValues.svgPath(calculatePathSVG(32, angle, 8));
				self.meterValues.strokeColor(color(newValue));

			}, 1000);
			
		});
		
	})();

	var battVM = new (function () {

		var self = this;

		self.temperature = ko.observable(0);
		self.load = ko.observable(0);
		self.state = ko.observable(false);

		self.usage = ko.computed(function () {
			return Math.floor(self.load() * 100);
		});

		self.height = ko.computed(function () {
			return self.usage() + '%';
		});

		self.color = ko.computed(function () {

			var current = self.usage();

			if (current > 19) {
				return colors.green;
			}

			if (current > 10) {
				return colors.orange;
			}

			return colors.red;
		});
	})();

	var storageVM = new (function () {

		var self = this;
		self.internal = ko.observable([0, 0]);
		self.sd = ko.observable([0, 0]);
		self.hasExternal = ko.observable(false);

		self.totalInternalKB = ko.computed(function () {

			return self.internal()[0];
		});

		self.usedInternalKB = ko.computed(function () {

			var values = self.internal();
			return (values[0] - values[1]);
		});

		self.totalExternalKB = ko.computed(function () {

			return self.sd()[0];
		});

		self.usedExternalKB = ko.computed(function () {

			var values = self.sd();
			return values[0] - values[1];
		});

		self.usedInternal = ko.computed(function () {
			return tv.createSizeString(self.usedInternalKB() * 1024);
		});

		self.usedExternal = ko.computed(function () {

			return tv.createSizeString(self.usedExternalKB() * 1024);
		});

		self.totalExternal = ko.computed(function () {
			return tv.createSizeString(self.totalExternalKB() * 1024);
		});

		self.totalInternal = ko.computed(function () {
			return tv.createSizeString(self.totalInternalKB() * 1024);
		});

		self.usageInternal = ko.computed(function () {

			var totalInternal = self.totalInternalKB();

			if (totalInternal > 0) {
				return Math.floor(100 * self.usedInternalKB() / totalInternal);
			}

			return 0;
		});

		self.usageExternal = ko.computed(function () {

			var totalExternal = self.totalExternalKB();

			if (totalExternal > 0) {
				return Math.floor(100 * self.usedExternalKB() / totalExternal);
			}

			return 0;
		});

		self.widthInternal = ko.computed(function () {
			return self.usageInternal() + '%';
		});

		self.widthExternal = ko.computed(function () {
			return self.usageExternal() + '%';
		});

		self.translateColor = function (usage) {
			if (usage > 90) {
				return colors.red;
			}

			if (usage > 80) {
				return colors.orange;
			}

			return colors.green;
		};

		self.colorInternal = ko.computed(function () {
			return self.translateColor(self.usageInternal());
		});

		self.colorExternal = ko.computed(function () {
			return self.translateColor(self.usageExternal());
		});
	})();

	var wlanVM = new (function () {
		var self = this;

		self.ssid = ko.observable('');
		self.ip = ko.observable('');
		self.mac = ko.observable('');
		self.isOn = ko.observable(true);
		self.bluetooth = ko.observable(false);

		self.bluetoothStatus = ko.computed(function () {
			return self.bluetooth() ? TL.JS_RS_on : TL.JS_RS_off;
		});
		
	})();

	/* Traslates percent to colors */
	var color = function (current) {

		if (current > 80) {
			return colors.red;
		}

		if (current >= 61) {
			return colors.orange;
		}

		return colors.green;
	};

	/**
	*	Public interface
	*/
	return {
		/* Ensure the TV client cant call any callback here is no PF flag was set */
		getData: (!!PF.Monitoring) ? getData : $.noop,
		refreshDashboard: (!!PF.Monitoring) ? refreshDashboard : $.noop,
		setTabsApi: function (tabControlParam) {
			tabsApi = tabControlParam;

			dashboardTabIndex = tabsApi.getTabs().find('a[href="#tabDashboard"]').parent().index();

			// after the tab was showed, refresh the values
			tabsApi.onClick(function (event, newIndex) {
				if (newIndex === dashboardTabIndex) {
					refreshDashboard();
				}
			});
		},
		bind: function (htmlElement) {
			ko.applyBindings({
				cpu: cpuVM,
				ram: ramVM,
				battery: battVM,
				storage: storageVM,
				wlan: wlanVM
		}, htmlElement);
		}
	};
})(jQuery, window.ko, window.tv, window.PF, window.TL);