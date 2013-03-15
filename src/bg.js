///<reference path="chrome-api-vsdoc.js"/>

//each tab should have it's own port to interact with background(this) script
var tab2port = {};
//this one is used for timeout handling
var waitTimer;
//here we store active tab's update parameters
var updateParams;
//webRequest filter
var filter = new Object();

//load logs into array named logs
function load_logs(logUrl) {
    //get logfile from serverload_logs
    var req = new XMLHttpRequest();
    req.open("GET", logUrl, false, "admin", "admin");
    req.send(null);
    
    if (req.status == 200) var resp = req.responseText;
    else alert("Error executing XMLHttpRequest call!");

    //parse response into array of strings (log records)
    var logs = resp.split('\n');
    //handle the last empty string
    if (logs[logs.length - 1] == '')
        logs.length--;
    return logs;
}

//log filter function
function filter_logs(logs, format) { //dateOrder, incSyslogs, appName, logLevel) {
    //format members are:
    //dateOrder - old to new (true), or reverse (false)
    //incSyslogs - include system log records in result
    //appName - filter logs by application name
    //logLevel - array of strings, representing log levels needed in the filtered result. for example ['Error','Notice','Info']
    var flogs = new Array();    //array of filtered results
    //here goes the loop with some filtering conditions.
    for (var i = logs.length-1; i > 0; i--) {
        var fstr = logs[i].split(' ');
        if ((!format.appName && !format.includeSystemLogs) || (format.appName && format.appName + ':' == fstr[3]) || (fstr[3] && format.includeSystemLogs && fstr[3][fstr[3].length - 1] != ':')) {
            if(flogs.length>=1000)
				break;
			if (!format.logLevels.length) {
                flogs.push(logs[i]);
            } else {
                for (var j = 0; j < format.logLevels.length; j++) {
                    if (fstr[2] == format.logLevels[j] + ':') {
                        flogs.push(logs[i]);
                        break;
                    }
                }
            }
        }
    }
	//reverse logs array if dateOrder is set to true
    if (!format.oldestFirst) flogs.reverse();
    return flogs;
}

//handle connection from devtools in some tab
function panelConnected(prt) {
    //get active tab.
    var tabProps = new Object();
    tabProps.active = true;

    chrome.tabs.query(tabProps, function (tab) {
        tab = tab[0];
        //and save this connection port
        tab2port[tab.id] = prt;
        tab2port[tab.id].onMessage.addListener(processMsg);
        //emulate activeChanged event to set http requests hook
        activeTabChanged(tab.id, null);
    });
}

//process messaage from devtools
function processMsg(msg) {
    //this function is sending updated logs to active tab's devtools
    var tabProps = new Object();
    tabProps.active = true;

    updateParams = new Object();
    
    // if (msg.url) {
    //     updateParams.url = msg.url;
    //     updateParams.regExp = new RegExp(msg.url ? msg.url : null, 'i');
    // }

    chrome.tabs.query(tabProps, function (tab) {
        sendLogs(tab[0].id, msg);
        if (msg.timeout) {
            updateParams.timeout = msg.timeout;
            clearTimeout(waitTimer);
            waitTimer = setTimeout(function() {updateLogs(tab[0].id);}, updateParams.timeout);
        }
    });
}

//send logs
function sendLogs(tabid, format) {
    var flogs = filter_logs(load_logs(format.file),format);
    flogs.slice(-1000); //limit output to 1000 records
    tab2port[tabid].postMessage(flogs);
}

//handles tabs.onRemoved event
function tabRemoved(tabId, removeInfo) {
    //we must delete tab's port from array
    delete tab2port[tabId];
}


function activeTabChanged(tabId, selectInfo) {
    //chrome.tabs.activeChanged event handler
    if (tab2port[tabId]) {
        //if the  tab have devtools log parser initialized
        //set request filter
        clearTimeout(waitTimer);
        updateLogs(tabId);
        // tab2port[tabId].postMessage("update");
        // filter.tabId = tabId;
        // filter.urls = ["http://*/*"];
        //chrome.webRequest.onCompleted.removeListener(respCatcher);
        //chrome.webRequest.onCompleted.addListener(respCatcher, filter);
    } else {
        //else remove previous filter from previous active tab
        //chrome.webRequest.onCompleted.removeListener(respCatcher);
    }
}


//not used
// function respCatcher(details) {
//     //fired after responce from a web server (only for the active tab)     
//     if ((!updateParams.url && updateParams.timeout) || (updateParams.url && details.url.match(updateParams.regExp))) {
//         if (updateParams.timeout) {
//             clearTimeout(waitTimer);
//             waitTimer = setTimeout('updateLogs(' + details.tabId.toString() + ');', updateParams.timeout);
//         } else {
//             updateLogs(details.tabId);
//         }
//     }
// }


function updateLogs(tabId) {
    //alert("hello from "+tabId);
    //send command to devtools to update log list
    tab2port[tabId].postMessage("update");
}

chrome.extension.onConnect.addListener(panelConnected);
chrome.tabs.onRemoved.addListener(tabRemoved);
chrome.tabs.onActiveChanged.addListener(activeTabChanged);