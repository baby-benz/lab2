/**
 * Created by ngyurjin on 8/10/2016.
 */

var g_viewModel;
var g_previewData;

function loadPage() {
    g_viewModel = function(){
        var previewData = ko.observable(),

            activateManager = function(data) {
                postRequest("Preview/ButtonClick.cmd", data);
                console.log(data);
            };

        return {
            previewData: previewData,
            activateManager: activateManager
        }
    }();

    loadData();

    ko.applyBindings(g_viewModel);
    makeTextResponsive();
};

function makeTextResponsive() {
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    if(width < 1080) {
        document.querySelector('#wrapper').style.width = '100%';
        document.querySelector('#wrapper .awarenessText').style.top = '5%';

        if(document.querySelector('.updateNow a')) {
            document.querySelector('.updateNow a').style.float = 'left';
        }
    } else {
        document.querySelector('#wrapper').style.width = '40%';
        document.querySelector('#wrapper .awarenessText').style.top = '37%';

        if(document.querySelector('.updateNow a')) {
            document.querySelector('.updateNow a').style.float = 'right';
        }
    }
}

function loadData()
{
    postRequest("Preview/PageLoadComplete.cmd", "",
        initData,
        function(error) { loadMockData(); } );
}

function loadMockData()
{
    // Load mock file with example data
    postRequest("../mockups/preview.json", "", initData, initData);

    // Load mock file with empty data
    //postRequest("../mockups/preview_empty.json", "", initData, initData);
}

// Called by TeamViewer to trigger an update of the navigation buttons
function update(type)
{
    postRequest("Preview/GetPageData.cmd", type, initData);
}

function initData(data)
{
    data = JSON.parse(data);

    // Check if we got valid data
    if (!data.content)
    {
        return;
    }

    if (!g_previewData)
    {
        // Initialize view model data
        g_previewData = data.content;
    }
    else
    {
        // Replace members with new data
        var items = Object.keys(data.content);
        var itemCount = items.length;
        var index;
        for (index = 0; index < itemCount; index++)
        {
            g_previewData[items[index]] = data.content[items[index]];
        }
    }

    // Update the view model
    g_viewModel.previewData(g_previewData);

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
