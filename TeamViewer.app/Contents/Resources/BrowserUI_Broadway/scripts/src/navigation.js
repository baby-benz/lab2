/**
 * Created by ngyurjin on 8/10/2016.
 */
'use strict';

function loadNavigation() {
    postRequest(
        "Navigation/PageLoadComplete.cmd", "",
        initNavigation,
        function(error) { loadMockData(); } );
}

function loadMockData()
{
    // Load mock file with example data
    postRequest("mockups/navigation.json", "", initNavigation, initNavigation);

    // Load mock file with empty data
    //postRequest("../mockups/navigation_empty.json", "", initNavigation, initNavigation);
}

function initNavigation(data) {
    var mainNavigation = document.getElementById('mainNavigation');
    var navItems = '';
    var pageCount;
    var page;
    var i;

    // Note: Response data from TeamViewer is always wrapped in a "content" object
    data = JSON.parse(data);

    for(i = 0, pageCount = data.content.pages.length; i < pageCount; i++) {
        page = data.content.pages[i];
        navItems += '' +
            '<li style="white-space: nowrap;" class="' + (page.active ? 'active': '') + '">' +
            '<a href="' + page.href + '">' + page.displayName + '</a>' +
            '</li>'
    }

    mainNavigation.innerHTML = navItems;

    // Note: changing innerHTML earlier for the browser to have time to render everything
    document.getElementById('dummyNavigation').innerHTML = navItems;

    if(document.addEventListener) {
        mainNavigation.addEventListener('click', function (event) {
            var target = event.target || event.srcElement;

            mainNavigation.querySelector('.active').className = '';
            target.parentNode.className = 'active';

            postRequest("Navigation/ShowPage.cmd", target.getAttribute('href'));

            event.preventDefault();
            event.stopPropagation();
        })
    } else if(document.attachEvent) {
        mainNavigation.attachEvent('onclick', function (event) {
            var target = event.target || event.srcElement;

            mainNavigation.querySelector('.active').className = '';
            target.parentNode.className = 'active';

            postRequest("Navigation/ShowPage.cmd", target.getAttribute('href'));

            event.returnValue = false;
            event.cancelBubble = true;
        })
    }

    //Update the panel width
    setTimeout(setPanelWidth, 150);
}

function setPanelWidth() {
    var panelWidth = calculateMaxPanelWidth();
    postRequest("Navigation/SetPanelWidth.cmd", panelWidth.toString(), function(){});
}

function calculateMaxPanelWidth() {
    var anchorList;
    var dummyNavigation = document.getElementById('dummyNavigation');
    var maxAnchorWidth = 0;
    var pageCount;
    var i;

    anchorList = dummyNavigation.querySelectorAll('a');

    for( i = 0, pageCount = anchorList.length; i < pageCount; i++ ) {
        if(anchorList[i].offsetWidth > maxAnchorWidth) {
            maxAnchorWidth = anchorList[i].offsetWidth;
        }
    }

    dummyNavigation.parentNode.removeChild(dummyNavigation);
    return (maxAnchorWidth < 150 ? 214 : maxAnchorWidth + 50);
}

function selectNavigationButton(data) {
    var mainNavigation = document.getElementById('mainNavigation');

    // Note: Response data from TeamViewer is always wrapped in a "content" object
    var data = JSON.parse(data);

    mainNavigation.querySelector('.active').className = '';
    mainNavigation.querySelector('a[href="' + data.content + '"]').parentNode.className = 'active';
}

// Called by TeamViewer to trigger an update of the navigation buttons
function update(type) {
    if (type == "Buttons") {
        // Request all available buttons
        postRequest("Navigation/GetButtons.cmd", "", initNavigation);
    } else if (type == "SelectedButton") {
        // Request selected navigation button
        postRequest(
            "Navigation/GetSelectedButton.cmd", "",
            selectNavigationButton,
            function(error) { postRequest("mockups/selectNavigationButton.json", "", selectNavigationButton); }
        );
    }
}

function postRequest(url, data, success, error) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
        function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
    ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3) {
            if (xhr.status==200) {
                if (success) { success(xhr.responseText); }
            } else {
                if (error) { error(xhr.responseText); }
            }
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}
