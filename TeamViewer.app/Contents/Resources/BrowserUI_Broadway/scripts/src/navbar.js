/**
 * Created by ngyurjin on 8/10/2016.
 */
var g_viewModel;
var g_navBarData;

function loadNavbar() {
    g_viewModel = function(){
        var navBarData = ko.observable(),

            activateManager = function(data, event) {
                var target = event.target || event.srcElement;

                if(target.nodeName === 'A') {
                    postRequest("NavBar/ButtonClick.cmd", 'BackButton');
                } else {
                    postRequest("NavBar/FreeSpaceClick.cmd", '');
                }
            };

        return {
            navBarData: navBarData,
            activateManager: activateManager
        }
    }();

    loadData();

    ko.applyBindings(g_viewModel);
};

function loadData()
{
    postRequest("NavBar/PageLoadComplete.cmd", "",
        initData,
        function(error) { loadMockData(); } );
}

function loadMockData()
{
    // Load mock file with example data
    postRequest("./mockups/navbar.json", "", initData, initData);

    // Load mock file with empty data
    //postRequest("../mockups/navbar_empty.json", "", initData, initData);
}

// Called by TeamViewer to trigger an update of the navigation buttons
function update(type)
{
    postRequest("NavBar/GetPageData.cmd", type, initData);
}

function initData(data)
{
    data = JSON.parse(data);

    if (!g_navBarData)
    {
        // Initialize view model data
        g_navBarData = data.content;
    }
    else
    {
        // Replace members with new data
        var items = Object.keys(data.content);
        var itemCount = items.length;
        var index;
        for (index = 0; index < itemCount; index++)
        {
            $(g_navBarData).prop(items[index], data.content[items[index]]);
        }
    }

    // Update the view model
    g_viewModel.navBarData(g_navBarData);

    var panelHeight = document.getElementById('mainContainer').clientHeight + 16;
    postRequest("NavBar/SetPanelHeight.cmd", panelHeight.toString(), function(){});
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
