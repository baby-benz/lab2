/**
 * Created by ngyurjin on 8/10/2016.
 */

'use strict';

var g_viewModel;
var g_genInfoData;

moment.locale(window.navigator.language || "en");

function loadPage() {
    g_viewModel = function(){
        var
            genInfoData = ko.observable(),
            CPUMonitor = ko.observable(),
            RAMMonitor = ko.observable(),
            DRIVEMonitor = ko.observable(),

            activateManager = function(data) {
                postRequest("GeneralInfo/ButtonClick.cmd", data);
                console.log(data);
            };

        return {
            genInfoData: genInfoData,
            cpu : CPUMonitor,
            ram : RAMMonitor,
            drive : DRIVEMonitor,
            activateManager: activateManager
        }
    }();

    loadData();

    ko.applyBindings(g_viewModel);
};

function loadData()
{
    postRequest("GeneralInfo/PageLoadComplete.cmd", "",
        initData,
        function(error) { loadMockData(); } );
}

function loadMockData()
{
    // Load mock file with example data
    postRequest("../mockups/generalInformation.json", "", initData, initData);

    // Load mock file with empty data
    //postRequest("../mockups/generalInformation_empty.json", "", initData, initData);
}

function initData(data)
{
    data = JSON.parse(data);

    // Check if we got valid data
    if (!data.content)
    {
        return;
    }

    if (!g_genInfoData)
    {
        // Initialize view model data
        g_genInfoData = data.content;
    }
    else
    {
        // Replace members with new data
        var items = Object.keys(data.content);
        var itemCount = items.length;
        var index;
        for (index = 0; index < itemCount; index++)
        {
            g_genInfoData[items[index]] = data.content[items[index]];
        }
    }

    // Update monitors on Performance section (CPU, RAM, DRIVE)
    if(!g_genInfoData.CPUPercentage && !g_genInfoData.RAMPercentage && !g_genInfoData.DrivePercentage) {
        document.getElementById('performanceSection').style.display = 'none';
    } else {
        document.getElementById('performanceSection').style.display = 'block';
        updatePerfMonitors(g_genInfoData.CPUPercentage, g_genInfoData.RAMPercentage, g_genInfoData.DrivePercentage);
    }

    if (g_genInfoData.BiosContent && g_genInfoData.BiosDate) {
        g_genInfoData.BiosString = g_genInfoData.BiosContent + ", " + moment.utc(g_genInfoData.BiosDate, "YYYYMMDDHHmmSS.ffffff").format("L");
    } else {
        g_genInfoData.BiosString = "";
    }

    // Update the view model
    g_viewModel.genInfoData(g_genInfoData);

    //hide loading screen
    document.getElementById('loadingScreen').style.display = "none";
}

// Called by TeamViewer to trigger an update of the navigation buttons
function update(type)
{
    postRequest("GeneralInfo/GetPageData.cmd", type, initData);
}

function updatePerfMonitors(cpuValue, ramValue, driveValue) {
    if(!window.supportsVML ) {
        if(!cpuValue) {
            document.getElementById('cpuCircle').style.display = "none";
        } else {
            document.getElementById('cpuCircle').style.display = "block";
            g_viewModel.cpu(calculateMonitorMetrics("cpu", cpuValue));
        }

        if(!ramValue) {
            document.getElementById('ramCircle').style.display = "none";
        } else {
            document.getElementById('ramCircle').style.display = "block";
            g_viewModel.ram(calculateMonitorMetrics("ram", ramValue));
        }

        if(!driveValue) {
            document.getElementById('driveCircle').style.display = "none";
        } else {
            document.getElementById('driveCircle').style.display = "block";
            g_viewModel.drive(calculateMonitorMetrics("drive", driveValue));
        }

    } else {
        if(!cpuValue) {
            document.getElementById('cpuCircle').style.display = "none";
        } else {
            document.getElementById('cpuCircle').style.display = "block";
            updateVMLMetrics("varcCPUDiv", calculateMonitorMetrics("cpu", cpuValue));
        }

        if(!ramValue) {
            document.getElementById('ramCircle').style.display = "none";
        } else {
            document.getElementById('ramCircle').style.display = "block";
            updateVMLMetrics("varcRAMDiv", calculateMonitorMetrics("ram", ramValue));
        }

        if(!driveValue) {
            document.getElementById('driveCircle').style.display = "none";
        } else {
            document.getElementById('driveCircle').style.display = "block";
            updateVMLMetrics("varcDRIVEDiv", calculateMonitorMetrics("drive", driveValue));
        }
    }
}

