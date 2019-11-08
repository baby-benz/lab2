/**
 * Created by ngyurjin on 8/10/2016.
 */

var g_viewModel;
var g_devManagementData;

function loadPage() {
    g_viewModel = function(){
        var devManagementData = ko.observable(),

            activateManager = function(data) {
                postRequest("Devices/ButtonClick.cmd", data);
                console.log(data);
            };

        return {
            devManagementData: devManagementData,
            activateManager: activateManager
        }
    }();

    loadData();

    ko.applyBindings(g_viewModel);
};

function loadData()
{
    postRequest("Devices/PageLoadComplete.cmd", "",
        initData,
        function(error) { loadMockData(); } );
}

function loadMockData()
{
    // Load mock file with example data
    postRequest("../mockups/deviceManagement.json", "", initData, initData);

    // Load mock file with empty data
    //postRequest("../mockups/deviceManagement_empty.json", "", initData, initData);
}

// Called by TeamViewer to trigger an update of the navigation buttons
function update(type)
{
    postRequest("Devices/GetPageData.cmd", type, initData);
}

function initData(data)
{
    data = JSON.parse(data);

    // Check if we got valid data
    if (!data.content)
    {
        return;
    }

    if (!g_devManagementData)
    {
        // Initialize view model data
        g_devManagementData = data.content;
    }
    else
    {
        // Replace members with new data
        var items = Object.keys(data.content);
        var itemCount = items.length;
        var index;
        for (index = 0; index < itemCount; index++)
        {
            g_devManagementData[items[index]] = data.content[items[index]];
        }
    }

    // Update the view model
    g_viewModel.devManagementData(g_devManagementData);

    //hide loading screen
    document.getElementById('loadingScreen').style.display = "none";
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