function updateVMLMetrics(metric, value) {
    document.getElementById(metric).innerHTML =
        '<?import namespace = v urn = "urn:schemas-microsoft-com:vml" implementation = "#default#VML" declareNamespace />' +
        '<v:arc style="POSITION: absolute; WIDTH: 116px; HEIGHT: 116px; TOP: 10px; LEFT: 10px" startangle = "0" endangle = "' + value.usageEndAngle +
        '" coordsize = "21600,21600" fillcolor = "#FFFFFF" strokecolor = "' + value.strokeColor + '" strokeweight = "6pt" adj = ",,5400"></v:arc>';
}

function calculateMonitorMetrics(type, newValue) {
    var metrics =  {};
    var angle = Math.round(3.6 * newValue);
    var color = ColoringFor(type);

    // enforce min/max values
    angle = Math.min(angle, 360);
    angle = Math.max(angle, -360);

    metrics.usageEndAngle = angle;
    metrics.availableEndAngle = 360;

    if (angle < 180) {
        metrics.availableStartAngle = 0;
    }
    else {
        metrics.availableStartAngle = angle;
    }

    metrics.svgPath = calculatePathSVG(58, angle, 8, [68, 5]);

    metrics.strokeColor = color(newValue);

    return metrics;
}

/**
 *    Calculates the path to draw a circle with a radius and a base60 angle as main input.
 *
 *    @param {number} r            Outer-radius of the circle.
 *    @param {number} angle        Angle of the circle to be drawn.
 *    @param {number} lineWidth    Width of the line.
 *    @param {[number, number]}    pos    Upper coordinate of the circle. Optional.
 */

function calculatePathSVG(r, angle, lineWidth, pos) {

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
            r + 1 + lineWidth / 2, /* Initial x-coord */
            lineWidth / 2            /* Initial y-coord */
        ];
    }

    var svgPath = [
        'M ' + pos[0] + ',' + pos[1]    /* Move to pos[0], pos[1] */
    ];

    if (angle < 180) {
        svgPath.push('a' + r + ',' + r + ' 0 0 1 ' + x() + ',' + y());
        /* Draw the arc */
    }

    if (angle >= 180) {

        svgPath.push('a' + r + ',' + r + ' 0 1 1 0,' + 2 * r);
        /* Draw the first full half */
    }

    if (angle > 180) {

        svgPath.push('a' + r + ',' + r + ' 0 0 1 ' + (x() - 1) + ',' + y());
        /* Draw the from bottom middle to up */
    }

    return svgPath.join(' ');
};

function ColoringForRAM() {
    this.threshholdOne = 74;
    this.threshholdTwo = 89;
}

function ColoringForCPU() {
    this.threshholdOne = 59;
    this.threshholdTwo = 79;
}

function ColoringForDRIVE() {
    this.threshholdOne = 74;
    this.threshholdTwo = 89;
}

function ColoringFor(type) {
    var coloring;

    if(type === "ram") {
        coloring = new ColoringForRAM();
    } else if(type === "cpu") {
        coloring = new ColoringForCPU();
    } else if(type === "drive") {
        coloring = new ColoringForDRIVE();
    }

    return function(current){
        if (current > coloring.threshholdTwo) {
            return '#D0021B' ;
        }

        if (current > coloring.threshholdOne) {
            return '#FFd200';
        }

        return '#7DC855';
    }
}

function postRequest(url, data, success, error) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
        function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
    ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3)
        {
            if (xhr.status==200)
            {
                if (success) { success(xhr.responseText); }
            }
            else
            {
                if (error) { error(xhr.responseText); }
            }
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}
